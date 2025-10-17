import os
import asyncio
import pandas as pd
import json
import re
from datetime import datetime
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse

from app.core.persistence import load_data, save_data
from app.core.validators.eholo import validate_eholo_sesiones, validate_eholo_contactos
from app.core.validators.sesiones_gestoria import validate_sesiones_gestoria_template

router = APIRouter(prefix="/export", tags=["Exportación"])

EXPORT_DIR = "/app/exports"
TEMP_INPUTS = "/app/temp_inputs"
os.makedirs(EXPORT_DIR, exist_ok=True)
os.makedirs(TEMP_INPUTS, exist_ok=True)

# Cola de progreso (logs SSE)
progress_queue = []


# ============================================================
# 🧩 UTILIDADES
# ============================================================
def log_step(msg: str):
    """Guarda un mensaje de log en la cola y lo imprime."""
    progress_queue.append(msg)
    print(msg)


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
    ficheroSesiones: UploadFile = File(...),
    ficheroContactos: UploadFile = File(None),
):
    try:
        progress_queue.clear()
        log_step("✅ Iniciando proceso de exportación...")
        log_step(f"📦 Formato import: {formatoImport} | export: {formatoExport}")
        log_step(f"👤 Usuario: {usuario} | Empresa: {empresa} | Fecha: {fechaFactura}")

        # ------------------------------------------------------------
        # 🔢 Numeración automática
        # ------------------------------------------------------------
        use_auto = use_auto_numbering.lower() == "true"
        next_number = ""
        if use_auto and last_invoice_number:
            m = re.search(r"(\d+)$", last_invoice_number)
            if m:
                prefix = last_invoice_number[: m.start(1)]
                num = int(m.group(1)) + 1
                next_number = f"{prefix}{num:0{len(m.group(1))}d}"
                log_step(f"🧾 Numeración automática activa. Siguiente número: {next_number}")
            else:
                log_step("⚠️ No se detectó número al final del valor proporcionado.")
        else:
            log_step("🔢 Numeración automática desactivada. Holded asignará número en borrador.")

        # ------------------------------------------------------------
        # 🗂️ Guardar archivos recibidos
        # ------------------------------------------------------------
        sesiones_path = os.path.join(TEMP_INPUTS, f"{usuario}_sesiones.xlsx")
        with open(sesiones_path, "wb") as f:
            f.write(await ficheroSesiones.read())

        contactos_path = None
        if ficheroContactos:
            contactos_path = os.path.join(TEMP_INPUTS, f"{usuario}_contactos.xlsx")
            with open(contactos_path, "wb") as f:
                f.write(await ficheroContactos.read())

        log_step("📁 Archivos guardados correctamente.")

        # ------------------------------------------------------------
        # 📊 Leer con Pandas
        # ------------------------------------------------------------
        df_ses = pd.read_excel(sesiones_path)
        df_con = pd.read_excel(contactos_path) if ficheroContactos else pd.DataFrame()
        log_step(f"📊 Sesiones: {len(df_ses)} filas | Contactos: {len(df_con)} filas")

        # ------------------------------------------------------------
        # ✅ Validación según formato
        # ------------------------------------------------------------
        if formatoImport.lower() == "eholo":
            log_step("🧩 Validando estructura Eholo...")
            validate_eholo_sesiones(df_ses)
            if not df_con.empty:
                validate_eholo_contactos(df_con)
            log_step("✅ Validación Eholo correcta.")
        elif formatoImport.lower() == "gestoria":
            log_step("🧩 Validando estructura Gestoría...")
            validate_sesiones_gestoria_template(df_ses)
            log_step("✅ Validación Gestoría correcta.")
        else:
            raise HTTPException(status_code=400, detail=f"Formato de importación desconocido: {formatoImport}")

        # ------------------------------------------------------------
        # 🔗 Combinar datos
        # ------------------------------------------------------------
        merged = df_ses.copy()
        if not df_con.empty:
            merged = merged.merge(
                df_con,
                how="left",
                left_on="Nombre" if "Nombre" in df_ses.columns else df_ses.columns[0],
                right_on="Nombre" if "Nombre" in df_con.columns else df_con.columns[0],
                suffixes=("", "_contacto"),
            )
        merged.fillna("", inplace=True)

        # ------------------------------------------------------------
        # 💾 Exportar CSV
        # ------------------------------------------------------------
        filename = f"export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        filepath = os.path.join(EXPORT_DIR, filename)
        merged.to_csv(filepath, index=False, sep=";", encoding="utf-8-sig")

        log_step(f"💾 Archivo exportado: {filename}")
        log_step("✅ Exportación finalizada correctamente.")

        # ------------------------------------------------------------
        # 📈 Actualizar estadísticas
        # ------------------------------------------------------------
        data = load_data()
        data["ultimoExport"] = datetime.now().strftime("%d/%m/%Y")
        data["totalExportaciones"] = data.get("totalExportaciones", 0) + 1
        save_data(data)

        # ------------------------------------------------------------
        # 📡 Enviar evento final
        # ------------------------------------------------------------
        progress_queue.append({
            "type": "end",
            "file": filename,
            "autoNumbering": use_auto,
            "nextNumber": next_number,
        })

        return JSONResponse({"status": "ok", "file": filename})

    # ------------------------------------------------------------
    # ❌ Manejo de errores
    # ------------------------------------------------------------
    except HTTPException as e:
        log_step(f"❌ Error de validación: {e.detail}")
        data = load_data()
        data["totalExportacionesFallidas"] = data.get("totalExportacionesFallidas", 0) + 1
        save_data(data)
        raise

    except Exception as e:
        log_step(f"❌ Error inesperado: {e}")
        data = load_data()
        data["totalExportacionesFallidas"] = data.get("totalExportacionesFallidas", 0) + 1
        save_data(data)
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# 📡 STREAMING DE PROGRESO SSE
# ============================================================
@router.get("/progress")
async def export_progress():
    """Stream SSE de progreso."""
    async def event_generator():
        while True:
            if progress_queue:
                msg = progress_queue.pop(0)
                if isinstance(msg, dict):
                    yield f"data: {json.dumps(msg)}\n\n"
                else:
                    yield f"data: {json.dumps({'type': 'log', 'step': msg})}\n\n"
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
    """Devuelve el número de archivos presentes en export e inputs."""
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
    """Elimina archivos de exportación e inputs temporales y limpia logs."""
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
