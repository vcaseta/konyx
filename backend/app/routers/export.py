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
from app.core.exporters.holded_api import send_to_holded
from app.core.exporters.holded_export import build_holded_csv
from app.core.exporters.gestoria_export import build_gestoria_excel

router = APIRouter(prefix="/export", tags=["Exportación"])

EXPORT_DIR = "/app/exports"
TEMP_INPUTS = "/app/temp_inputs"
os.makedirs(EXPORT_DIR, exist_ok=True)
os.makedirs(TEMP_INPUTS, exist_ok=True)

progress_queue = []


# ============================================================
# 🧩 UTILIDADES
# ============================================================
def log_step(msg: str):
    progress_queue.append(msg)
    print(msg)


def register_failed_export():
    try:
        data = load_data()
        data["totalExportacionesFallidas"] = data.get("totalExportacionesFallidas", 0) + 1
        save_data(data)
        log_step("📉 Exportación fallida registrada.")
    except Exception as e:
        log_step(f"⚠️ No se pudo registrar la exportación fallida: {e}")


def clear_old_exports():
    """Elimina todos los archivos anteriores en /exports."""
    for f in os.listdir(EXPORT_DIR):
        path = os.path.join(EXPORT_DIR, f)
        if os.path.isfile(path):
            os.remove(path)
    log_step("🧹 Limpieza previa: eliminados archivos antiguos en /exports.")


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
        clear_old_exports()

        log_step("✅ Iniciando proceso de exportación...")
        log_step(f"📦 Import: {formatoImport} | Export: {formatoExport}")
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
            log_step("🔢 Numeración automática desactivada.")

        # ------------------------------------------------------------
        # 🗂️ Guardar archivos temporales
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
        # 📊 Cargar con Pandas
        # ------------------------------------------------------------
        df_ses = pd.read_excel(sesiones_path)
        df_con = pd.read_excel(contactos_path) if ficheroContactos else pd.DataFrame()
        log_step(f"📊 Sesiones: {len(df_ses)} filas | Contactos: {len(df_con)} filas")

        # ------------------------------------------------------------
        # ✅ Validación
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
            register_failed_export()
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
        # 💾 Generar siempre CSV (sobrescribe)
        # ------------------------------------------------------------
        csv_filename = "export_holded.csv"
        csv_path = os.path.join(EXPORT_DIR, csv_filename)
        log_step("💾 Generando CSV (Holded o respaldo)...")
        build_holded_csv(merged, empresa, fechaFactura, proyecto, cuenta, EXPORT_DIR)
        log_step(f"✅ CSV generado: {csv_filename}")

        # ------------------------------------------------------------
        # 📤 Exportar según tipo (sobrescribe)
        # ------------------------------------------------------------
        excel_filename = "export_gestoria.xlsx" if formatoExport.lower() == "gestoria" else None

        if formatoExport.lower() == "holded":
            log_step("📤 Enviando a Holded vía API...")
            send_to_holded(empresa, merged, fechaFactura, proyecto, cuenta, EXPORT_DIR, log_step)

        elif formatoExport.lower() == "gestoria":
            log_step("📤 Generando Excel (Gestoría)...")
            build_gestoria_excel(merged, empresa, fechaFactura, proyecto, cuenta, EXPORT_DIR)
            log_step(f"✅ Excel generado: {excel_filename}")

        else:
            register_failed_export()
            raise HTTPException(status_code=400, detail=f"Formato de exportación desconocido: {formatoExport}")

        # ------------------------------------------------------------
        # 📈 Actualizar estadísticas
        # ------------------------------------------------------------
        data = load_data()
        data["ultimoExport"] = datetime.now().strftime("%d/%m/%Y")
        data["totalExportaciones"] = data.get("totalExportaciones", 0) + 1
        save_data(data)

        # ------------------------------------------------------------
        # 📡 Evento final
        # ------------------------------------------------------------
        result_file = excel_filename or csv_filename
        progress_queue.append({
            "type": "end",
            "file": result_file,
            "csvFile": csv_filename,
            "autoNumbering": use_auto,
            "nextNumber": next_number,
        })

        log_step("✅ Exportación finalizada correctamente.")
        return JSONResponse({"status": "ok", "file": result_file, "csvFile": csv_filename})

    except HTTPException as e:
        log_step(f"❌ Error: {e.detail}")
        raise
    except Exception as e:
        log_step(f"❌ Error inesperado: {e}")
        register_failed_export()
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# 📡 STREAMING SSE
# ============================================================
@router.get("/progress")
async def export_progress():
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
# 💾 DESCARGA
# ============================================================
@router.get("/download/{filename}")
async def download_export(filename: str):
    file_path = os.path.join(EXPORT_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado.")
    return FileResponse(file_path, filename=filename)


# ============================================================
# 🧹 LIMPIEZA
# ============================================================
@router.post("/cleanup")
async def cleanup_exports():
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
