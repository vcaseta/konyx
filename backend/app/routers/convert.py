from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import pandas as pd
import io
import requests

router = APIRouter(prefix="/convert", tags=["convert"])

BACKEND_URL = "http://localhost:8000"  # o 192.168.1.51 según despliegue

@router.post("/check")
async def check_and_convert(
    formatoImport: str = Form(...),
    formatoExport: str = Form(...),
    empresa: str = Form(...),
    fechaFactura: str = Form(...),
    proyecto: str = Form(...),
    cuenta: str = Form(...),
    ficheroNombre: str = Form(...),
    usuario: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        columnas = [c.strip().lower() for c in df.columns.tolist()]

        if formatoImport.lower() == "eholo":
            eholo_cols = ["fecha", "iva", "total"]
            if not all(any(ec in c for c in columnas) for ec in eholo_cols):
                raise HTTPException(status_code=400, detail="Archivo no válido para formato Eholo.")

        elif formatoImport.lower() == "gestoria":
            gestoria_cols = [
                "fecha factura", "numero factura", "nombre", "nif",
                "concepto", "importe base", "iva", "irpf", "total"
            ]
            matches = sum(any(gc in c for c in columnas) for gc in gestoria_cols)
            if matches < 6:
                raise HTTPException(status_code=400, detail="Archivo no válido para formato Gestoría.")
        else:
            raise HTTPException(status_code=400, detail="Formato no reconocido.")

        # ✅ Si pasa validación, registrar exportación
        body = {
            "formatoImport": formatoImport,
            "formatoExport": formatoExport,
            "empresa": empresa,
            "fechaFactura": fechaFactura,
            "proyecto": proyecto,
            "cuenta": cuenta,
            "ficheroNombre": ficheroNombre,
            "usuario": usuario
        }
        res = requests.post(f"{BACKEND_URL}/export", json=body)
        if res.status_code != 200:
            raise HTTPException(status_code=500, detail="Error registrando exportación.")
        return {"ok": True, "validado": formatoImport, "resultado": res.json()}

    except Exception as e:
        print("❌ Error al validar/convertir:", e)
        raise HTTPException(status_code=400, detail=str(e))

