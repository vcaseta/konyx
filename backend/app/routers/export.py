from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from app.core.persistence import load_data, save_data

router = APIRouter(prefix="/export", tags=["export"])

class ExportRequest(BaseModel):
    formatoImport: str
    formatoExport: str
    empresa: str
    fechaFactura: str
    proyecto: str
    cuenta: str
    ficheroNombre: str
    usuario: str


@router.post("/")
def registrar_export(req: ExportRequest):
    data = load_data()
    try:
        # Validación básica de los campos
        if not all([req.formatoImport, req.formatoExport, req.empresa, req.ficheroNombre]):
            raise ValueError("Datos de exportación incompletos")

        # Simulación de procesamiento correcto
        nueva = {
            "fecha": datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
            "formatoImport": req.formatoImport,
            "formatoExport": req.formatoExport,
            "empresa": req.empresa,
            "fechaFactura": req.fechaFactura,
            "proyecto": req.proyecto,
            "cuenta": req.cuenta,
            "ficheroNombre": req.ficheroNombre,
            "usuario": req.usuario,
        }

        data["ultimoExport"] = datetime.now().strftime("%d/%m/%Y")
        data["totalExportaciones"] = data.get("totalExportaciones", 0) + 1
        save_data(data)

        print("🧾 Nueva exportación correcta:", nueva)
        return {
            "message": "Exportación registrada correctamente",
            "export": nueva,
            "ultimoExport": data["ultimoExport"],
            "totalExportaciones": data["totalExportaciones"],
            "exportacionesFallidas": data["exportacionesFallidas"],
        }

    except Exception as e:
        print("❌ Error en exportación:", e)
        data["exportacionesFallidas"] = data.get("exportacionesFallidas", 0) + 1
        save_data(data)
        raise HTTPException(status_code=400, detail=f"Error al procesar exportación: {str(e)}")

