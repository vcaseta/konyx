from fastapi import APIRouter, HTTPException, UploadFile, File
import pandas as pd
import io

router = APIRouter(prefix="/convert", tags=["convert"])

@router.post("/procesar")
async def procesar_archivo(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        columnas = [c.strip().lower() for c in df.columns.tolist()]

        if all(any(ec in c for c in columnas) for ec in ["fecha", "iva", "total"]):
            tipo = "Eholo"
        elif sum(any(gc in c for c in columnas)
                 for gc in ["fecha factura", "numero factura", "nif", "importe base", "total"]) >= 4:
            tipo = "Gestoría"
        else:
            raise HTTPException(status_code=400, detail="Formato desconocido")

        return {"message": f"Archivo '{file.filename}' válido", "formato_detectado": tipo}

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error procesando archivo: {e}")
