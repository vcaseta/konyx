from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse
from datetime import datetime
import pandas as pd
import os, io, json, time

# Core imports
from app.core.persistence import load_data, save_data
from app.core.validators.sesiones_gestoria import validate_sesiones_gestoria_template

router = APIRouter(prefix="/export", tags=["export"])

EXPORT_DIR = "./app/exports"
TEMP_INPUTS = "./app/temp_inputs"
os.makedirs(EXPORT_DIR, exist_ok=True)
os.makedirs(TEMP_INPUTS, exist_ok=True)

# 🧠 Cola de progreso SSE
progress_queue = []

def log_step(msg: str):
    """Añade mensaje al log de progreso y consola."""
    progress_queue.append(msg)
    print(msg)

def stream_progress():
    """Envía mensajes SSE en tiempo real."""
    for step in progress_queue:
        yield f"data: {json.dumps({'type': 'log', 'step': step})}\n\n"
        time.sleep(0.8)
    yield f"data: {json.dumps({'type': 'end'})}\n\n"


@router.get("/progress")
async def export_progress():
    """Stream de progreso (SSE)."""
    return StreamingResponse(stream_progress(), media_type="text/event-stream")


# ============================================================
# 🚀 INICIAR EXPORTACIÓN
# ============================================================

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
    try:
        progress_queue.clear()
        log_step("✅ Iniciando exportación...")
        log_step(f"📦 Formato import: {formatoImport} | export: {formatoExport}")
        log_step(f"👤 Usuario: {usuario} | Empresa: {empresa}")

        # Guardar temporalmente los ficheros
        sesiones_path = os.path.join(TEMP_INPUTS, f"{usuario}_sesiones.xlsx")
        contactos_path = os.path.join(TEMP_INPUTS, f"{usuario}_contactos.xlsx")

        with open(sesiones_path, "wb") as f:
            f.write(await ficheroSesiones.read())
        with open(contactos_path, "wb") as f:
            f.write(await ficheroContactos.read())

        log_step(f"📁 Archivos guardados en {TEMP_INPUTS}")

        # Cargar dataframes
        df_ses = pd.read_excel(sesiones_path)
        df_con = pd.read_excel(contactos_path)
        log_step("📊 Ficheros cargados correctamente")

        # ===================== VALIDACIONES SEGÚN FORMATO IMPORT =====================
        if formatoImport.lower() == "gestoria":
            log_step("🧩 Validando estructura Gestoría (sesiones)...")
            validate_sesiones_gestoria_template(df_ses)
            log_step("✅ Plantilla Gestoría válida.")
        elif formatoImport.lower() == "eholo":
            log_step("🧩 Validación Eholo aún no implementada (OK provisional).")
        else:
            raise HTTPException(status_code=400, detail=f"Formato de importación desconocido: {formatoImport}")

        # ==============================================================================

        log_step("🔁 Combinando datos de sesiones y contactos...")
        merged = df_ses.merge(df_con, how="left", left_on="Nombre fiscal", right_on="nombre", suffixes=("", "_con"))
        merged.fillna("", inplace=True)

        filename = f"export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        filepath = os.path.join(EXPORT_DIR, filename)
        merged.to_csv(filepath, index=False, sep=";", encoding="utf-8-sig")

        log_step(f"💾 Archivo exportado: {filename}")
        log_step(f"📤 Total filas: {len(merged)}")
        log_step("✅ Exportación finalizada correctamente")

        # Actualizar métricas
        data = load_data()
        data["ultimoExport"] = datetime.now().strftime("%d/%m/%Y")
        data["totalExportaciones"] = data.get("totalExportaciones", 0) + 1
        save_data(data)

        # Enviar final SSE
        progress_queue.append(json.dumps({"type": "end", "file": filename}))
        return {"status": "ok", "file": filename}

    except HTTPException as e:
        log_step(f"❌ Error de validación: {e.detail}")
        raise
    except Exception as e:
        log_step(f"❌ Error inesperado: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# ⬇️ DESCARGA
# ============================================================

@router.get("/download/{filename}")
async def download_csv(filename: str):
    path = os.path.join(EXPORT_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return FileResponse(path, media_type="text/csv", filename=filename)

