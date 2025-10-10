from fastapi import APIRouter, HTTPException
from app.core.persistence import load_data, save_data, registrar_export
from app.models.models import ExportRequest
from datetime import datetime

router = APIRouter()

@router.post("")
def exportar(req: ExportRequest):
    """Registra exportaciones exitosas y contabiliza errores en caso de fallo."""
    data = load_data()
    try:
        nueva = registrar_export(data, req)
        print("🧾 Nueva exportación recibida:", nueva)
        return {
            "message": "Exportación registrada correctamente",
            "export": nueva,
            "ultimoExport": data["ultimoExport"],
            "totalExportaciones": data["totalExportaciones"],
            "totalExportacionesFallidas": data.get("totalExportacionesFallidas", 0)
        }

    except Exception as e:
        print("❌ Error en exportación:", e)
        # Contabilizar exportación fallida
        data["totalExportacionesFallidas"] = data.get("totalExportacionesFallidas", 0) + 1
        save_data(data)
        raise HTTPException(status_code=500, detail="Error al registrar exportación.")
