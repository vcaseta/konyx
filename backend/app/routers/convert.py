from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import pandas as pd
import io

router = APIRouter(prefix="/convert", tags=["convert"])

@router.post("/")
async def convert_file(
    file: UploadFile = File(...),
    tipo_import: str = Form(...),   # "eholo" o "gestoria"
    tipo_export: str = Form(...),   # "holded" o "gestoria"
):
    """
    Verifica el formato del archivo subido y, si es correcto, devuelve el contenido
    listo para conversión (por ahora solo comprobación, sin export real).
    """
    try:
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        columnas = [c.strip().lower() for c in df.columns.tolist()]

        # Detectar formato real del archivo
        formato_detectado = None
        if all(any(ec in c for c in columnas) for ec in ["fecha", "iva", "total"]):
            formato_detectado = "eholo"
        else:
            gestoría_cols = [
                "fecha factura", "numero factura", "nombre", "nif",
                "concepto", "importe base", "iva", "irpf", "total"
            ]
            matches = sum(any(gc in c for c in columnas) for gc in gestoría_cols)
            if matches >= 6:
                formato_detectado = "gestoria"

        # Si no se detecta un formato válido
        if not formato_detectado:
            raise HTTPException(
                status_code=400,
                detail="El archivo no corresponde a los formatos válidos (Eholo o Gestoría)."
            )

        # Comprobar si el formato declarado coincide con el detectado
        if formato_detectado != tipo_import.lower():
            raise HTTPException(
                status_code=400,
                detail=f"El archivo parece ser de tipo '{formato_detectado}', no coincide con el formato declarado '{tipo_import}'."
            )

        # Si todo está bien, devolvemos confirmación
        return {
            "message": f"Archivo válido ({formato_detectado}) listo para conversión a {tipo_export}.",
            "columnas_detectadas": columnas
        }

    except Exception as e:
        print("❌ Error procesando archivo:", e)
        raise HTTPException(status_code=500, detail="Error al procesar el archivo Excel.")
