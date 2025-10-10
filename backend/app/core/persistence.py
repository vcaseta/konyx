import json, os

DATA_FILE = "app/data/data.json"

def load_data():
    """Carga datos persistentes desde data.json"""
    if not os.path.exists(DATA_FILE):
        default_data = {
            "password": "admin123",
            "apiKissoro": "",
            "apiEnPlural": "",
            "ultimoExport": "-",
            "totalExportaciones": 0,
            "exportacionesFallidas": 0,
            "loginFallidos": 0
        }
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(default_data, f, indent=2, ensure_ascii=False)
        return default_data
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_data(data):
    """Guarda los datos persistentes"""
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
