from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse
from datetime import datetime
import pandas as pd
import os, io, json, time, re

from app.core.persistence import load_data, save_data
from app.core.validators.sesiones_gestoria import validate_sesiones_gestoria_template
from app.core.validators.eholo import validate_eholo_sesiones, validate_eholo_contactos

router = APIRouter(prefix="/export", tags=["export"])

EXPORT_DIR = "./app/exports"
TEMP_INPUTS = "./app/temp_inputs"
os.makedirs(EXPORT_DIR, exist_ok=True)
os.makedirs(TEMP_INPUTS, exist_ok=True)

progress_queue = []

def log_step(msg: str):
    progress_queue.append(msg)
    print(msg)

def stream_progress():
    for step in progress_queue:
        yield f"data: {json.dumps({'type': 'log', 'step': step})}\n\n"
        time.sleep(0.8)
    yield f"data: {json.dumps({'type': 'end'})}\n\n"

@router.get("/progress")
async def export_progress():
    return StreamingResponse(stream_progress(), media_type="text/event-stream")

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
    ficheroContactos: UploadFile = File(None),
    use_auto_numbering: str = Form("true"),
    last_invoice_number: str = Form(""),
):
    try:
        progress_queue.clear()
        log_step("✅ Iniciando proceso de exportación...")
        log_step(f"📦 Formato import: {formatoImport} | export: {formatoExport}")

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
                log_step("⚠️ No se detectó número al final del campo proporcionado.")

        else:
            log_step("🔢 Numeración automática desactivada. Holded asignará número.")

        sesiones_path = os.path.join(TEMP_INPUTS, f"{usuario}_sesiones.xlsx")
        contactos_path = os.path.join(TEMP_INPUTS, f"{usuario}_contactos.xlsx")

        with open(sesiones_path, "wb") as f:
            f.write(await ficheroSesiones.read())

        if ficheroContactos:
            with open(contactos_path, "wb") as f:
                f.write(await ficheroContactos.read())

        log_step("📁 Archivos guardados.")

        df_ses = pd.read_excel(sesiones_path)
        df_con = pd.read_excel(contactos_path) if ficheroContactos else pd.DataFrame()
        log_step(f"📊 Sesiones: {len(df_ses)} | Contactos: {len(df_con)}")

        if formatoImport.lower() == "gestoria":
            validate_sesiones_gestoria_template(df_ses)
            log_step("✅ Validación Gestoría correcta.")
        elif formatoImport.lower() == "eholo":
            validate_eholo_sesiones(df_ses)
            validate_eholo_contactos(df_con)
            log_step("✅ Validación Eholo correcta.")
        else:
            raise HTTPException(status_code=400, detail=f"Formato de importación desconocido: {formatoImport}")

        merged = df_ses.copy()
        if not df_con.empty:
            merged = merged.merge(
                df_con,
                how="left",
                left_on="Nombre",
                right_on="Nombre",
                suffixes=("", "_contacto"),
            )
        merged.fillna("", inplace=True)

        filename = f"export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        filepath = os.path.join(EXPORT_DIR, filename)
        merged.to_csv(filepath, index=False, sep=";", encoding="utf-8-sig")

        log_step(f"💾 Archivo exportado: {filename}")
        log_step("✅ Exportación finalizada correctamente.")

        data = load_data()
        data["ultimoExport"] = datetime.now().strftime("%d/%m/%Y")
        data["totalExportaciones"] = data.get("totalExportaciones", 0) + 1
        save_data(data)

        end_event = {
            "type": "end",
            "file": filename,
            "autoNumbering": use_auto,
            "nextNumber": next_number,
        }
        progress_queue.append(json.dumps(end_event))

        return {
            "status": "ok",
            "file": filename,
            "autoNumbering": use_auto,
            "nextNumber": next_number,
        }

    except HTTPException as e:
        log_step(f"❌ Error de validación: {e.detail}")
        raise
    except Exception as e:
        log_step(f"❌ Error inesperado: {e}")
        raise HTTPException(status_code=500, detail=str(e))
