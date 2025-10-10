from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
import pandas as pd
import io, os, json, requests
from datetime import datetime
from dotenv import load_dotenv
from typing import Generator

load_dotenv()

router = APIRouter(prefix="/export", tags=["export"])

# 🔑 Clave de Groq (añádela en tu .env)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


# -----------------------------------------------------------
# 🔄 SISTEMA DE STREAMING DE PROGRESO (SSE)
# -----------------------------------------------------------
progress_log: list[str] = []


def log_step(msg: str):
    """Guarda un paso en el log para que el frontend lo muestre."""
    print(msg)
    progress_log.append(f"{datetime.now().strftime('%H:%M:%S')} - {msg}")


def stream_progress() -> Generator[str, None, None]:
    """Emite los mensajes de progreso uno a uno."""
    last_index = 0
    while True:
        if last_index < len(progress_log):
            for msg in progress_log[last_index:]:
                yield f"data: {msg}\n\n"
            last_index = len(progress_log)
        import time
        time.sleep(0.5)


@router.get("/progress")
def get_progress_stream():
    """Endpoint que usa el PanelExport para leer los pasos en tiempo real."""
    return StreamingResponse(stream_progress(), media_type="text/event-stream")


# -----------------------------------------------------------
# 🧠 FUNCIÓN DE CORRECCIÓN CON GROQ
# -----------------------------------------------------------
def corregir_datos_con_groq(df_ses, df_con):
    """
    Usa el modelo Llama 3 (Groq) para limpiar y corregir datos de sesiones y contactos.
    """
    try:
        muestras_ses = df_ses.head(15).fillna("").to_dict(orient="records")
        muestras_con = df_con.head(15).fillna("").to_dict(orient="records")

        prompt = f"""
Eres un experto en datos contables. Corrige y completa los siguientes registros.
Devuelve un JSON con:
{{
 "sesiones": [...],
 "contactos": [...],
 "correcciones": ["Descripción de cada cambio"]
}}

Registros de facturas/sesiones:
{json.dumps(muestras_ses, ensure_ascii=False)}

Registros de contactos:
{json.dumps(muestras_con, ensure_ascii=False)}

Instrucciones:
- Corrige errores tipográficos en nombres y NIF.
- Normaliza fechas al formato dd/mm/yyyy.
- Rellena valores faltantes si se pueden inferir.
- Asegúrate de que importes y totales sean numéricos.
"""

        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": "llama3-70b-8192",
            "temperature": 0.3,
            "messages": [
                {"role": "system", "content": "Eres un experto en limpieza de datos contables."},
                {"role": "user", "content": prompt},
            ],
        }

        log_step("🤖 Enviando datos a Groq para corrección automática...")
        r = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
        r.raise_for_status()

        respuesta = r.json()["choices"][0]["message"]["content"]
        json_text = respuesta[respuesta.find("{") : respuesta.rfind("}") + 1]
        data = json.loads(json_text)

        df_ses_corr = pd.DataFrame(data.get("sesiones", []))
        df_con_corr = pd.DataFrame(data.get("contactos", []))

        # Mostrar correcciones en tiempo real
        for c in data.get("correcciones", [])[:30]:
            log_step(f"✏️ {c}")

        log_step(f"✅ Corrección completada por Groq ({len(data.get('correcciones', []))} cambios).")
        return df_ses_corr, df_con_corr

    except Exception as e:
        log_step(f"⚠️ Error al corregir datos con Groq: {e}")
        return df_ses, df_con


# -----------------------------------------------------------
# 🧩 VALIDAR FORMATO DE TABLAS
# -----------------------------------------------------------
def detectar_formato(df: pd.DataFrame) -> str:
    cols = [c.strip().lower() for c in df.columns.tolist()]
    if any("fecha" in c for c in cols) and any("total" in c for c in cols):
        if any("iva" in c for c in cols):
            return "Eholo"
        elif any("factura" in c for c in cols):
            return "Gestoria"
    return "Desconocido"


# -----------------------------------------------------------
# 🧾 ENDPOINT PRINCIPAL DE EXPORTACIÓN
# -----------------------------------------------------------
@router.post("/start")
async def start_export(
    sesiones_file: UploadFile = File(...),
    contactos_file: UploadFile = File(...),
):
    try:
        progress_log.clear()
        log_step("🚀 Iniciando proceso de exportación...")

        # Leer ambos archivos
        df_ses = pd.read_excel(io.BytesIO(await sesiones_file.read()))
        df_con = pd.read_excel(io.BytesIO(await contactos_file.read()))
        log_step(f"📂 Archivos cargados: {sesiones_file.filename}, {contactos_file.filename}")

        # Validar formatos
        formato_ses = detectar_formato(df_ses)
        formato_con = detectar_formato(df_con)
        log_step(f"📋 Formato sesiones: {formato_ses}")
        log_step(f"📋 Formato contactos: {formato_con}")

        if formato_ses == "Desconocido" or formato_con == "Desconocido":
            raise HTTPException(status_code=400, detail="Formato de archivo no válido (Eholo o Gestoría requerido).")

        # Limpiar y corregir datos automáticamente
        df_ses, df_con = corregir_datos_con_groq(df_ses, df_con)

        # Fusionar tablas por NIF o Nombre
        log_step("🔗 Unificando datos entre sesiones y contactos...")
        if "nif" in df_ses.columns and "nif" in df_con.columns:
            df_merge = pd.merge(df_ses, df_con, on="nif", how="left", suffixes=("_ses", "_con"))
        else:
            df_merge = df_ses.copy()
            log_step("⚠️ No se encontró columna NIF en ambos archivos. Se omite merge.")

        # Generar CSV
        log_step("💾 Generando archivo CSV final...")
        output = io.StringIO()
        df_merge.to_csv(output, index=False)
        csv_bytes = io.BytesIO(output.getvalue().encode("utf-8"))
        output.close()

        # Guardar en disco (opcional)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        csv_filename = f"export_konyx_{timestamp}.csv"
        export_path = f"./exports/{csv_filename}"
        os.makedirs("./exports", exist_ok=True)
        with open(export_path, "wb") as f:
            f.write(csv_bytes.getvalue())

        log_step(f"✅ Exportación finalizada. Archivo generado: {csv_filename}")

        return {
            "message": "Exportación completada correctamente",
            "csv_filename": csv_filename,
            "download_url": f"http://localhost:8000/export/download/{csv_filename}",
        }

    except Exception as e:
        log_step(f"❌ Error durante exportación: {e}")
        raise HTTPException(status_code=500, detail=f"Error exportando datos: {e}")


# -----------------------------------------------------------
# 📥 DESCARGA DE CSV
# -----------------------------------------------------------
@router.get("/download/{filename}")
def download_csv(filename: str):
    try:
        file_path = f"./exports/{filename}"
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Archivo no encontrado.")
        return StreamingResponse(open(file_path, "rb"), media_type="text/csv")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al descargar CSV: {e}")

