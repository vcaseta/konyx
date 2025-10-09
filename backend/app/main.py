from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import json, os

app = FastAPI(title="Konyx Backend", version="1.0.0")

# -----------------------------
# 🌍 CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # puedes restringir a ["http://192.168.1.50"] si deseas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# 📁 Archivo de datos persistente
# -----------------------------
DATA_FILE = "data.json"


def load_data():
    """Carga datos persistentes desde data.json"""
    if not os.path.exists(DATA_FILE):
        default_data = {
            "password": "admin123",
            "apiKissoro": "",
            "apiEnPlural": ""
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


# -----------------------------
# 📘 Modelos
# -----------------------------
class LoginRequest(BaseModel):
    username: str
    password: str


class PasswordUpdate(BaseModel):
    password: str


class ApiUpdate(BaseModel):
    apiKissoro: str | None = None
    apiEnPlural: str | None = None


class ExportRequest(BaseModel):
    formatoImport: str
    formatoExport: str
    empresa: str
    fechaFactura: str
    proyecto: str
    cuenta: str
    ficheroNombre: str
    usuario: str


# -----------------------------
# 🔑 LOGIN
# -----------------------------
@app.post("/auth/login")
def login(req: LoginRequest):
    data = load_data()

    # Validar la contraseña con la almacenada en data.json
    if req.password != data.get("password"):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    # Usuario validado (token ficticio)
    return {"token": "konyx_token_demo"}


# -----------------------------
# 📡 STATUS (para sincronizar frontend)
# -----------------------------
@app.get("/auth/status")
def status():
    data = load_data()
    return {
        "password": data.get("password", "admin123"),
        "apiKissoro": data.get("apiKissoro", ""),
        "apiEnPlural": data.get("apiEnPlural", "")
    }


# -----------------------------
# 🧩 ACTUALIZAR CONTRASEÑA
# -----------------------------
@app.post("/auth/update_password")
def update_password(req: PasswordUpdate):
    data = load_data()
    data["password"] = req.password
    save_data(data)
    return {"message": "Contraseña actualizada correctamente", "password": req.password}


# -----------------------------
# 🌐 ACTUALIZAR APIS
# -----------------------------
@app.post("/auth/update_apis")
def update_apis(req: ApiUpdate):
    data = load_data()
    if req.apiKissoro is not None:
        data["apiKissoro"] = req.apiKissoro
    if req.apiEnPlural is not None:
        data["apiEnPlural"] = req.apiEnPlural
    save_data(data)
    return {
        "message": "APIs actualizadas correctamente",
        "apiKissoro": data["apiKissoro"],
        "apiEnPlural": data["apiEnPlural"]
    }


# -----------------------------
# 🧾 EXPORT (no persistente)
# -----------------------------
@app.post("/export")
def registrar_export(req: ExportRequest):
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

    # Solo se imprime en consola (no se guarda en disco)
    print("🧾 Nueva exportación recibida:", nueva)
    return {"message": "Exportación registrada (solo sesión actual)", "export": nueva}


# -----------------------------
# 🧹 LIMPIAR EXPORTACIONES (opcional)
# -----------------------------
@app.post("/export/clear")
def limpiar_exportaciones():
    # Endpoint de placeholder (por compatibilidad futura)
    return {"message": "Exportaciones limpiadas (no persistentes)"}
