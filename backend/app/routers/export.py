from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse
from datetime import datetime
from app.core.persistence import load_data, save_data
from app.core.validators.common import ensure_not_empty
from app.core.validators.holded import validate_holded_template
from app.core.validators.eholo import validate_eholo_template
from app.core.exporters.holded import build_holded_csv
from app.core.exporters.gestoria import build_gestoria_csv
import pandas as pd
import time, json, os

router = APIRouter(prefix="/export", tags=["export"])

progress_steps = []
changes_detected = []

EXPORT_DIR = "./app/exports"
TEMP_INPUTS = "./app/temp_inputs"

os.makedirs(EXPORT_DIR, exist_ok=True)
os.makedirs(TEMP_INPUTS, exist_ok=True)


# ============================================================
# 🔄 PROGRESO SSE
# ============================================================

def progress_stream():
    """Genera eventos SSE en tiempo real."""
    for step in progress_steps:
        yield f"data: {json.dumps({'type': 'log', 'step': step})}\n\n"
        time.sleep(1)
    yield f"data: {json.dumps({'type': 'end'})}\n\n"


@router.get("/progress")
async def export_progress():
    """Stream SSE de progreso."""
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
    """Procesa sesiones y contactos, valida y genera CSV final."""
    try:
        print("\n" + "=" * 80)
        print("📦 NUEVA EXPORTACIÓN INICIADA")
        print(f"👤 Usuario: {usuario}")
        print(f"📁 Formato import: {formatoImport} | Export: {formatoExport}")
        print(f"🏢 Empresa: {empresa} | 📅 Fecha factura: {fechaFactura}")
        print(f"🧾 Proyecto: {proyecto} | 💼 Cuenta: {cuenta}")
        print("-" * 80)

        progress_steps.clear()
        progress_steps.append("Iniciando proceso de exportación...")
        progress_steps.append("Guardando archivos temporales...")

        # Guardar archivos subidos
        sesiones_path = os.path.join(TEMP_INPUTS, f"{usuario}_sesiones.xlsx")
        contactos_path = os.path.join(TEMP_INPUTS, f"{usuario}_contactos.xlsx")

        with open(sesiones_path, "wb") as f:
            f.write(await ficheroSesiones.read())
        with open(contactos_path, "wb") as f:
            f.write(await ficheroContactos.read())

        print(f"📥 SESIONES guardado en: {sesiones_path}")
        print(f"📥 CONTACTOS guardado en: {contactos_path}")

        # Leer Excel
        df_ses = pd.read_excel(sesiones_path)
        df_con = pd.read_excel(contactos_path)

        ensure_not_empty(df_ses, ficheroSesiones.filename)
        ensure_not_empty(df_con, ficheroContactos.filename)

        # =====================================================
        # 🔍 VALIDACIÓN SEGÚN FORMATO IMPORT
        # =====================================================
        if formatoImport.lower() == "holded":
            progress_steps.append("Validando estructura Holded...")
            validate_holded_template(df_ses)
            print("✔ Validación Holded completada.")
        elif formatoImport.lower() == "eholo":
            progress_steps.append("Validando estructura Eholo...")
            validate_eholo_template(df_ses)
            print("✔ Validación Eholo completada.")
        else:
            progress_steps.append(f"Formato import desconocido: {formatoImport}")

        # =====================================================
        # 🧩 FUSIÓN DE DATOS
        # =====================================================
        progress_steps.append("Conciliando datos entre sesiones y contactos...")
        df_ses.columns = [c.strip().lower() for c in df_ses.columns]
        df_con.columns = [c.strip().lower() for c in df_con.columns]

        merged = pd.merge(
            df_ses,
            df_con,
            how="left",
            left_on="nombre" if "nombre" in df_ses.columns else df_ses.columns[0],
            right_on="nombre" if "nombre" in df_con.columns else df_con.columns[0],
        )

        merged.fillna("", inplace=True)
        progress_steps.append(f"Fusión completada: {len(merged)} filas combinadas.")

        # =====================================================
        # 💾 GENERAR ARCHIVO FINAL
        # =====================================================
        progress_steps.append("Generando archivo CSV final...")

        if formatoExport.lower() == "holded":
            out_name = build_holded_csv(merged, empresa, fechaFactura, proyecto, cuenta, EXPORT_DIR)
        elif formatoExport.lower() == "gestoria":
            out_name = build_gestoria_csv(merged, empresa, fechaFactura, proyecto, cuenta, EXPORT_DIR)
        else:
            out_name = f"export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            out_path = os.path.join(EXPORT_DIR, out_name)
            merged.to_csv(out_path, index=False, encoding="utf-8-sig")

        progress_steps.append(f"Archivo generado: {out_name}")
        progress_steps.append("Exportación finalizada correctamente.")
        print(f"📤 Archivo generado: {out_name}")

        # =====================================================
        # 📊 ACTUALIZAR MÉTRICAS
        # =====================================================
        data = load_data()
        data["ultimoExport"] = datetime.now().strftime("%d/%m/%Y")
        data["totalExportaciones"] = data.get("totalExportaciones", 0) + 1
        data["archivo_generado"] = out_name
        save_data(data)

        return {"status": "ok", "file": out_name}

    except Exception as e:
        data = load_data()
        data["totalExportacionesFallidas"] = data.get("totalExportacionesFallidas", 0) + 1
        save_data(data)
        print(f"❌ Error en exportación: {e}")
        raise HTTPException(status_code=400, detail=str(e))


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
# 🧹 LIMPIEZA
# ============================================================

@router.get("/cleanup")
async def cleanup_info():
    exp_files = os.listdir(EXPORT_DIR)
    inp_files = os.listdir(TEMP_INPUTS)
    return {
        "exports": exp_files,
        "inputs": inp_files,
        "total": len(exp_files) + len(inp_files),
    }


@router.post("/cleanup")
async def cleanup_files():
    removed = 0
    for folder in [EXPORT_DIR, TEMP_INPUTS]:
        for f in os.listdir(folder):
            path = os.path.join(folder, f)
            if os.path.isfile(path):
                os.remove(path)
                removed += 1
    msg = f"Limpieza completada ({removed} archivos eliminados)"
    print(msg)
    return {"status": "ok", "message": msg}


