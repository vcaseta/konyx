import os
import io
import shutil
import pandas as pd
from fastapi import APIRouter, UploadFile, Form, HTTPException
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse
from datetime import datetime
from app.core.persistence import load_data, save_data
from app.core.validators.eholo import validate_eholo_sesiones, validate_eholo_contactos

router = APIRouter(prefix="/export", tags=["Exportación"])

EXPORT_DIR = "/app/exports"
TEMP_INPUTS = "/app/temp_inputs"
os.makedirs(EXPORT_DIR, exist_ok=True)
os.makedirs(TEMP_INPUTS, exist_ok=True)

# Cola temporal de progreso (logs en memoria)
progress_queue = []

# ============================================================
# 🧩 UTILIDADES
# ============================================================

def log_step(msg: str):
    """Guarda un paso del proceso en la cola."""
    progress_queue.append(msg)
    print(msg)


def send_event(event_type: str, data: dict):
    """Crea un mensaje SSE."""
    return f"data: {pd.io.json.dumps(data)}\n\n"


# ============================================================
# 🚀 INICIO DE EXPORTACIÓN
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
    use_auto_numbering: str = Form("false"),
    last_invoice_number: str = Form(""),
    ficheroSesiones: UploadFile = None,
    ficheroContactos: UploadFile = None,
):
    """
    Inicia una nueva exportación.
    Valida los ficheros según el formato seleccionado (Eholo).
    """
    try:
        log_step("✅ Iniciando proceso de exportación...")
        log_step(f"📦 Formato import: {formatoImport} | export: {formatoExport}")
        log_step(f"👤 Usuario: {usuario} | Empresa: {empresa} | Fecha: {fechaFactura}")

        # ==============================
        # 🔢 Numeración automática
        # ==============================
        if use_auto_numbering == "true":
            log_step(f"🔢 Numeración automática activada. A partir de: {last_invoice_number}")
        else:
            log_step("🔢 Numeración automática desactivada. Holded asignará número en borrador.")

        # ==============================
        # 🗂️ Guardar ficheros
        # ==============================
        if not ficheroSesiones:
            raise HTTPException(status_code=400, detail="Fichero de sesiones no recibido.")

        sesiones_path = os.path.join(TEMP_INPUTS, ficheroSesiones.filename)
        with open(sesiones_path, "wb") as f:
            f.write(await ficheroSesiones.read())

        contactos_path = None
        if ficheroContactos:
            contactos_path = os.path.join(TEMP_INPUTS, ficheroContactos.filename)
            with open(contactos_path, "wb") as f:
                f.write(await ficheroContactos.read())

        log_step("📁 Archivos guardados correctamente.")

        # ==============================
        # 🔍 Validación de estructura Eholo
        # ==============================
        if formatoImport.lower() == "eholo":
            log_step("🧩 Validando estructura Eholo...")

            try:
                df_sesiones = pd.read_excel(sesiones_path)
                validate_eholo_sesiones(df_sesiones)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Error en sesiones: {str(e)}")

            if contactos_path:
                try:
                    df_contactos = pd.read_excel(contactos_path)
                    validate_eholo_contactos(df_contactos)
                except Exception as e:
                    raise HTTPException(status_code=400, detail=f"Error en contactos: {str(e)}")

        # ==============================
        # 🧾 Simulación de exportación CSV
        # ==============================
        df_export = pd.DataFrame({"col1": [1, 2, 3], "col2": ["a", "b", "c"]})
        output_name = f"export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        output_path = os.path.join(EXPORT_DIR, output_name)
        df_export.to_csv(output_path, index=False, encoding="utf-8-sig")

        log_step("✅ Exportación completada correctamente.")

        # 📊 Actualizar estadísticas
        data = load_data()
        data["ultimoExport"] = datetime.now().strftime("%d/%m/%Y")
        data["totalExportaciones"] = data.get("totalExportaciones", 0) + 1
        save_data(data)

        log_step("📈 Estadísticas actualizadas.")
        progress_queue.append({"type": "end", "file": output_name, "autoNumbering": use_auto_numbering == "true"})

        return JSONResponse({"status": "ok", "file": output_name})

    # =======================================================
    # ❌ Manejo de errores
    # =======================================================
    except HTTPException as e:
        log_step(f"❌ Error de validación: {e.detail}")

        # 📊 Registrar exportación fallida
        data = load_data()
        data["totalExportacionesFallidas"] = data.get("totalExportacionesFallidas", 0) + 1
        save_data(data)

        raise

    except Exception as e:
        log_step(f"❌ Error inesperado: {e}")

        # 📊 Registrar exportación fallida (errores genéricos)
        data = load_data()
        data["totalExportacionesFallidas"] = data.get("totalExportacionesFallidas", 0) + 1
        save_data(data)

        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# 📡 PROGRESO SSE
# ============================================================

@router.get("/progress")
async def export_progress():
    """Emite logs de progreso en tiempo real (Server-Sent Events)."""
    async def event_generator():
        while True:
            if progress_queue:
                msg = progress_queue.pop(0)
                if isinstance(msg, dict):
                    yield f"data: {pd.io.json.dumps(msg)}\n\n"
                else:
                    yield f"data: {pd.io.json.dumps({'type': 'log', 'step': msg})}\n\n"
            else:
                await asyncio.sleep(0.5)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


# ============================================================
# 💾 DESCARGA DE ARCHIVO
# ============================================================

@router.get("/download/{filename}")
async def download_export(filename: str):
    """Permite descargar un archivo CSV generado."""
    file_path = os.path.join(EXPORT_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado.")
    return FileResponse(file_path, filename=filename)


# ============================================================
# 🧹 LIMPIEZA DE ARCHIVOS Y LOGS
# ============================================================

@router.get("/cleanup")
async def get_cleanup_info():
    """Devuelve el número de archivos presentes en las carpetas de exportación e inputs temporales."""
    try:
        exp_files = [f for f in os.listdir(EXPORT_DIR) if os.path.isfile(os.path.join(EXPORT_DIR, f))]
        inp_files = [f for f in os.listdir(TEMP_INPUTS) if os.path.isfile(os.path.join(TEMP_INPUTS, f))]
        total = len(exp_files) + len(inp_files)
        return {
            "status": "ok",
            "exports_count": len(exp_files),
            "inputs_count": len(inp_files),
            "total": total,
        }
    except Exception as e:
        return {"status": "error", "detail": str(e)}


@router.post("/cleanup")
async def cleanup_exports():
    """Elimina todos los archivos de exportación, inputs temporales y limpia los logs."""
    try:
        removed = 0
        for folder in [EXPORT_DIR, TEMP_INPUTS]:
            for f in os.listdir(folder):
                path = os.path.join(folder, f)
                if os.path.isfile(path):
                    os.remove(path)
                    removed += 1

        progress_queue.clear()

        msg = f"🧹 Limpieza completada ({removed} archivos eliminados)"
        print(msg)
        return JSONResponse({"status": "ok", "message": msg, "removed": removed})
    except Exception as e:
        return JSONResponse({"status": "error", "detail": str(e)})
