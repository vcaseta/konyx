from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, StreamingResponse, JSONResponse
from datetime import datetime
import pandas as pd
import os, io, json, time, re

# Core imports
from app.core.persistence import load_data, save_data
from app.core.validators.sesiones_gestoria import validate_sesiones_gestoria_template
from app.core.validators.eholo import validate_eholo_sesiones, validate_eholo_contactos

router = APIRouter(prefix="/export", tags=["export"])

EXPORT_DIR = "./app/exports"
TEMP_INPUTS = "./app/temp_inputs"
os.makedirs(EXPORT_DIR, exist_ok=True)
os.makedirs(TEMP_INPUTS, exist_ok=True)

# Cola para eventos SSE
progress_queue = []


# ============================================================
# 🧠 FUNCIONES AUXILIARES
# ============================================================
def log_step(msg: str):
    """Añade un mensaje al log de progreso y a la consola."""
    progress_queue.append(msg)
    print(msg)


def stream_progress():
    """Genera eventos SSE con el progreso en tiempo real."""
    for step in progress_queue:
        if isinstance(step, str):
            yield f"data: {json.dumps({'type': 'log', 'step': step})}\n\n"
        else:
            yield f"data: {json.dumps(step)}\n\n"
        time.sleep(0.6)
    yield f"data: {json.dumps({'type': 'end'})}\n\n"


@router.get("/progress")
async def export_progress():
    """Stream SSE de progreso."""
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
    ficheroContactos: UploadFile = File(None),
    use_auto_numbering: str = Form("true"),
    last_invoice_number: str = Form(""),
):
    try:
        progress_queue.clear()
        log_step("✅ Iniciando proceso de exportación...")
        log_step(f"📦 Formato import: {formatoImport} | export: {formatoExport}")
        log_step(f"👤 Usuario: {usuario} | Empresa: {empresa} | Fecha: {fechaFactura}")

        # ------------------------------------------------------------
        # 🔢 CÁLCULO DE NUMERACIÓN AUTOMÁTICA
        # ------------------------------------------------------------
        use_auto = use_auto_numbering.lower() == "true"
        next_number = ""

        if use_auto and last_invoice_number:
            match = re.search(r"(\d+)$", last_invoice_number)
            if match:
                prefix = last_invoice_number[: match.start(1)]
                num = int(match.group(1)) + 1
                next_number = f"{prefix}{num:0{len(match.group(1))}d}"
                log_step(f"🧾 Numeración automática activa. Siguiente número: {next_number}")
            else:
                log_step("⚠️ No se detectó número al final del valor proporcionado.")
        else:
            log_step("🔢 Numeración automática desactivada. Holded asignará número.")

        # ------------------------------------------------------------
        # 🧾 GUARDAR ARCHIVOS TEMPORALES
        # ------------------------------------------------------------
        sesiones_path = os.path.join(TEMP_INPUTS, f"{usuario}_sesiones.xlsx")
        contactos_path = os.path.join(TEMP_INPUTS, f"{usuario}_contactos.xlsx")

        with open(sesiones_path, "wb") as f:
            f.write(await ficheroSesiones.read())

        if ficheroContactos:
            with open(contactos_path, "wb") as f:
                f.write(await ficheroContactos.read())

        log_step("📁 Archivos guardados correctamente.")

        # ------------------------------------------------------------
        # 📊 CARGAR EN PANDAS
        # ------------------------------------------------------------
        df_ses = pd.read_excel(sesiones_path)
        df_con = pd.read_excel(contactos_path) if ficheroContactos else pd.DataFrame()
        log_step(f"📊 Sesiones: {len(df_ses)} filas | Contactos: {len(df_con)} filas")

        # ------------------------------------------------------------
        # ✅ VALIDACIÓN SEGÚN FORMATO
        # ------------------------------------------------------------
        if formatoImport.lower() == "gestoria":
            log_step("🧩 Validando estructura Gestoría...")
            validate_sesiones_gestoria_template(df_ses)
            log_step("✅ Estructura Gestoría válida.")
        elif formatoImport.lower() == "eholo":
            log_step("🧩 Validando estructura Eholo...")
            validate_eholo_sesiones(df_ses)
            if not df_con.empty:
                validate_eholo_contactos(df_con)
            log_step("✅ Estructura Eholo válida.")
        else:
            raise HTTPException(status_code=400, detail=f"Formato de importación desconocido: {formatoImport}")

        # ------------------------------------------------------------
        # 🔗 COMBINAR DATOS
        # ------------------------------------------------------------
        log_step("🔁 Combinando datos de sesiones y contactos...")
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
        # 💾 EXPORTAR CSV
        # ------------------------------------------------------------
        filename = f"export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        filepath = os.path.join(EXPORT_DIR, filename)
        merged.to_csv(filepath, index=False, sep=";", encoding="utf-8-sig")

        log_step(f"💾 Archivo exportado: {filename}")
        log_step("✅ Exportación finalizada correctamente.")

        # ------------------------------------------------------------
        # 📈 ACTUALIZAR ESTADÍSTICAS
        # ------------------------------------------------------------
        data = load_data()
        data["ultimoExport"] = datetime.now().strftime("%d/%m/%Y")
        data["totalExportaciones"] = data.get("totalExportaciones", 0) + 1
        save_data(data)

        # ------------------------------------------------------------
        # 📡 ENVIAR EVENTO FINAL AL FRONTEND
        # ------------------------------------------------------------
        end_event = {
            "type": "end",
            "file": filename,
            "autoNumbering": use_auto,
            "nextNumber": next_number,
        }
        progress_queue.append(end_event)

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


# ============================================================
# ⬇️ DESCARGA DE CSV
# ============================================================
@router.get("/download/{filename}")
async def download_csv(filename: str):
    """Permite descargar el CSV generado."""
    path = os.path.join(EXPORT_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return FileResponse(path, media_type="text/csv", filename=filename)


# ============================================================
# 🧹 LIMPIEZA DE ARCHIVOS
# ============================================================
@router.get("/cleanup")
async def get_export_files():
    """Devuelve el número de archivos presentes en export y temp_inputs."""
    try:
        exp_files = [f for f in os.listdir(EXPORT_DIR) if os.path.isfile(os.path.join(EXPORT_DIR, f))]
        inp_files = [f for f in os.listdir(TEMP_INPUTS) if os.path.isfile(os.path.join(TEMP_INPUTS, f))]
        return {
            "status": "ok",
            "exports_count": len(exp_files),
            "inputs_count": len(inp_files),
            "exports": exp_files,
            "inputs": inp_files,
        }
    except Exception as e:
        return {"status": "error", "detail": str(e)}


@router.post("/cleanup")
async def cleanup_exports():
    """Elimina los archivos de exportación e inputs temporales."""
    try:
        removed = 0
        for folder in [EXPORT_DIR, TEMP_INPUTS]:
            for f in os.listdir(folder):
                path = os.path.join(folder, f)
                if os.path.isfile(path):
                    os.remove(path)
                    removed += 1
        msg = f"🧹 Limpieza completada ({removed} archivos eliminados)"
        print(msg)
        return JSONResponse({"status": "ok", "message": msg, "removed": removed})
    except Exception as e:
        return JSONResponse({"status": "error", "detail": str(e)})
