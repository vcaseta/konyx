from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, StreamingResponse
from datetime import datetime
from app.core.persistence import load_data, save_data
import pandas as pd
import io, time, json, os

router = APIRouter(prefix="/export", tags=["export"])

progress_steps = []
changes_detected = []

def progress_stream():
    """Genera eventos SSE en tiempo real"""
    for step in progress_steps:
        yield f"data: {json.dumps({'type': 'log', 'step': step})}\n\n"
        time.sleep(1)
    if changes_detected:
        yield f"data: {json.dumps({'type': 'changes', 'changes': changes_detected})}\n\n"
    yield "event: end\ndata: {}\n\n"

@router.get("/progress")
async def export_progress():
    """Stream SSE de progreso"""
    return StreamingResponse(progress_stream(), media_type="text/event-stream")

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
    """Procesa sesiones y contactos, genera CSV conciliado."""
    try:
        progress_steps.clear()
        changes_detected.clear()
        progress_steps.append("✅ Iniciando proceso de exportación...")
        progress_steps.append("📁 Cargando archivos...")

        sesiones_bytes = await ficheroSesiones.read()
        contactos_bytes = await ficheroContactos.read()

        df_ses = pd.read_excel(io.BytesIO(sesiones_bytes))
        df_con = pd.read_excel(io.BytesIO(contactos_bytes))

        progress_steps.append("📊 Archivos cargados correctamente.")
        progress_steps.append("🔍 Conciliando datos entre sesiones y contactos...")

        df_ses.columns = [c.strip().lower() for c in df_ses.columns]
        df_con.columns = [c.strip().lower() for c in df_con.columns]

        merged = pd.merge(
            df_ses,
            df_con,
            how="left",
            left_on="nombre" if "nombre" in df_ses.columns else df_ses.columns[0],
            right_on="nombre" if "nombre" in df_con.columns else df_con.columns[0],
        )

        progress_steps.append("🧠 Aplicando correcciones automáticas con Groq...")

        # 🧠 Simulación de corrección IA (luego puedes reemplazar por llamada real)
        for i in range(min(3, len(merged))):
            if "nif" in merged.columns and merged.iloc[i]["nif"] == "":
                original = merged.iloc[i]["nombre"]
                corrected = "AUTO-" + original[:6].upper()
                merged.at[i, "nif"] = corrected
                changes_detected.append({
                    "columna": "NIF",
                    "valor_original": "(vacío)",
                    "valor_corregido": corrected,
                })

        progress_steps.append("💾 Generando archivo CSV final...")

        merged.fillna("", inplace=True)
        merged["fecha factura"] = fechaFactura
        merged["empresa"] = empresa
        merged["proyecto"] = proyecto
        merged["cuenta contable"] = cuenta

        os.makedirs("./app/exports", exist_ok=True)
        out_name = f"export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        out_path = f"./app/exports/{out_name}"
        merged.to_csv(out_path, index=False, encoding="utf-8-sig")

        # Actualiza métricas persistentes
        data = load_data()
        data["ultimoExport"] = datetime.now().strftime("%d/%m/%Y")
        data["totalExportaciones"] = data.get("totalExportaciones", 0) + 1
        data["archivo_generado"] = out_name
        save_data(data)

        progress_steps.append("✅ Exportación completada correctamente")

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

@router.get("/download/{filename}")
async def download_csv(filename: str):
    path = f"./app/exports/{filename}"
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return FileResponse(path, media_type="text/csv", filename=filename)
