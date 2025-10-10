import json, os
from datetime import datetime

DATA_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "data.json")

def load_data():
    if not os.path.exists(DATA_FILE):
        default_data = {
            "password": "admin123",
            "apiKissoro": "",
            "apiEnPlural": "",
            "ultimoExport": "-",
            "totalExportaciones": 0,
            "totalExportacionesFallidas": 0,
            "intentosLoginFallidos": 0,  # ✅ Nuevo campo
        }
        save_data(default_data)
        return default_data
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def registrar_export(data, req):
    """Registra una exportación exitosa y actualiza contadores persistentes."""
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

    # Actualizar contadores persistentes
    data["ultimoExport"] = datetime.now().strftime("%d/%m/%Y")
    data["totalExportaciones"] = data.get("totalExportaciones", 0) + 1
    save_data(data)
    return nueva
