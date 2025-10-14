import os
import shutil
import asyncio
from fastapi import APIRouter, UploadFile, Form
from fastapi.responses import FileResponse, StreamingResponse
from datetime import datetime
from typing import Optional

router = APIRouter()

# Rutas base
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMP_INPUTS = os.path.join(BASE_DIR, "temp_inputs")
EXPORTS_DIR = os.path.join(BASE_DIR, "exports")

# Crear carpetas si no existen
os.makedirs(TEMP_INPUTS, exist_ok=True)
os.makedirs(EXPORTS_DIR, exist_ok=True)

# -------------------------------
# Variables globales de progreso
# -------------------------------
progress_queue = asyncio.Queue()


async def send_log(message: str):
    """Envía un mensaje de log al flujo SSE."""
    await progress_queue.put(f"data: {message}\n\n")


# -------------------------------
# Subida de archivos
# -------------------------------
@router.post("/export/upload")
async def upload_files(
    ficheroSesiones: UploadFile,
    ficheroContactos: Optional[UploadFile] = None
):
    """Guarda o sobrescribe los archivos en temp_inputs/"""
    sesiones_path = os.path.join(TEMP_INPUTS, "sesiones.csv")
    contactos_path = os.path.join(TEMP_INPUTS, "contactos.csv")

    # Guardar sesiones
    with open(sesiones_path, "wb") as f:
        shutil.copyfileobj(ficheroSesiones.file, f)

    # Guardar contactos (si viene)
    if ficheroContactos:
        with open(contactos_path, "wb") as f:
            shutil.copyfileobj(ficheroContactos.file, f)

    return {
        "status": "ok",
        "sesiones": sesiones_path,
        "contactos": contactos_path if ficheroContactos else contactos_path
    }


# -------------------------------
# Exportar datos
# -------------------------------
@router.post("/export/start")
async def start_export(
    formatoImport: str = Form(...),
    formatoExport: str = Form(...),
    empresa: str = Form(...),
    fechaFactura: str = Form(...),
    proyecto: str = Form(...),
    cuenta: str = Form(...),
    usuario: str = Form(...),
    pathSesiones: str = Form(...),
    pathContactos: Optional[str] = Form(None)
):
    """Ejecuta la exportación usando los ficheros en temp_inputs/."""
    try:
        await send_log('{"type":"log","step":"Iniciando exportación..."}')

        # Verificar existencia de archivos
        if not os.path.exists(pathSesiones):
            await send_log('{"type":"log","step":"ERROR: No se encuentra el fichero de sesiones."}')
            return {"error": "Fichero de sesiones no encontrado"}

        if not os.path.exists(pathContactos or ""):
            await send_log('{"type":"log","step":"⚠️ No se encontró fichero de contactos, usando último disponible."}')
            pathContactos = os.path.join(TEMP_INPUTS, "contactos.csv")

        await send_log('{"type":"log","step":"Archivos listos. Procesando datos..."}')

        # Simulación de pasos de exportación (reemplazar por lógica real)
        await asyncio.sleep(1)
        await send_log('{"type":"log","step":"Leyendo sesiones..."}')
        await asyncio.sleep(1)
        await send_log('{"type":"log","step":"Leyendo contactos..."}')
        await asyncio.sleep(1)
        await send_log('{"type":"log","step":"Generando CSV final..."}')

        # Crear archivo final
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        export_name = f"export_{timestamp}.csv"
        export_path = os.path.join(EXPORTS_DIR, export_name)

        with open(export_path, "w", encoding="utf-8") as f:
            f.write("Paciente,Importe,Fecha,Proyecto,Cuenta,Empresa\n")
            f.write(f"Ejemplo,100.00,{fechaFactura},{proyecto},{cuenta},{empresa}\n")

        await send_log(f'{{"type":"end","file":"{export_name}"}}')
        return {"status": "ok", "file": export_name}

    except Exception as e:
        await send_log(f'{{"type":"log","step":"Error en exportación: {str(e)}"}}')
        return {"error": str(e)}


# -------------------------------
# Progreso SSE
# -------------------------------
@router.get("/export/progress")
async def progress_stream():
    """Envia mensajes SSE en tiempo real."""
    async def event_generator():
        while True:
            message = await progress_queue.get()
            yield message
    return StreamingResponse(event_generator(), media_type="text/event-stream")


# -------------------------------
# Descargar exportación
# -------------------------------
@router.get("/export/download/{filename}")
async def download_file(filename: str):
    """Permite descargar el CSV generado."""
    file_path = os.path.join(EXPORTS_DIR, filename)
    if not os.path.exists(file_path):
        return {"error": "Archivo no encontrado"}
    return FileResponse(file_path, filename=filename, media_type="text/csv")

