# app/routers/convert.py
from fastapi import APIRouter, HTTPException, UploadFile, File
import pandas as pd
import io

router = APIRouter(prefix="/convert", tags=["convert"])

@router.post("/procesar")
async def procesar_archivo(file: UploadFile = File(...)):
    """
    Recibe un archivo Excel, verifica si tiene el formato esperado (Eholo o Gestoría)
    antes de intentar convertirlo.
    """
    try:
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        columnas = [c.strip().lower() for c in df.columns.tolist()]

        # Verificar formato Eholo
        if all(any(ec in c for c in columnas) for ec in ["fecha", "iva", "total"]):
            tipo = "Eholo"
        # Verificar formato Gestoría
        elif sum(any(gc in c for c in columnas)
                 for gc in ["fecha factura", "numero factura", "nif", "importe base", "total"]) >= 4:
            tipo = "Gestoría"
        else:
            raise HTTPException(status_code=400, detail="Formato desconocido o columnas no válidas.")

        return {
            "message": f"Archivo '{file.filename}' validado correctamente.",
            "formato_detectado": tipo
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error procesando el archivo: {e}")
