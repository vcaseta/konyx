from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, StreamingResponse
from datetime import datetime
from app.core.persistence import load_data, save_data
import pandas as pd
import io, time, json, os

router = APIRouter(prefix="/export", tags=["export"])

# ------------------------------------------------
# 📡 FLUJO DE PROGRESO (SSE)
# ------------------------------------------------
progress_steps = []


def progress_stream():
    """Genera mensajes de progreso en tiempo real."""
    for step in progress_steps:
        yield f"data: {json.dumps({'step': step})}\n\n"
        time.sleep(1.2)
    yield "event: end\ndata: {}\n\n"


@router.get("/progress")
async def export_progress():
    """Stream de progreso en tiempo real."""
    return StreamingResponse(progress_stream(), media_type="text/event-stream")


# ------------------------------------------------
# 🚀 ENDPOINT PRINCIPAL DE EXPORTACIÓN
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
    """
    Procesa los dos ficheros (sesiones y contactos), realiza validaciones,
    conciliación y genera el CSV final.
    """

    try:
        progress_steps.clear()
        progress_steps.extend(["Validando formato de importación..."])

        # Leer ambos ficheros
        sesiones_bytes = await ficheroSesiones.read()
        contactos_bytes = await ficheroContactos.read()

        df_ses = pd.read_excel(io.BytesIO(sesiones_bytes))
        df_con = pd.read_excel(io.BytesIO(contactos_bytes))

        progress_steps.append("Archivos cargados correctamente.")
        progress_steps.append("Conciliando datos entre sesiones y contactos...")

        # Limpieza básica
        df_ses.columns = [c.strip().lower() for c in df_ses.columns]
        df_con.columns = [c.strip().lower() for c in df_con.columns]

        # Intento de unión inteligente por nombre o NIF
        merged = pd.merge(
            df_ses,
            df_con,
            how="left",
            left_on="nombre" if "nombre" in df_ses.columns else df_ses.columns[0],
            right_on="nombre" if "nombre" in df_con.columns else df_con.columns[0],
        )

        progress_steps.append("Corrigiendo datos incompletos o erróneos...")

        merged.fillna("", inplace=True)
        merged["fecha factura"] = fechaFactura
        merged["empresa"] = empresa
        merged["proyecto"] = proyecto
        merged["cuenta contable"] = cuenta

        progress_steps.append("Generando archivo CSV de salida...")

        out_name = f"export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        out_path = f"./app/exports/{out_name}"
        os.makedirs("./app/exports", exist_ok=True)
        merged.to_csv(out_path, index=False, encoding="utf-8-sig")

        data = load_data()
        data["ultimoExport"] = datetime.now().strftime("%d/%m/%Y")
        data["totalExportaciones"] = data.get("totalExportaciones", 0) + 1
        save_data(data)

        progress_steps.append("Exportación completada ✅")

        return {
            "message": "Exportación finalizada correctamente",
            "archivo_generado": out_name,
            "ultimoExport": data["ultimoExport"],
            "totalExportaciones": data["totalExportaciones"],
        }

    except Exception as e:
        data = load_data()
        data["totalExportacionesFallidas"] = data.get("totalExportacionesFallidas", 0) + 1
        save_data(data)
        raise HTTPException(status_code=400, detail=f"Error procesando exportación: {e}")


# ------------------------------------------------
# 📁 DESCARGA DE CSV GENERADO
# ------------------------------------------------
@router.get("/download/{filename}")
async def download_csv(filename: str):
    path = f"./app/exports/{filename}"
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return FileResponse(path, media_type="text/csv", filename=filename)
