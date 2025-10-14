from fastapi import APIRouter, UploadFile, Form
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse
import pandas as pd
import asyncio, time, os, io, json, re

router = APIRouter(prefix="/export", tags=["export"])

EXPORT_DIR = "/app/exports"
os.makedirs(EXPORT_DIR, exist_ok=True)

# 🧠 Cola de progreso (para SSE)
progress_queue = asyncio.Queue()


def log(msg: str):
    """Encola un mensaje de log para el SSE."""
    print(msg)  # también en consola
    asyncio.create_task(progress_queue.put(json.dumps({"type": "log", "step": msg})))


# 🧹 Resetear la cola de progreso
@router.post("/reset")
async def reset_progress():
    try:
        while not progress_queue.empty():
            progress_queue.get_nowait()
        return JSONResponse({"status": "ok", "message": "Cola de progreso reiniciada"})
    except Exception as e:
        return JSONResponse({"status": "error", "detail": str(e)})


# 🧩 Endpoint principal de exportación
@router.post("/start")
async def start_export(
    formatoImport: str = Form(...),
    formatoExport: str = Form(...),
    empresa: str = Form(...),
    fechaFactura: str = Form(...),
    proyecto: str = Form(...),
    cuenta: str = Form(...),
    usuario: str = Form(...),
    ficheroSesiones: UploadFile = None,
    ficheroContactos: UploadFile = None
):
    # 🔍 Depuración inicial
    print("📥 Campos recibidos desde frontend:")
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

    # Limpieza de cola de progreso anterior
    while not progress_queue.empty():
        progress_queue.get_nowait()

    log(f"🚀 Exportación iniciada por {usuario} ({empresa})")
    log(f"Formato import: {formatoImport} / export: {formatoExport}")

    if not ficheroSesiones or not ficheroContactos:
        log("❌ Faltan ficheros de entrada.")
        return JSONResponse({"error": "Ficheros no enviados"}, status_code=400)

    try:
        df_ses = pd.read_excel(io.BytesIO(await ficheroSesiones.read()))
        df_con = pd.read_excel(io.BytesIO(await ficheroContactos.read()))
        log("📄 Archivos cargados correctamente.")
    except Exception as e:
        log(f"❌ Error leyendo los ficheros: {e}")
        return JSONResponse({"error": str(e)}, status_code=400)

    def sanitize(text: str) -> str:
        return re.sub(r'[^A-Za-z0-9_-]+', '_', text.strip())

    empresa_safe = sanitize(empresa)
    formato_safe = sanitize(formatoExport)
    fecha_safe = sanitize(fechaFactura)

    # -------------------------------
    # 🧾 Exportación HOLDed CSV
    # -------------------------------
    if formatoExport.lower() == "holded":
        log("🧮 Procesando datos para Holded...")

        df_ses.columns = [c.strip().lower() for c in df_ses.columns]
        df_con.columns = [c.strip().lower() for c in df_con.columns]

        merged = df_ses.merge(df_con, how="left", left_on="paciente", right_on="nombre")

        facturas = []
        contador = 1
        for paciente, grupo in merged.groupby("paciente"):
            total = grupo.get("total", grupo.get("importe", 0)).sum()
            numero = f"F{time.strftime('%y%m')}{contador:04d}"
            factura = {
                "Número": numero,
                "Nombre fiscal": paciente,
                "Concepto": "Servicios de Psicoterapia",
                "IVA": 0,
                "Importe": round(total, 2),
                "Fecha": fechaFactura,
                "Forma de pago (ID)": "",
                "Cuenta contable": cuenta,
                "Proyecto": proyecto,
                "Empresa": empresa,
                "NIF": grupo.get("nif", [""])[0] if "nif" in grupo else "",
                "Email": grupo.get("email", [""])[0] if "email" in grupo else "",
                "Teléfono": grupo.get("telefono", [""])[0] if "telefono" in grupo else "",
                "Dirección": grupo.get("direccion", [""])[0] if "direccion" in grupo else "",
                "Código postal": grupo.get("cp", [""])[0] if "cp" in grupo else "",
                "Población": grupo.get("poblacion", [""])[0] if "poblacion" in grupo else "",
                "Provincia": grupo.get("provincia", [""])[0] if "provincia" in grupo else "",
                "País": "España",
                "Tags": "#paciente"
            }
            facturas.append(factura)
            contador += 1

        facturas_df = pd.DataFrame(facturas)

        filename = f"{empresa_safe}_{formato_safe}_{fecha_safe}.csv"
        filepath = os.path.join(EXPORT_DIR, filename)
        facturas_df.to_csv(filepath, index=False, sep=";")

        log(f"✅ CSV generado correctamente: {filename}")
        await progress_queue.put(json.dumps({"type": "end", "file": filename}))
        return {"status": "ok", "file": filename}

    # -------------------------------
    # 🧾 Exportación Gestoría
    # -------------------------------
    elif formatoExport.lower() == "gestoria":
        log("📦 Generando CSV tipo Gestoría...")
        await asyncio.sleep(1)
        merged = df_ses.merge(df_con, how="left", on="nombre", suffixes=("_ses", "_con"))
        filename = f"{empresa_safe}_{formato_safe}_{fecha_safe}.csv"
        filepath = os.path.join(EXPORT_DIR, filename)
        merged.to_csv(filepath, index=False, sep=";")
        log(f"✅ Archivo CSV generado: {filename}")
        await progress_queue.put(json.dumps({"type": "end", "file": filename}))
        return {"status": "ok", "file": filename}

    # -------------------------------
    # ❌ Formato no reconocido
    # -------------------------------
    else:
        log(f"❌ Formato de exportación desconocido: {formatoExport}")
        await progress_queue.put(json.dumps({"type": "end"}))
        return JSONResponse({"error": "Formato desconocido"}, status_code=400)


# 🟢 SSE de progreso
@router.get("/progress")
async def export_progress():
    async def event_stream():
        while True:
            data = await progress_queue.get()
            yield f"data: {data}\n\n"
            if '"type": "end"' in data:
                break
    return StreamingResponse(event_stream(), media_type="text/event-stream")


# 🟢 Descarga del archivo generado
@router.get("/download/{filename}")
async def download_file(filename: str):
    filepath = os.path.join(EXPORT_DIR, filename)
    if not os.path.exists(filepath):
        return JSONResponse({"error": "Archivo no encontrado"}, status_code=404)
    return FileResponse(filepath, filename=filename)


