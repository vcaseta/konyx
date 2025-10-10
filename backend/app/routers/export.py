from fastapi import APIRouter
from app.core.persistence import load_data, registrar_export
from app.models.models import ExportRequest

router = APIRouter()

@router.post("")
def exportar(req: ExportRequest):
    data = load_data()
    nueva = registrar_export(data, req)
    print("🧾 Nueva exportación recibida:", nueva)
    return {
        "message": "Exportación registrada correctamente",
        "export": nueva,
        "ultimoExport": data["ultimoExport"],
        "totalExportaciones": data["totalExportaciones"]
    }
