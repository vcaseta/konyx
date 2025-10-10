from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, StreamingResponse
from app.core.persistence import load_data, save_data
from datetime import datetime
import pandas as pd
import io, os, json, time, re

router = APIRouter(prefix="/export", tags=["export"])

# --------------------------------------------
# 🛰️ STREAM DE PROGRESO (SSE)
# --------------------------------------------
progress_log: list[str] = []


def log_step(text: str):
    progress_log.append(text)
    print("📡", text)


def progress_stream():
    """Envía logs de progreso al frontend en tiempo real"""
    for step in progress_log:
        yield f"data: {json.dumps({'step': step})}\n\n"
        time.sleep(0.8)
    yield "event: end\ndata: {}\n\n"


@router.get("/progress")
async def export_progress():
    return StreamingResponse(progress_stream(), media_type="text/event-stream")


# --------------------------------------------
# 🧮 FUNCIONES DE VALIDACIÓN
# --------------------------------------------
def detectar_formato_sesiones(df: pd.DataFrame) -> str:
    cols = [c.strip().lower() for c in df.columns]
    if all(any(ec in c for c in cols) for ec in ["fecha", "iva", "total"]):
        return "Eholo"
    gestor_cols = [
        "fecha factura", "numero factura", "nombre", "nif",
        "concepto", "importe base", "iva", "irpf", "total"
    ]
    matches = sum(any(gc in c for c in cols) for gc in gestor_cols)
    if matches >= 6:
        return "Gestoría"
    return "Desconocido"


def validar_contactos(df: pd.DataFrame):
    cols = [c.strip().lower() for c in df.columns]
    requeridos = ["nombre", "nif", "email"]
    if not any(r in cols for r in requeridos):
        raise HTTPException(status_code=400, detail="El archivo de contactos no tiene columnas válidas (nombre, NIF o email).")


# --------------------------------------------
# 🚀 ENDPOINT PRINCIPAL DE EXPORTACIÓN REAL
# --------------------------------------------
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
    progress_log.clear()
    log_step("Iniciando proceso de exportación...")

    try:
        # ----------------------------
        # 1️⃣ Leer ficheros Excel
        # ----------------------------
        sesiones_bytes = await ficheroSesiones.read()
        contactos_bytes = await ficheroContactos.read()
        df_ses = pd.read_excel(io.BytesIO(sesiones_bytes))
        df_con = pd.read_excel(io.BytesIO(contactos_bytes))
        log_step("Archivos cargados correctamente.")

        # ----------------------------
        # 2️⃣ Validar formato de sesiones
        # ----------------------------
        tipo_detectado = detectar_formato_sesiones(df_ses)
        if tipo_detectado == "Desconocido":
            raise HTTPException(status_code=400, detail="El archivo de sesiones no tiene un formato válido (Eholo o Gestoría).")
        log_step(f"Formato de sesiones detectado: {tipo_detectado}")

        # ----------------------------
        # 3️⃣ Validar archivo de contactos
        # ----------------------------
        validar_contactos(df_con)
        log_step("Formato de contactos validado correctamente.")

        # ----------------------------
        # 4️⃣ Limpieza y normalización
        # ----------------------------
        df_ses.columns = [re.sub(r"\s+", " ", c.strip().lower()) for c in df_ses.columns]
        df_con.columns = [re.sub(r"\s+", " ", c.strip().lower()) for c in df_con.columns]

        if "nif" in df_con.columns:
            df_con["nif"] = df_con["nif"].astype(str).str.upper().str.strip()
        if "nombre" in df_con.columns:
            df_con["nombre"] = df_con["nombre"].astype(str).str.strip().str.lower()

        if "nif" in df_ses.columns:
            df_ses["nif"] = df_ses["nif"].astype(str).str.upper().str.strip()
        if "nombre" in df_ses.columns:
            df_ses["nombre"] = df_ses["nombre"].astype(str).str.strip().str.lower()

        log_step("Datos normalizados correctamente.")

        # ----------------------------
        # 5️⃣ Unión inteligente
        # ----------------------------
        join_key = "nif" if "nif" in df_con.columns and "nif" in df_ses.columns else "nombre"
        merged = pd.merge(df_ses, df_con, how="left", on=join_key)
        log_step(f"Datos conciliados por columna '{join_key}'.")

        # ----------------------------
        # 6️⃣ Completar campos
        # ----------------------------
        merged["fecha factura"] = fechaFactura
        merged["empresa"] = empresa
        merged["proyecto"] = proyecto
        merged["cuenta contable"] = cuenta
        merged["usuario export"] = usuario

        log_step("Campos adicionales aplicados (empresa, proyecto, cuenta, fecha).")

        # ----------------------------
        # 7️⃣ Generar CSV
        # ----------------------------
        os.makedirs("./app/exports", exist_ok=True)
        filename = f"export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        filepath = f"./app/exports/{filename}"

        columnas_csv = [
            c for c in [
                "fecha factura", "numero factura", "nombre", "nif", "concepto",
                "importe base", "iva", "irpf", "total", "empresa",
                "proyecto", "cuenta contable", "usuario export"
            ] if c in merged.columns
        ]

        merged.to_csv(filepath, index=False, encoding="utf-8-sig", columns=columnas_csv)
        log_step("Archivo CSV generado correctamente.")

        # ----------------------------
        # 8️⃣ Actualizar métricas
        # ----------------------------
        data = load_data()
        data["ultimoExport"] = datetime.now().strftime("%d/%m/%Y")
        data["totalExportaciones"] = data.get("totalExportaciones", 0) + 1
        save_data(data)
        log_step("Estadísticas actualizadas correctamente.")
        log_step("✅ Exportación finalizada.")

        return {
            "message": "Exportación completada correctamente",
            "archivo_generado": filename,
            "ultimoExport": data["ultimoExport"],
            "totalExportaciones": data["totalExportaciones"]
        }

    except Exception as e:
        data = load_data()
        data["totalExportacionesFallidas"] = data.get("totalExportacionesFallidas", 0) + 1
        save_data(data)
        log_step(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Error procesando exportación: {e}")


# --------------------------------------------
# 📂 DESCARGA DEL CSV
# --------------------------------------------
@router.get("/download/{filename}")
async def download_csv(filename: str):
    path = f"./app/exports/{filename}"
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return FileResponse(path, media_type="text/csv", filename=filename)
