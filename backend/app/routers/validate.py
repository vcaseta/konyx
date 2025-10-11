from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io

router = APIRouter(prefix="/validate", tags=["validate"])

@router.post("/excel")
async def validate_excel(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        columnas = [c.strip().lower() for c in df.columns.tolist()]

        if all(any(ec in c for c in columnas) for ec in ["fecha", "iva", "total"]):
            return {"tipo": "Eholo"}

        gestoría_cols = ["fecha factura", "numero factura", "nombre", "nif", "importe base"]
        matches = sum(any(gc in c for c in columnas) for gc in gestoría_cols)
        if matches >= 4:
            return {"tipo": "Gestoría"}

        raise HTTPException(status_code=400, detail="Formato no reconocido.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error leyendo archivo: {e}")
