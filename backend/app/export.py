from fastapi import APIRouter, UploadFile, Form, File
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse
import pandas as pd
import asyncio, os, io, json, re, time, shutil

router = APIRouter(prefix="/export", tags=["export"])

UPLOAD_DIR = "/app/uploads"
EXPORT_DIR = "/app/exports"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(EXPORT_DIR, exist_ok=True)

progress_queue = asyncio.Queue()


def log(msg: str):
    print(msg)
    asyncio.create_task(progress_queue.put(json.dumps({"type": "log", "step": msg})))


# 🧹 Resetear la cola de progreso
@router.post("/reset")
async def reset_progress():
    while not progress_queue.empty():
        progress_queue.get_nowait()
    return {"status": "ok"}


# 🧩 Paso 1: Subida de archivos
@router.post("/upload")
async def upload_files(
    usuario: str = Form(...),
    ficheroSesiones: UploadFile = File(...),
    ficheroContactos: UploadFile = File(...)
):
    """Guarda temporalmente los ficheros de sesiones y contactos."""
    user_dir = os.path.join(UPLOAD_DIR, usuario)
    os.makedirs(user_dir, exist_ok=True)

    sesiones_path = os.path.join(user_dir, f"s_{int(time.time())}_{ficheroSesiones.filename}")
    contactos_path = os.path.join(user_dir, f"c_{int(time.time())}_{ficheroContactos.filename}")

    with open(sesiones_path, "wb") as f:
        shutil.copyfileobj(ficheroSesiones.file, f)

    with open(contactos_path, "wb") as f:
        shutil.copyfileobj(ficheroContactos.file, f)

    print(f"📥 Archivos subidos para {usuario}:")
    print("  Sesiones:", sesiones_path)
    print("  Contactos:", contactos_path)

    return {
        "status": "ok",
        "sesiones": sesiones_path,
        "contactos": contactos_path
    }


# 🧩 Paso 2: Iniciar exportación
@router.post("/start")
async def start_export(
    formatoImport: str = Form(...),
    formatoExport: str = Form(...),
    empresa: str = Form(...),
    fechaFactura: str = Form(...),
    proyecto: str = Form(...),
    cuenta: str = Form(...),
    usuario: str = Form(...),
    pathSesiones: str = Form(...),
    pathContactos: str = Form(...)
):
    log(f"🚀 Exportación iniciada por {usuario} ({empresa})")
    log(f"Formato import: {formatoImport} / export: {formatoExport}")

    if not os.path.exists(pathSesiones) or not os.path.exists(pathContactos):
        log("❌ No se encontraron los archivos subidos.")
        return JSONResponse({"error": "Ficheros no encontrados en servidor."}, status_code=400)

    try:
        df_ses = pd.read_excel(pathSesiones)
        df_con = pd.read_excel(pathContactos)
        log("✅ Archivos cargados correctamente.")
    except Exception as e:
        log(f"❌ Error leyendo ficheros: {e}")
        return JSONResponse({"error": str(e)}, status_code=400)

    def sanitize(text: str) -> str:
        return re.sub(r'[^A-Za-z0-9_-]+', '_', text.strip())

    empresa_safe = sanitize(empresa)
    formato_safe = sanitize(formatoExport)
    fecha_safe = sanitize(fechaFactura)

    try:
        # -------------------------------
        # 🧾 Exportación Holded
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
        else:
            log(f"❌ Formato de exportación desconocido: {formatoExport}")
            await progress_queue.put(json.dumps({"type": "end"}))
            return JSONResponse({"error": "Formato desconocido"}, status_code=400)

    finally:
        try:
            os.remove(pathSesiones)
            os.remove(pathContactos)
            log("🧹 Archivos temporales eliminados.")
        except Exception as e:
            log(f"⚠️ No se pudieron borrar archivos: {e}")


# 🟢 SSE Progreso
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

