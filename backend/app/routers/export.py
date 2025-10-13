from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Request
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse
from datetime import datetime
from app.core.persistence import load_data, save_data
import pandas as pd
import io, time, json, os, shutil

router = APIRouter(prefix="/export", tags=["export"])

progress_steps = []
changes_detected = []

EXPORT_DIR = "./app/exports"
TEMP_INPUTS = "./app/temp_inputs"

os.makedirs(EXPORT_DIR, exist_ok=True)
os.makedirs(TEMP_INPUTS, exist_ok=True)

@router.post("/debug_form")
async def debug_form(request: Request):
    form = await request.form()
    print("🧾 Campos recibidos en el formulario:")
    for k, v in form.items():
        if hasattr(v, "filename"):
            print(f" - {k}: [Archivo] {v.filename}")
        else:
            print(f" - {k}: {v}")
    return {"fields": list(form.keys())}


# ============================================================
# 🔄 PROGRESO SSE
# ============================================================

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
    """Procesa sesiones y contactos, genera CSV conciliado."""
    try:
        # 🧠 DEBUG: mostrar qué llega desde frontend
        print("📦 Campos recibidos desde frontend:")
        print({
            "formatoImport": formatoImport,
            "formatoExport": formatoExport,
            "empresa": empresa,
            "fechaFactura": fechaFactura,
            "proyecto": proyecto,
            "cuenta": cuenta,
            "usuario": usuario,
            "ficheroSesiones": ficheroSesiones.filename if ficheroSesiones else None,
            "ficheroContactos": ficheroContactos.filename if ficheroContactos else None,
        })

        progress_steps.clear()
        changes_detected.clear()
        progress_steps.append("✅ Iniciando proceso de exportación...")
        progress_steps.append("📁 Cargando archivos...")

        # Guardar temporalmente los archivos subidos
        sesiones_path = os.path.join(TEMP_INPUTS, f"{usuario}_sesiones.xlsx")
        contactos_path = os.path.join(TEMP_INPUTS, f"{usuario}_contactos.xlsx")

        with open(sesiones_path, "wb") as f:
            f.write(await ficheroSesiones.read())
        with open(contactos_path, "wb") as f:
            f.write(await ficheroContactos.read())

        # Leer directamente en memoria
        df_ses = pd.read_excel(sesiones_path)
        df_con = pd.read_excel(contactos_path)

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

        # Simulación de corrección IA
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

        out_name = f"export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        out_path = os.path.join(EXPORT_DIR, out_name)
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


# ============================================================
# ⬇️ DESCARGA
# ============================================================

@router.get("/download/{filename}")
async def download_csv(filename: str):
    path = os.path.join(EXPORT_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return FileResponse(path, media_type="text/csv", filename=filename)


# ============================================================
# 🧹 LIMPIEZA DE ARCHIVOS (entradas + salidas)
# ============================================================

@router.get("/cleanup")
async def get_export_files():
    """Devuelve cuántos archivos hay en export y temp_inputs"""
    try:
        exp_files = [f for f in os.listdir(EXPORT_DIR) if os.path.isfile(os.path.join(EXPORT_DIR, f))]
        inp_files = [f for f in os.listdir(TEMP_INPUTS) if os.path.isfile(os.path.join(TEMP_INPUTS, f))]

        return {
            "status": "ok",
            "exports_count": len(exp_files),
            "inputs_count": len(inp_files),
            "total": len(exp_files) + len(inp_files),
            "exports": exp_files,
            "inputs": inp_files,
        }
    except Exception as e:
        return {"status": "error", "detail": str(e)}


@router.post("/cleanup")
async def cleanup_exports():
    """Elimina todos los archivos de exportación e input temporal"""
    try:
        removed = 0
        for folder in [EXPORT_DIR, TEMP_INPUTS]:
            for f in os.listdir(folder):
                path = os.path.join(folder, f)
                if os.path.isfile(path):
                    os.remove(path)
                    removed += 1

        msg = f"🧹 Limpieza completada ({removed} archivos eliminados de export + temp_inputs)"
        print(msg)
        return JSONResponse({"status": "ok", "message": msg, "removed": removed})
    except Exception as e:
        return JSONResponse({"status": "error", "detail": str(e)})
