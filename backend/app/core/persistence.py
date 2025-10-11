import json, os

DATA_FILE = "./app/data.json"

DEFAULTS = {
    "password": "admin123",
    "apiKissoro": "",
    "apiEnPlural": "",
    "apiGroq": "",
    "ultimoExport": "-",
    "totalExportaciones": 0,
    "totalExportacionesFallidas": 0,
    "intentosLoginFallidos": 0,
}

def load_data():
    if not os.path.exists(DATA_FILE):
        save_data(DEFAULTS)
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_data(data: dict):
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
