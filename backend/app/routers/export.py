from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from datetime import datetime
from app.core.persistence import load_data, save_data
import pandas as pd
import io
import unicodedata
from difflib import get_close_matches
import csv
from pathlib import Path
from fastapi.responses import FileResponse

router = APIRouter(prefix="/export", tags=["export"])

# -----------------------------------------------------------
# 🧱 MODELOS DE DATOS
# -----------------------------------------------------------
class ExportRequest(BaseModel):
    formatoImport: str
    formatoExport: str
    empresa: str
    fechaFactura: str
    proyecto: str
    cuenta: str
    ficheroNombre: str
    usuario: str


# -----------------------------------------------------------
# 🧾 ENDPOINT SIMPLE DE REGISTRO (ya existente)
# -----------------------------------------------------------
@router.post("")
def registrar_export(req: ExportRequest):
    data = load_data()

    try:
        nueva = {
            "fecha": datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
            "formatoImport": req.formatoImport,
            "formatoExport": req.formatoExport,
            "empresa": req.empresa,
            "fechaFactura": req.fechaFactura,
            "proyecto": req.proyecto,
            "cuenta": req.cuenta,
            "ficheroNombre": req.ficheroNombre,
            "usuario": req.usuario,
        }

        # Actualiza datos persistentes
        data["ultimoExport"] = datetime.now().strftime("%d/%m/%Y")
        data["totalExportaciones"] = data.get("totalExportaciones", 0) + 1
        save_data(data)

        print("🧾 Nueva exportación:", nueva)
        return {
            "message": "Exportación registrada correctamente",
            "export": nueva,
            "ultimoExport": data["ultimoExport"],
            "totalExportaciones": data["totalExportaciones"],
        }

    except Exception as e:
        data["totalExportacionesFallidas"] = data.get("totalExportacionesFallidas", 0) + 1
        save_data(data)
        raise HTTPException(status_code=400, detail=f"Error registrando exportación: {e}")


# -----------------------------------------------------------
# 🔧 FUNCIONES AUXILIARES
# -----------------------------------------------------------
def normalizar_texto(texto: str) -> str:
    if not isinstance(texto, str):
        return ""
    texto = texto.strip().lower()
    texto = "".join(
        c for c in unicodedata.normalize("NFD", texto) if unicodedata.category(c) != "Mn"
    )
    return texto


def cargar_excel(file: UploadFile) -> pd.DataFrame:
    """Lee un archivo Excel a DataFrame normalizado."""
    contents = file.file.read()
    df = pd.read_excel(io.BytesIO(contents))
    df.columns = [normalizar_texto(c) for c in df.columns]
    return df


def guardar_csv(df: pd.DataFrame, nombre: str) -> str:
    output_dir = Path("exports")
    output_dir.mkdir(exist_ok=True)
    file_path = output_dir / nombre
    df.to_csv(file_path, index=False, sep=";", quoting=csv.QUOTE_NONNUMERIC)
    return str(file_path)


# -----------------------------------------------------------
# 🚀 NUEVO ENDPOINT: /export/start
# -----------------------------------------------------------
@router.post("/start")
async def start_export(
    formatoImport: str = Form(...),
    formatoExport: str = Form(...),
    empresa: str = Form(...),
    fechaFactura: str = Form(...),
    proyecto: str = Form(...),
    cuenta: str = Form(...),
    usuario: str = Form(...),
    ficheroSesiones: UploadFile = File(...),
    ficheroContactos: UploadFile = File(...),
):
    """
    Procesa los dos ficheros subidos:
    - Sesiones (facturas)
    - Contactos (clientes)
    Conciliación + generación de CSV final
    """
    data = load_data()
    try:
        # -----------------------------------
        # 1️⃣ CARGAR ARCHIVOS
        # -----------------------------------
        df_ses = cargar_excel(ficheroSesiones)
        df_con = cargar_excel(ficheroContactos)

        if df_ses.empty or df_con.empty:
            raise HTTPException(status_code=400, detail="Alguno de los archivos está vacío")

        # -----------------------------------
        # 2️⃣ DETECTAR COLUMNAS CLAVE
        # -----------------------------------
        cols_sesiones = df_ses.columns.tolist()
        cols_contactos = df_con.columns.tolist()

        col_nombre_ses = next((c for c in cols_sesiones if "nombre" in c or "cliente" in c or "razon" in c), None)
        col_nif_ses = next((c for c in cols_sesiones if "nif" in c or "cif" in c), None)
        col_nombre_con = next((c for c in cols_contactos if "nombre" in c or "cliente" in c or "razon" in c), None)
        col_nif_con = next((c for c in cols_contactos if "nif" in c or "cif" in c), None)

        if not col_nombre_ses or not col_nombre_con:
            raise HTTPException(status_code=400, detail="No se encontró columna de nombre en alguno de los archivos")

        # -----------------------------------
        # 3️⃣ NORMALIZAR Y CONCILIAR
        # -----------------------------------
        df_ses["nombre_norm"] = df_ses[col_nombre_ses].apply(normalizar_texto)
        df_ses["nif_norm"] = (
            df_ses[col_nif_ses].fillna("").apply(normalizar_texto) if col_nif_ses else ""
        )
        df_con["nombre_norm"] = df_con[col_nombre_con].apply(normalizar_texto)
        df_con["nif_norm"] = (
            df_con[col_nif_con].fillna("").apply(normalizar_texto) if col_nif_con else ""
        )

        # Crear diccionarios para buscar rápidamente por NIF o nombre
        mapa_contactos = {row["nif_norm"]: row for _, row in df_con.iterrows() if row["nif_norm"]}
        mapa_nombres = {row["nombre_norm"]: row for _, row in df_con.iterrows()}

        enriched_rows = []
        for _, row in df_ses.iterrows():
            contacto = None

            # Buscar por NIF exacto
            if row["nif_norm"] and row["nif_norm"] in mapa_contactos:
                contacto = mapa_contactos[row["nif_norm"]]
            else:
                # Buscar por similitud de nombre
                candidatos = get_close_matches(row["nombre_norm"], mapa_nombres.keys(), n=1, cutoff=0.85)
                if candidatos:
                    contacto = mapa_nombres[candidatos[0]]

            # Fusionar información
            out = row.to_dict()
            if contacto is not None:
                for key in contacto.keys():
                    if key not in out or pd.isna(out[key]) or out[key] == "":
                        out[key] = contacto[key]

            # Rellenar campos extra
            out["empresa"] = empresa
            out["proyecto"] = proyecto
            out["cuenta_contable"] = cuenta
            out["fecha_factura"] = fechaFactura

            enriched_rows.append(out)

        df_final = pd.DataFrame(enriched_rows)

        # -----------------------------------
        # 4️⃣ GUARDAR CSV FINAL
        # -----------------------------------
        nombre_csv = f"export_{empresa.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        path_csv = guardar_csv(df_final, nombre_csv)

        # -----------------------------------
        # 5️⃣ ACTUALIZAR ESTADÍSTICAS
        # -----------------------------------
        data["ultimoExport"] = datetime.now().strftime("%d/%m/%Y")
        data["totalExportaciones"] = data.get("totalExportaciones", 0) + 1
        save_data(data)

        print(f"✅ Exportación completada: {path_csv}")

        return {
            "message": "Exportación completada correctamente",
            "archivo_generado": nombre_csv,
            "ultimoExport": data["ultimoExport"],
            "totalExportaciones": data["totalExportaciones"],
        }

    except Exception as e:
        data["totalExportacionesFallidas"] = data.get("totalExportacionesFallidas", 0) + 1
        save_data(data)
        raise HTTPException(status_code=500, detail=f"Error en exportación: {e}")


# -----------------------------------------------------------
# 📥 DESCARGAR CSV FINAL
# -----------------------------------------------------------
@router.get("/download/{filename}")
def descargar_csv(filename: str):
    """Permite descargar el CSV generado."""
    file_path = Path("exports") / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return FileResponse(
        file_path,
        media_type="text/csv",
        filename=filename,
    )

