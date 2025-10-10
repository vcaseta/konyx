from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from app.core.persistence import load_data, save_data

router = APIRouter(tags=["export"])

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
    nueva = {
        "fecha": datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
        "formatoImport": req.formatoImport,
        "formatoExport": req.formatoExport,
        "empresa": req.empresa,
        "fechaFactura": req.fechaFactura,
        "proyecto": req.proyecto,
        "cuenta": req.cuenta,
        "ficheroNombre": req.ficheroNombre,
        "usuario": req.usuario
    }

    try:
        # Simulación de registro
        data["ultimoExport"] = datetime.now().strftime("%d/%m/%Y")
        data["totalExportaciones"] = data.get("totalExportaciones", 0) + 1
        save_data(data)
        print("🧾 Exportación registrada:", nueva)
        return {
            "message": "Exportación registrada correctamente",
            "ultimoExport": data["ultimoExport"],
            "totalExportaciones": data["totalExportaciones"]
        }
    except Exception as e:
        print("❌ Error al registrar exportación:", e)
        data["exportacionesFallidas"] = data.get("exportacionesFallidas", 0) + 1
        save_data(data)
        raise HTTPException(status_code=500, detail="Error al registrar exportación")
