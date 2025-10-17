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

# 🧠 Cola de progreso SSE
progress_queue = []


# ============================================================
# 🧾 FUNCIONES AUXILIARES
# ============================================================

def log_step(msg: str):
    """Añade un mensaje al log de progreso y a la consola."""
    progress_queue.append(msg)
    print(msg)


def stream_progress():
    """Genera eventos SSE con el progreso en tiempo real."""
    for step in progress_queue:
        yield f"data: {json.dumps({'type': 'log', 'step': step})}\n\n"
        time.sleep(0.8)
    yield f"data: {json.dumps({'type': 'end'})}\n\n"


def increment_invoice_number(num: str) -> str:
    """Incrementa el número de factura conservando letras y ceros a la izquierda."""
    match = re.match(r"([A-Za-z]*)(\d+)", num)
    if not match:
        return num  # fallback
    prefix, number = match.groups()
    next_number = str(int(number) + 1).zfill(len(number))
    return f"{prefix}{next_number}"


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
    ficheroContactos: UploadFile = File(...),
    use_auto_numbering: str = Form("true"),  # "true" o "false"
    last_invoice_number: str = Form(""),
):
    try:
        progress_queue.clear()
        log_step("✅ Iniciando proceso de exportación...")
        log_step(f"📦 Formato import: {formatoImport} | export: {formatoExport}")
        log_step(f"👤 Usuario: {usuario} | Empresa: {empresa} | Fecha: {fechaFactura}")

        # -------------------------------
        # Numeración automática
        # -------------------------------
        use_auto = use_auto_numbering.lower() == "true"
        if use_auto:
            log_step(f"🔢 Numeración automática activada (último número: {last_invoice_number})")
            next_number = increment_invoice_number(last_invoice_number) if last_invoice_number else None
        else:
            log_step("🔢 Numeración automática desactivada — se omitirá el número de factura")
            next_number = None

        # Guardar ficheros temporalmente
        sesiones_path = os.path.join(TEMP_INPUTS, f"{usuario}_sesiones.xlsx")
        contactos_path = os.path.join(TEMP_INPUTS, f"{usuario}_contactos.xlsx")

        with open(sesiones_path, "wb") as f:
            f.write(await ficheroSesiones.read())
        with open(contactos_path, "wb") as f:
            f.write(await ficheroContactos.read())

        log_step(f"📁 Archivos guardados en {TEMP_INPUTS}")

        # Cargar en pandas
        df_ses = pd.read_excel(sesiones_path)
        df_con = pd.read_excel(contactos_path)
        log_step(f"📊 Sesiones: {len(df_ses)} filas | Contactos: {len(df_con)} filas")

        # =====================================================
        # 🔍 VALIDACIÓN SEGÚN FORMATO IMPORTADO
        # =====================================================
        if formatoImport.lower() == "gestoria":
            log_step("🧩 Validando estructura Gestoría (sesiones)...")
            validate_sesiones_gestoria_template(df_ses)
            log_step("✅ Estructura Gestoría válida.")

        elif formatoImport.lower() == "eholo":
            log_step("🧩 Validando estructura Eholo (sesiones)...")
            validate_eholo_sesiones(df_ses)
            log_step("✅ Sesiones Eholo válidas.")
            log_step("🧩 Validando estructura Eholo (contactos)...")
            validate_eholo_contactos(df_con)
            log_step("✅ Contactos Eholo válidos.")

        else:
            raise HTTPException(status_code=400, detail=f"Formato de importación desconocido: {formatoImport}")

        # =====================================================
        # 🔗 PROCESAMIENTO Y EXPORTACIÓN
        # =====================================================
        log_step("🔁 Combinando datos de sesiones y contactos...")
        merged = df_ses.merge(
            df_con,
            how="left",
            left_on="Nombre" if "Nombre" in df_ses.columns else df_ses.columns[0],
            right_on="Nombre" if "Nombre" in df_con.columns else df_con.columns[0],
            suffixes=("", "_contacto"),
        )
        merged.fillna("", inplace=True)

        # =====================================================
        # 🧾 APLICAR NUMERACIÓN Y MODO BORRADOR
        # =====================================================
        if use_auto and next_number:
            merged.insert(0, "Número de factura", next_number)
            log_step(f"🧾 Asignado número de factura: {next_number}")
        else:
            merged.insert(0, "Número de factura", "")
            log_step("📄 Sin numeración (modo borrador)")

        merged["Estado"] = "Borrador"

        # =====================================================
        # 📤 EXPORTACIÓN CSV
        # =====================================================
        filename = f"export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        filepath = os.path.join(EXPORT_DIR, filename)
        merged.to_csv(filepath, index=False, sep=";", encoding="utf-8-sig")

        log_step(f"💾 Archivo exportado: {filename}")
        log_step(f"📤 Total filas combinadas: {len(merged)}")
        log_step("✅ Exportación finalizada correctamente.")

        # =====================================================
        # 📈 ACTUALIZAR MÉTRICAS
        # =====================================================
        data = load_data()
        data["ultimoExport"] = datetime.now().strftime("%d/%m/%Y")
        data["totalExportaciones"] = data.get("totalExportaciones", 0) + 1
        save_data(data)

        # Enviar evento final
        progress_queue.append(json.dumps({"type": "end", "file": filename}))

        return {"status": "ok", "file": filename, "autoNumbering": use_auto, "nextNumber": next_number}

    except HTTPException as e:
        log_step(f"❌ Error de validación: {e.detail}")
        raise
    except Exception as e:
        log_step(f"❌ Error inesperado: {e}")
        raise HTTPException(status_code=500, detail=str(e))
