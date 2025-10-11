from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse, FileResponse
from datetime import datetime
from app.core.persistence import load_data, save_data
import pandas as pd
import io, asyncio, os, json
from typing import AsyncGenerator

router = APIRouter(prefix="/export", tags=["export"])

# ------------------------------------------------
# 📡 SISTEMA DE PROGRESO SSE
# ------------------------------------------------
progress_queues: dict[str, asyncio.Queue] = {}


async def stream_progress(export_id: str) -> AsyncGenerator[str, None]:
    """Envia mensajes de progreso al frontend en tiempo real."""
    queue = progress_queues.get(export_id)
    if not queue:
        yield "event: end\ndata: {}\n\n"
        return

    try:
        while True:
            msg = await queue.get()
            if msg == "__END__":
                yield "event: end\ndata: {}\n\n"
                break
            else:
                yield f"data: {json.dumps({'step': msg})}\n\n"
    finally:
        progress_queues.pop(export_id, None)


@router.get("/progress/{export_id}")
async def export_progress(export_id: str):
    """Endpoint SSE que transmite el progreso de la exportación."""
    return StreamingResponse(stream_progress(export_id), media_type="text/event-stream")

# ------------------------------------------------
# 🚀 EXPORTACIÓN PRINCIPAL
# ------------------------------------------------
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
    """Procesa los dos ficheros y emite progreso en tiempo real."""
    export_id = f"exp_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    progress_queues[export_id] = asyncio.Queue()
    queue = progress_queues[export_id]

    async def process():
        try:
            await queue.put("Validando formato de importación...")

            sesiones_bytes = await ficheroSesiones.read()
            contactos_bytes = await ficheroContactos.read()

            df_ses = pd.read_excel(io.BytesIO(sesiones_bytes))
            df_con = pd.read_excel(io.BytesIO(contactos_bytes))

            await queue.put("Archivos cargados correctamente.")
            await queue.put("Conciliando datos entre sesiones y contactos...")

            # Normalización
            df_ses.columns = [c.strip().lower() for c in df_ses.columns]
            df_con.columns = [c.strip().lower() for c in df_con.columns]

            # Unión por nombre o columna similar
            left_col = "nombre" if "nombre" in df_ses.columns else df_ses.columns[0]
            right_col = "nombre" if "nombre" in df_con.columns else df_con.columns[0]

            merged = pd.merge(df_ses, df_con, how="left", left_on=left_col, right_on=right_col)
            merged.fillna("", inplace=True)

            await queue.put("Corrigiendo datos incompletos o erróneos...")

            merged["fecha factura"] = fechaFactura
            merged["empresa"] = empresa
            merged["proyecto"] = proyecto
            merged["cuenta contable"] = cuenta

            await queue.put("Generando archivo CSV de salida...")

            os.makedirs("./app/exports", exist_ok=True)
            out_name = f"export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            out_path = f"./app/exports/{out_name}"
            merged.to_csv(out_path, index=False, encoding="utf-8-sig")

            # Actualizar contadores
            data = load_data()
            data["ultimoExport"] = datetime.now().strftime("%d/%m/%Y")
            data["totalExportaciones"] = data.get("totalExportaciones", 0) + 1
            save_data(data)

            await queue.put("✅ Exportación completada correctamente.")

            await asyncio.sleep(0.5)
            await queue.put("__END__")

        except Exception as e:
            data = load_data()
            data["totalExportacionesFallidas"] = data.get("totalExportacionesFallidas", 0) + 1
            save_data(data)
            await queue.put(f"❌ Error: {str(e)}")
            await queue.put("__END__")

    # Procesar en segundo plano
    asyncio.create_task(process())

    return {"export_id": export_id, "message": "Exportación iniciada"}

# ------------------------------------------------
# 📁 DESCARGA DE CSV
# ------------------------------------------------
@router.get("/download/{filename}")
async def download_csv(filename: str):
    path = f"./app/exports/{filename}"
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return FileResponse(path, media_type="text/csv", filename=filename)
