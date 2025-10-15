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
    yield f"data: {json.dumps({'type': 'end', 'file': progress_steps[-1] if progress_steps else None})}\n\n"


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
    ficheroContactos: UploadFile = File(None),
):
    """Procesa sesiones y contactos, guarda temporalmente los archivos y genera CSV conciliado."""
    try:
        print("\n" + "=" * 80)
        print("📦 NUEVA EXPORTACIÓN INICIADA")
        print(f"👤 Usuario: {usuario}")
        print(f"📁 Formato import: {formatoImport} | Export: {formatoExport}")
        print(f"🏢 Empresa: {empresa} | 📅 Fecha factura: {fechaFactura}")
        print(f"🧾 Proyecto: {proyecto} | 💼 Cuenta: {cuenta}")
        print("-" * 80)

        progress_steps.clear()
        changes_detected.clear()
        progress_steps.append("✅ Iniciando proceso de exportación...")
        progress_steps.append("📁 Cargando archivos...")

        sesiones_path = os.path.join(TEMP_INPUTS, f"{usuario}_sesiones.xlsx")
        contactos_path = os.path.join(TEMP_INPUTS, f"{usuario}_contactos.xlsx")

        with open(sesiones_path, "wb") as f:
            contenido = await ficheroSesiones.read()
            f.write(contenido)
        print(f"📥 Guardado fichero de SESIONES en: {sesiones_path} ({len(contenido)} bytes)")

        if ficheroContactos:
            with open(contactos_path, "wb") as f:
                contenido = await ficheroContactos.read()
                f.write(contenido)
            print(f"📥 Guardado fichero de CONTACTOS en: {contactos_path} ({len(contenido)} bytes)")
        else:
            print("⚠️ No se subió fichero de contactos. Se usará el último guardado si existe.")
            if not os.path.exists(contactos_path):
                raise HTTPException(status_code=400, detail="No se encontró fichero de contactos previo para reutilizar.")

        progress_steps.append("📊 Archivos cargados correctamente. Leyendo datos...")

        df_ses = pd.read_excel(sesiones_path)
        df_con = pd.read_excel(contactos_path)

        print(f"   ✔ Sesiones: {len(df_ses)} filas, {len(df_ses.columns)} columnas")
        print(f"   ✔ Contactos: {len(df_con)} filas, {len(df_con.columns)} columnas")

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

        print(f"🤝 Fusión completada: {len(merged)} filas combinadas")

        progress_steps.append("🧠 Aplicando correcciones automáticas con Groq (simulado)...")

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
                print(f"🔧 Corregido NIF vacío para '{original}' → '{corrected}'")

        progress_steps.append("💾 Generando archivo CSV final...")

        # ✅ CORREGIDO: evitar FutureWarning
        merged = merged.astype(str).fillna("")

        merged["fecha factura"] = fechaFactura
        merged["empresa"] = empresa
        merged["proyecto"] = proyecto
        merged["cuenta contable"] = cuenta

        out_name = f"export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        out_path = os.path.join(EXPORT_DIR, out_name)
        merged.to_csv(out_path, index=False, encoding="utf-8-sig")

        print(f"📤 Archivo exportado: {out_path}")
        print(f"📊 Total filas: {len(merged)}")

        data = load_data()
        data["ultimoExport"] = datetime.now().strftime("%d/%m/%Y")
        data["totalExportaciones"] = data.get("totalExportaciones", 0) + 1
        data["archivo_generado"] = out_name
        save_data(data)

        print("✅ Exportación finalizada correctamente.")
        print("=" * 80 + "\n")

        progress_steps.append(f"{out_name}")  # nombre del archivo al final

        return {
            "message": "Exportación finalizada correctamente",
            "archivo_generado": out_name,
            "file": out_name,
            "ultimoExport": data["ultimoExport"],
            "totalExportaciones": data["totalExportaciones"],
        }

    except Exception as e:
        print(f"❌ ERROR durante exportación: {e}")
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
    print(f"⬇️ Descargando archivo: {filename}")
    return FileResponse(path, media_type="text/csv", filename=filename)

