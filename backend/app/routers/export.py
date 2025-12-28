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
from app.core.validators.enrich_contacts import validate_and_enrich_contacts
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
    """Agrega mensajes de log a la cola y los imprime en consola."""
    progress_queue.append(msg)
    print(msg)


def register_failed_export():
    """Aumenta el contador de exportaciones fallidas y lo guarda."""
    try:
        data = load_data()
        data["totalExportacionesFallidas"] = data.get("totalExportacionesFallidas", 0) + 1
        save_data(data)
        log_step("📉 Exportación fallida registrada.")
    except Exception as e:
        log_step(f"⚠️ No se pudo registrar la exportación fallida: {e}")


def normalize_column_name(name: str) -> str:
    """Normaliza nombre de columna para comparación."""
    return name.strip().lower().replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u")


def find_column(df: pd.DataFrame, possible_names: list) -> str:
    """Busca una columna en el DataFrame ignorando mayúsculas y tildes."""
    cols_map = {normalize_column_name(c): c for c in df.columns}
    for name in possible_names:
        normalized = normalize_column_name(name)
        if normalized in cols_map:
            return cols_map[normalized]
    return None


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
        log_step(f"📦 Import: {formatoImport} | Export: {formatoExport}")
        log_step(f"👤 Usuario: {usuario} | Empresa: {empresa} | Fecha: {fechaFactura}")

        # ------------------------------------------------------------
        # 🔢 Numeración automática
        # ------------------------------------------------------------
        use_auto = use_auto_numbering.lower() == "true"
        invoice_prefix = ""
        invoice_start_number = 1
        
        if use_auto and last_invoice_number:
            m = re.search(r"(\d+)$", last_invoice_number)
            if m:
                invoice_prefix = last_invoice_number[: m.start(1)]
                invoice_start_number = int(m.group(1)) + 1
                next_number = f"{invoice_prefix}{invoice_start_number:0{len(m.group(1))}d}"
                log_step(f"🧾 Numeración automática activa. Siguiente número: {next_number}")
                log_step(f"   Prefijo: '{invoice_prefix}' | Inicio: {invoice_start_number}")
            else:
                log_step("⚠️ No se detectó número al final del valor proporcionado.")
                use_auto = False
        else:
            log_step("🔢 Numeración automática desactivada (se usará PR%%%%).")

        # ------------------------------------------------------------
        # 🗂️ Guardar archivos de entrada
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
        # 📊 Lectura de datos
        # ------------------------------------------------------------
        df_ses = pd.read_excel(sesiones_path)
        df_con = pd.read_excel(contactos_path) if ficheroContactos else pd.DataFrame()
        log_step(f"📊 Sesiones: {len(df_ses)} filas | Contactos: {len(df_con)} filas")

        # ------------------------------------------------------------
        # ✅ Validación de estructura
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
        # 🔗 COMBINAR DATOS (MERGE CORREGIDO)
        # ------------------------------------------------------------
        merged = df_ses.copy()
        
        if not df_con.empty:
            log_step("🔗 Combinando sesiones con contactos...")
            
            # Detectar columnas de nombre en ambos DataFrames
            col_paciente_ses = find_column(df_ses, ["paciente", "nombre paciente", "cliente", "nombre"])
            col_nombre_con = find_column(df_con, ["nombre", "nombre completo", "paciente"])
            
            if not col_paciente_ses:
                log_step("⚠️ No se encontró columna de paciente en sesiones. Usando primera columna.")
                col_paciente_ses = df_ses.columns[0]
            
            if not col_nombre_con:
                log_step("⚠️ No se encontró columna de nombre en contactos. Usando primera columna.")
                col_nombre_con = df_con.columns[0]
            
            log_step(f"   📋 Merge: Sesiones['{col_paciente_ses}'] ← Contactos['{col_nombre_con}']")
            
            # Normalizar nombres para el merge (eliminar espacios extra, mayúsculas)
            df_ses_temp = df_ses.copy()
            df_con_temp = df_con.copy()
            
            df_ses_temp['_nombre_norm'] = df_ses_temp[col_paciente_ses].astype(str).str.strip().str.lower()
            df_con_temp['_nombre_norm'] = df_con_temp[col_nombre_con].astype(str).str.strip().str.lower()
            
            # Hacer el merge por nombre normalizado
            merged = df_ses_temp.merge(
                df_con_temp,
                how="left",
                left_on="_nombre_norm",
                right_on="_nombre_norm",
                suffixes=("", "_contacto"),
            )
            
            # Eliminar columnas temporales
            merged = merged.drop(columns=['_nombre_norm'], errors='ignore')
            
            # Reportar estadísticas del merge
            matched = merged[col_nombre_con].notna().sum()
            total = len(merged)
            log_step(f"   ✅ Merge completado: {matched}/{total} sesiones con datos de contacto ({matched/total*100:.1f}%)")
            
            if matched < total:
                unmatched = total - matched
                log_step(f"   ⚠️ {unmatched} sesiones sin datos de contacto (nombres no coinciden)")
        else:
            log_step("ℹ️ No se proporcionó archivo de contactos. Se usarán solo datos de sesiones.")
        
        # Rellenar valores nulos con cadenas vacías
        merged.fillna("", inplace=True)

        # ------------------------------------------------------------
        # 🧠 Validar y completar contactos (Groq)
        # ------------------------------------------------------------
        log_step("🔍 Validando y completando contactos con Groq...")
        merged = validate_and_enrich_contacts(merged, log_step)

        # ------------------------------------------------------------
        # 🚨 VALIDACIÓN DE NIF OBLIGATORIO
        # ------------------------------------------------------------
        log_step("🔍 Validando que todos los pacientes tengan NIF...")
        
        # Buscar columna de NIF
        col_nif = find_column(merged, ["NIF", "DNI", "Documento de identidad", "Documento"])
        
        if col_nif:
            sin_nif = merged[merged[col_nif].astype(str).str.strip() == ""]
            if len(sin_nif) > 0:
                pacientes_sin_nif = []
                col_paciente = find_column(merged, ["paciente", "nombre", "nombre paciente"])
                
                for idx, row in sin_nif.iterrows():
                    nombre = str(row.get(col_paciente, f"Fila {idx}")).strip()
                    pacientes_sin_nif.append(nombre)
                
                error_msg = f"❌ ERROR: {len(sin_nif)} paciente(s) sin NIF/DNI. No se puede continuar.\n\n"
                error_msg += "Pacientes sin NIF:\n"
                error_msg += "\n".join(f"  - {p}" for p in pacientes_sin_nif[:10])
                if len(pacientes_sin_nif) > 10:
                    error_msg += f"\n  ... y {len(pacientes_sin_nif) - 10} más"
                
                log_step(error_msg)
                register_failed_export()
                raise HTTPException(status_code=400, detail=error_msg)
        else:
            log_step("⚠️ No se encontró columna de NIF en los datos")
        
        log_step("✅ Todos los pacientes tienen NIF")

        # ------------------------------------------------------------
        # 💾 Exportar según tipo
        # ------------------------------------------------------------
        if formatoExport.lower() == "holded":
            log_step("📤 Generando CSV Holded...")
            filename = build_holded_csv(merged, empresa, fechaFactura, proyecto, cuenta, EXPORT_DIR, log_step)
            log_step(f"✅ Archivo CSV generado: {filename}")

            try:
                send_to_holded(empresa, merged, fechaFactura, proyecto, cuenta, EXPORT_DIR, log_step)
            except Exception as e:
                log_step(f"⚠️ Error al enviar a Holded: {e}")

        elif formatoExport.lower() == "gestoria":
            log_step("📤 Generando Excel para Gestoría...")
            filename = build_gestoria_excel(
                merged,
                empresa,
                fechaFactura,
                proyecto,
                cuenta,
                EXPORT_DIR,
                log_step,
                use_auto_numbering=use_auto,
                invoice_prefix=invoice_prefix,
                invoice_start_number=invoice_start_number,
            )
            log_step(f"✅ Archivo Excel generado: {filename}")

        else:
            raise HTTPException(status_code=400, detail=f"Formato de exportación desconocido: {formatoExport}")

        # ------------------------------------------------------------
        # 📈 Actualizar estadísticas
        # ------------------------------------------------------------
        data = load_data()
        data["ultimoExport"] = datetime.now().strftime("%d/%m/%Y")
        data["totalExportaciones"] = data.get("totalExportaciones", 0) + 1
        save_data(data)

        # ------------------------------------------------------------
        # 📡 Evento final SSE
        # ------------------------------------------------------------
        next_number = ""
        if use_auto:
            # Calcular el siguiente número después de procesar todas las facturas
            total_facturas = len(merged)
            next_num = invoice_start_number + total_facturas
            next_number = f"{invoice_prefix}{next_num:04d}"

        progress_queue.append({
            "type": "end",
            "file": filename,
            "autoNumbering": use_auto,
            "nextNumber": next_number,
        })

        log_step("✅ Exportación completada correctamente.")
        return JSONResponse({"status": "ok", "file": filename})

    except Exception as e:
        log_step(f"❌ Error en exportación: {e}")
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
# 💾 DESCARGA DIRECTA DE ARCHIVO
# ============================================================
@router.get("/download/{filename}")
async def download_export(filename: str):
    file_path = os.path.join(EXPORT_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Archivo no encontrado: {filename}")
    return FileResponse(file_path, filename=filename)


# ============================================================
# 🧹 LIMPIEZA MANUAL (desde Panel Config)
# ============================================================
@router.get("/cleanup")
async def get_cleanup_info():
    try:
        exp_files = [f for f in os.listdir(EXPORT_DIR) if os.path.isfile(os.path.join(EXPORT_DIR, f))]
        inp_files = [f for f in os.listdir(TEMP_INPUTS) if os.path.isfile(os.path.join(TEMP_INPUTS, f))]
        return {
            "status": "ok",
            "exports_count": len(exp_files),
            "inputs_count": len(inp_files),
            "total": len(exp_files) + len(inp_files)
        }
    except Exception as e:
        return {"status": "error", "detail": str(e)}


@router.post("/cleanup")
async def cleanup_exports():
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
