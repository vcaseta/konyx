from fastapi import APIRouter, UploadFile, Form
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse
import pandas as pd
import asyncio, os, io, json, re, time

router = APIRouter(prefix="/export", tags=["export"])

EXPORT_DIR = "/app/exports"
os.makedirs(EXPORT_DIR, exist_ok=True)

progress_queue = asyncio.Queue()

def log(msg: str):
    """Encola un mensaje para el flujo SSE."""
    print(msg)  # para debug directo en logs
    asyncio.create_task(progress_queue.put(json.dumps({"type": "log", "step": msg})))


# 🧹 Resetear progreso
@router.post("/reset")
async def reset_progress():
    try:
        while not progress_queue.empty():
            progress_queue.get_nowait()
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


# 🗂️ Subida de ficheros
@router.post("/upload")
async def upload_files(
    ficheroSesiones: UploadFile,
    ficheroContactos: UploadFile = None
):
    try:
        sesiones_path = os.path.join(EXPORT_DIR, "sesiones.xlsx")
        with open(sesiones_path, "wb") as f:
            f.write(await ficheroSesiones.read())
        log("📂 Fichero de sesiones recibido correctamente.")

        contactos_path = os.path.join(EXPORT_DIR, "contactos.xlsx")
        if ficheroContactos:
            with open(contactos_path, "wb") as f:
                f.write(await ficheroContactos.read())
            log("📂 Fichero de contactos recibido correctamente.")
        else:
            log("ℹ️ No se envió fichero de contactos. Se usará el último guardado.")

        return {
            "status": "ok",
            "sesiones": sesiones_path,
            "contactos": contactos_path if os.path.exists(contactos_path) else ""
        }

    except Exception as e:
        log(f"❌ Error subiendo ficheros: {e}")
        return {"error": str(e)}


# 🚀 Iniciar exportación
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
    pathContactos: str = Form(""),
):
    log(f"🚀 Exportación iniciada por {usuario} ({empresa})")
    log(f"Formato import: {formatoImport} / export: {formatoExport}")

    if not os.path.exists(pathSesiones):
        log("❌ No se encuentra el fichero de sesiones.")
        return {"error": "Fichero de sesiones no encontrado"}

    if not pathContactos or not os.path.exists(pathContactos):
        pathContactos = os.path.join(EXPORT_DIR, "contactos.xlsx")
        if not os.path.exists(pathContactos):
            log("❌ No hay fichero de contactos disponible.")
            return {"error": "No hay fichero de contactos guardado"}

    # 📄 Leer ficheros
    try:
        df_ses = pd.read_excel(pathSesiones)
        df_con = pd.read_excel(pathContactos)
        log("📄 Archivos cargados correctamente.")
    except Exception as e:
        log(f"❌ Error leyendo los ficheros: {e}")
        return {"error": str(e)}

    # Normalizar nombres de columnas
    df_ses.columns = [c.strip().lower() for c in df_ses.columns]
    df_con.columns = [c.strip().lower() for c in df_con.columns]

    # 🧾 Generar exportación
    empresa_safe = re.sub(r'[^A-Za-z0-9_-]+', '_', empresa.strip())
    formato_safe = re.sub(r'[^A-Za-z0-9_-]+', '_', formatoExport.strip())
    fecha_safe = re.sub(r'[^A-Za-z0-9_-]+', '_', fechaFactura.strip())

    try:
        if formatoExport.lower() == "holded":
            log("🧮 Procesando datos para Holded...")

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
                    "Tags": "#paciente",
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
            merged = df_ses.merge(df_con, how="left", on="nombre", suffixes=("_ses", "_con"))
            filename = f"{empresa_safe}_{formato_safe}_{fecha_safe}.csv"
            filepath = os.path.join(EXPORT_DIR, filename)
            merged.to_csv(filepath, index=False, sep=";")
            log(f"✅ Archivo CSV generado: {filename}")
            await progress_queue.put(json.dumps({"type": "end", "file": filename}))
            return {"status": "ok", "file": filename}

        else:
            log(f"❌ Formato desconocido: {formatoExport}")
            await progress_queue.put(json.dumps({"type": "end"}))
            return {"error": "Formato desconocido"}

    except Exception as e:
        log(f"❌ Error en exportación: {e}")
        return {"error": str(e)}


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


# 🟢 Descarga de archivo
@router.get("/download/{filename}")
async def download_file(filename: str):
    filepath = os.path.join(EXPORT_DIR, filename)
    if not os.path.exists(filepath):
        return {"error": "Archivo no encontrado"}
    return FileResponse(filepath, filename=filename)

