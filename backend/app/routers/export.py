from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from app.core.persistence import load_data, save_data
from datetime import datetime
import pandas as pd
import io, os, json, time, re
from typing import List, Dict, Any

# --- GPT / OpenAI ---
import openai
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

router = APIRouter(prefix="/export", tags=["export"])

# -----------------------------------------------------------
# 🧾 (Se mantiene para compatibilidad) Registro simple /export
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

@router.post("")
def registrar_export(req: ExportRequest):
    data = load_data()
    try:
        nueva = {
            "fecha": datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
            **req.dict(),
        }
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
# 📡 PROGRESO EN TIEMPO REAL (SSE)
# -----------------------------------------------------------
progress_log: List[str] = []
progress_done: bool = False

def log_step(text: str):
    progress_log.append(text)
    print("📡", text)

def progress_stream():
    """
    Emite los mensajes a medida que se agregan a progress_log.
    Mantiene la conexión hasta que progress_done sea True.
    """
    idx = 0
    # Espera activa simple; suficiente para un proceso por usuario
    while True:
        while idx < len(progress_log):
            step = progress_log[idx]
            yield f"data: {json.dumps({'step': step})}\n\n"
            idx += 1
        if progress_done:
            break
        time.sleep(0.4)
    yield "event: end\ndata: {}\n\n"

@router.get("/progress")
async def export_progress():
    return StreamingResponse(progress_stream(), media_type="text/event-stream")

# -----------------------------------------------------------
# 🧮 VALIDACIONES Y DETECCIÓN DE FORMATO
# -----------------------------------------------------------
def detectar_formato_sesiones(df: pd.DataFrame) -> str:
    cols = [c.strip().lower() for c in df.columns]
    # Eholo: presencia de "fecha", "iva", "total"
    if all(any(ec in c for c in cols) for ec in ["fecha", "iva", "total"]):
        return "Eholo"
    # Gestoría: coincidencia de la mayoría de estos
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
    # Debe tener al menos uno de identificadores fuertes
    if not any(k in cols for k in ["nif", "cif", "email", "correo", "nombre"]):
        raise HTTPException(
            status_code=400,
            detail="El archivo de contactos no tiene columnas válidas (nombre, NIF/CIF o email)."
        )

# -----------------------------------------------------------
# 🧠 MÓDULO GPT: ANÁLISIS DE ESTRUCTURA
# -----------------------------------------------------------
def analizar_tablas_gpt(df_ses: pd.DataFrame, df_con: pd.DataFrame) -> Dict[str, Any] | None:
    """
    Solicita a GPT un mapeo de columnas y clave de unión.
    Envía solo muestras (primeras filas) para privacidad.
    """
    try:
        muestras_ses = df_ses.head(10).fillna("").to_dict(orient="records")
        muestras_con = df_con.head(10).fillna("").to_dict(orient="records")

        system_msg = "Eres un experto en conciliación contable y análisis tabular."
        user_msg = f"""
Analiza estas dos tablas: sesiones (facturas emitidas) y contactos (clientes).
Devuelve SOLO un JSON con esta estructura exacta (sin texto adicional):
{{
  "join_key": "nif|nombre|email",
  "fields": {{
    "nombre": ["posibles encabezados en ambas tablas"],
    "nif": ["..."],
    "email": ["..."],
    "fecha": ["fecha", "fecha factura", "..."],
    "importe": ["importe base", "total", "..."],
    "iva": ["iva", "..."],
    "irpf": ["irpf", "..."],
    "concepto": ["concepto", "descripcion", "..."],
    "numero factura": ["numero factura", "num", "factura", "..."]
  }},
  "csv_columns": ["fecha", "numero factura", "nombre", "nif", "concepto", "importe", "iva", "irpf", "empresa", "proyecto", "cuenta contable", "usuario export"]
}}

Sesiones:
{muestras_ses}

Contactos:
{muestras_con}
"""

        completion = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_msg}
            ],
            temperature=0.2
        )

        resp = completion.choices[0].message.content
        json_text = resp[resp.find("{"):resp.rfind("}") + 1]
        data = json.loads(json_text)
        return data
    except Exception as e:
        print("⚠️ Error en analizar_tablas_gpt:", e)
        return None

# -----------------------------------------------------------
# ✏️ MÓDULO GPT: CORRECCIÓN / RELLENO DE DATOS
# -----------------------------------------------------------
def detectar_cambios(df_original: pd.DataFrame, df_corregido: pd.DataFrame, prefix: str = "") -> List[str]:
    """Compara dos DataFrames y retorna lista de diferencias legibles."""
    cambios = []
    # Asegurar mismas columnas para comparación básica
    comunes = [c for c in df_original.columns if c in df_corregido.columns]
    for col in comunes:
        orig_col = df_original[col].fillna("")
        corr_col = df_corregido[col].fillna("")
        lim = min(len(orig_col), len(corr_col))
        for i in range(lim):
            o = str(orig_col.iloc[i]).strip()
            c = str(corr_col.iloc[i]).strip()
            if o == "" and c != "":
                cambios.append(f"🧾 {prefix}Campo '{col}' rellenado con '{c}' (fila {i+1})")
            elif o != c:
                cambios.append(f"✏️ {prefix}'{col}' corregido de '{o}' → '{c}' (fila {i+1})")
    return cambios

def corregir_datos_con_gpt(df_ses: pd.DataFrame, df_con: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Envía muestras a GPT para normalizar:
    - fechas, NIF/CIF, emails
    - nombres, acentos, espacios
    - importes numéricos
    - completado de campos deducibles
    Devuelve los DataFrames corregidos. Loguea correcciones en progress_log.
    """
    try:
        # (Opcional) anonimización rápida: comentar si no quieres ocultar nada
        df_ses_samp = df_ses.head(15).copy()
        df_con_samp = df_con.head(15).copy()

        muestras_ses = df_ses_samp.fillna("").to_dict(orient="records")
        muestras_con = df_con_samp.fillna("").to_dict(orient="records")

        system_msg = "Eres un experto en limpieza y conciliación de datos contables."
        user_msg = f"""
Corrige y completa datos de facturas (sesiones) y contactos.
- Normaliza fechas (dd/mm/yyyy), NIF/CIF (mayúsculas, sin espacios), emails (minúsculas).
- Corrige nombres mal escritos cuando sea obvio.
- Convierte importes a números (puntos decimales).
- Si falta un campo y puede deducirse (por NIF o nombre), complétalo.
Devuelve SOLO un JSON con:
{{
 "sesiones": [registros corregidos de sesiones, con mismas claves que la muestra],
 "contactos": [registros corregidos de contactos, con mismas claves que la muestra],
 "correcciones": ["lista opcional de descripciones de cambios aplicados"]
}}

Sesiones:
{muestras_ses}

Contactos:
{muestras_con}
"""
        completion = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_msg}
            ],
            temperature=0.2
        )
        resp = completion.choices[0].message.content
        json_text = resp[resp.find("{"):resp.rfind("}") + 1]
        data = json.loads(json_text)

        df_ses_corr = pd.DataFrame(data.get("sesiones", muestras_ses))
        df_con_corr = pd.DataFrame(data.get("contactos", muestras_con))

        # Detectar cambios (en la muestra) y loguear
        cambios = detectar_cambios(pd.DataFrame(muestras_ses), df_ses_corr, prefix="Sesión: ")
        cambios += detectar_cambios(pd.DataFrame(muestras_con), df_con_corr, prefix="Contacto: ")
        if "correcciones" in data:
            cambios += [f"🤖 {c}" for c in data["correcciones"]]

        # Limitar para no saturar la UI
        for c in cambios[:60]:
            log_step(c)
        log_step(f"✅ GPT completó {len(cambios)} correcciones automáticas en la muestra.")

        # Mezclar correcciones de la muestra en los DF completos (por índice)
        # Si prefieres aplicar las correcciones solo como guía, omite esta mezcla.
        df_ses.update(df_ses_corr)  # aplica por coincidencia de columnas/índices
        df_con.update(df_con_corr)

        return df_ses, df_con

    except Exception as e:
        log_step(f"⚠️ Error al corregir datos con GPT: {e}")
        return df_ses, df_con

# -----------------------------------------------------------
# 🚀 EXPORTACIÓN REAL: SUBIDA 2 FICHEROS + GPT + CSV
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
    global progress_done
    progress_log.clear()
    progress_done = False
    log_step("🔄 Iniciando proceso de exportación...")

    try:
        # 1) Leer ficheros
        sesiones_bytes = await ficheroSesiones.read()
        contactos_bytes = await ficheroContactos.read()
        df_ses = pd.read_excel(io.BytesIO(sesiones_bytes))
        df_con = pd.read_excel(io.BytesIO(contactos_bytes))
        log_step("📁 Archivos leídos correctamente.")

        # 2) Validar formatos
        tipo_detectado = detectar_formato_sesiones(df_ses)
        if tipo_detectado == "Desconocido":
            progress_done = True
            raise HTTPException(status_code=400, detail="El archivo de sesiones no cumple formatos Eholo/Gestoría.")
        validar_contactos(df_con)
        log_step(f"🔎 Formato de sesiones detectado: {tipo_detectado}")
        log_step("✅ Formato de contactos válido.")

        # 3) Normalización básica
        df_ses.columns = [re.sub(r"\s+", " ", c.strip().lower()) for c in df_ses.columns]
        df_con.columns = [re.sub(r"\s+", " ", c.strip().lower()) for c in df_con.columns]

        for col in ["nif", "cif"]:
            if col in df_ses.columns:
                df_ses[col] = df_ses[col].astype(str).str.upper().str.replace(r"\s+", "", regex=True)
            if col in df_con.columns:
                df_con[col] = df_con[col].astype(str).str.upper().str.replace(r"\s+", "", regex=True)

        for col in ["email", "correo"]:
            if col in df_ses.columns:
                df_ses[col] = df_ses[col].astype(str).str.strip().str.lower()
            if col in df_con.columns:
                df_con[col] = df_con[col].astype(str).str.strip().str.lower()

        if "nombre" in df_ses.columns:
            df_ses["nombre"] = df_ses["nombre"].astype(str).str.strip().str.lower()
        if "nombre" in df_con.columns:
            df_con["nombre"] = df_con["nombre"].astype(str).str.strip().str.lower()

        log_step("🧹 Normalización inicial aplicada.")

        # 4) Corrección/relleno con GPT (muestra) + log de cambios
        log_step("🧠 Analizando y corrigiendo datos con GPT...")
        df_ses, df_con = corregir_datos_con_gpt(df_ses, df_con)
        log_step("✅ Datos corregidos/normalizados por GPT.")

        # 5) Análisis de mapeo con GPT (renombrado y join sugerido)
        log_step("📐 Solicitando a GPT mapeo de columnas y clave de unión...")
        mapeo = analizar_tablas_gpt(df_ses, df_con)
        if mapeo:
            fields = mapeo.get("fields", {})
            # renombrar según sugerencias
            for campo, posibles in fields.items():
                for nombre in posibles:
                    nl = str(nombre).strip().lower()
                    if nl in df_ses.columns:
                        df_ses.rename(columns={nl: campo}, inplace=True)
                    if nl in df_con.columns:
                        df_con.rename(columns={nl: campo}, inplace=True)
            join_key = mapeo.get("join_key", "nif")
            csv_cols_sugeridas = mapeo.get("csv_columns", [])
            log_step(f"🧭 GPT sugiere unir por '{join_key}'.")
        else:
            join_key = "nif" if "nif" in df_ses.columns and "nif" in df_con.columns else "nombre"
            csv_cols_sugeridas = []
            log_step("⚠️ No se obtuvo mapeo de GPT. Usando unión estándar.")

        # 6) Unión de datos
        if join_key not in df_ses.columns or join_key not in df_con.columns:
            # Fallback si falta join_key
            join_key = "nif" if "nif" in df_ses.columns and "nif" in df_con.columns else "nombre"
            log_step(f"♻️ Ajustando clave de unión a '{join_key}' por disponibilidad de columnas.")

        merged = pd.merge(df_ses, df_con, how="left", on=join_key)
        log_step(f"🔗 Datos conciliados por '{join_key}'.")

        # 7) Campos extra del usuario
        merged["fecha"] = merged.get("fecha", merged.get("fecha factura", ""))
        merged["fecha"] = merged["fecha"].fillna("")
        if isinstance(fechaFactura, str) and fechaFactura.strip():
            # Si el usuario quiere forzar fecha de factura, la aplicamos
            merged["fecha"] = fechaFactura

        merged["empresa"] = empresa
        merged["proyecto"] = proyecto
        merged["cuenta contable"] = cuenta
        merged["usuario export"] = usuario
        log_step("🧾 Campos de contexto aplicados (empresa, proyecto, cuenta, fecha, usuario).")

        # 8) Selección de columnas para CSV
        columnas_objetivo = [
            "fecha", "numero factura", "nombre", "nif", "concepto",
            "importe", "iva", "irpf", "empresa", "proyecto", "cuenta contable", "usuario export"
        ]

        # Compatibilidad con esquemas comunes
        # Intentar mapear importes si vienen con nombres diferentes
        if "importe" not in merged.columns:
            if "importe base" in merged.columns:
                merged["importe"] = merged["importe base"]
            elif "total" in merged.columns:
                merged["importe"] = merged["total"]

        if "numero factura" not in merged.columns:
            for alt in ["numero", "num", "factura", "nº factura", "n factura", "número factura"]:
                if alt in merged.columns:
                    merged.rename(columns={alt: "numero factura"}, inplace=True)
                    break

        # Si GPT sugirió columnas específicas, las priorizamos
        if csv_cols_sugeridas:
            columnas_csv = [c for c in csv_cols_sugeridas if c in merged.columns]
            # Asegurar que los extras también entren
            for extra in ["empresa", "proyecto", "cuenta contable", "usuario export"]:
                if extra not in columnas_csv and extra in merged.columns:
                    columnas_csv.append(extra)
        else:
            columnas_csv = [c for c in columnas_objetivo if c in merged.columns]

        # 9) Generar CSV
        os.makedirs("./app/exports", exist_ok=True)
        filename = f"export_{empresa.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        filepath = f"./app/exports/{filename}"

        merged.to_csv(filepath, index=False, encoding="utf-8-sig", columns=columnas_csv)
        log_step("💾 CSV generado correctamente.")

        # 10) Métricas
        data = load_data()
        data["ultimoExport"] = datetime.now().strftime("%d/%m/%Y")
        data["totalExportaciones"] = data.get("totalExportaciones", 0) + 1
        save_data(data)
        log_step("📈 Estadísticas actualizadas.")
        log_step("✅ Exportación finalizada.")

        progress_done = True
        return {
            "message": "Exportación completada correctamente",
            "archivo_generado": filename,
            "ultimoExport": data["ultimoExport"],
            "totalExportaciones": data["totalExportaciones"]
        }

    except HTTPException:
        progress_done = True
        raise
    except Exception as e:
        data = load_data()
        data["totalExportacionesFallidas"] = data.get("totalExportacionesFallidas", 0) + 1
        save_data(data)
        progress_done = True
        log_step(f"❌ Error: {e}")
        raise HTTPException(status_code=400, detail=f"Error procesando exportación: {e}")

# -----------------------------------------------------------
# 📥 DESCARGAR CSV FINAL
# -----------------------------------------------------------
@router.get("/download/{filename}")
async def download_csv(filename: str):
    path = f"./app/exports/{filename}"
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return FileResponse(path, media_type="text/csv", filename=filename)
