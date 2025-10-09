from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json, os, secrets
from datetime import datetime

app = FastAPI(title="Konyx Backend", version="2.1")

# -------------------------
# CORS (permite conexión desde el frontend)
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # puedes restringirlo a ["http://192.168.1.50:3000"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Archivo persistente
# -------------------------
DATA_FILE = os.path.join(os.path.dirname(__file__), "data.json")

if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w") as f:
        json.dump({
            "password": "1234",
            "apiKissoro": "",
            "apiEnPlural": ""
        }, f, indent=2)

def read_data():
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def write_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

# -------------------------
# Modelos de datos
# -------------------------
class LoginRequest(BaseModel):
    username: str
    password: str

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class ApiConfig(BaseModel):
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

# -------------------------
# ENDPOINTS
# -------------------------

## --- LOGIN ---
@app.post("/auth/login")
def login(req: LoginRequest):
    data = read_data()
    if req.password != data["password"]:
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")
    token = secrets.token_hex(16)
    return {"token": token}

## --- CAMBIO DE CONTRASEÑA ---
@app.post("/auth/change_password")
def change_password(req: PasswordChange):
    data = read_data()
    if req.old_password != data["password"]:
        raise HTTPException(status_code=403, detail="Contraseña actual incorrecta")
    data["password"] = req.new_password
    write_data(data)
    return {"message": "Contraseña actualizada correctamente"}

## --- OBTENER ESTADO GENERAL ---
@app.get("/auth/status")
def get_status():
    data = read_data()
    return {
        "password": data.get("password", "1234"),
        "apiKissoro": data.get("apiKissoro", ""),
        "apiEnPlural": data.get("apiEnPlural", "")
    }

## --- ACTUALIZAR APIS ---
@app.post("/config/apis")
def update_apis(req: ApiConfig):
    data = read_data()
    if req.apiKissoro is not None:
        data["apiKissoro"] = req.apiKissoro
    if req.apiEnPlural is not None:
        data["apiEnPlural"] = req.apiEnPlural
    write_data(data)
    return {"message": "APIs actualizadas correctamente"}

## --- OBTENER APIS ---
@app.get("/config/apis")
def get_apis():
    data = read_data()
    return {
        "apiKissoro": data.get("apiKissoro", ""),
        "apiEnPlural": data.get("apiEnPlural", "")
    }

## --- EXPORTACIÓN TEMPORAL ---
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
        "usuario": req.usuario,
    }
    # ⚠️ No se guarda en disco (solo respuesta temporal)
    return {"message": "Exportación registrada (solo sesión actual)", "export": nueva}

## --- LIMPIAR EXPORTACIONES (dummy) ---
@app.post("/export/clear")
def limpiar_exportaciones():
    # No hay persistencia, pero se mantiene endpoint por compatibilidad
    return {"message": "Exportaciones limpiadas (no persistentes)"}
