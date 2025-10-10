from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io

router = APIRouter()

@router.post("/excel")
async def validate_excel(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        columnas = [c.strip().lower() for c in df.columns.tolist()]

        # Detectar formato Eholo
        if all(any(ec in c for c in columnas) for ec in ["fecha", "iva", "total"]):
            return {"tipo": "eholo"}

        # Detectar formato Gestoría
        gestoría_cols = [
            "fecha factura", "numero factura", "nombre", "nif",
            "concepto", "importe base", "iva", "irpf", "total"
        ]
        matches = sum(any(gc in c for c in columnas) for gc in gestoría_cols)
        if matches >= 6:
            return {"tipo": "gestoria"}

        raise HTTPException(
            status_code=400,
            detail="El archivo no corresponde a los formatos válidos (Eholo o Gestoría)."
        )

    except Exception as e:
        print("❌ Error leyendo archivo:", e)
        raise HTTPException(status_code=400, detail="Error al leer el archivo. Asegúrate de que sea un Excel válido.")
