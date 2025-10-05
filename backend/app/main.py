
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import json
import os

app = FastAPI()

# -------------------- CORS --------------------
origins = [
    "http://192.168.1.50:3000",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- Archivos de persistencia --------------------
CREDENTIALS_FILE = Path(__file__).parent / "credentials.json"
APIS_FILE = Path(__file__).parent / "apis.json"

# Inicialización si no existen
if not CREDENTIALS_FILE.exists():
    json.dump(
        {"user": "admenplural", "password": os.getenv("KONYX_PASSWORD", "admin123")},
        open(CREDENTIALS_FILE, "w"),
        indent=2
    )

if not APIS_FILE.exists():
    json.dump({"kissoro": "", "enplural": ""}, open(APIS_FILE, "w"), indent=2)

# -------------------- Modelos --------------------
class LoginRequest(BaseModel):
    user: str
    password: str

class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str

class APIsRequest(BaseModel):
    kissoro: str
    enplural: str

# -------------------- Helpers --------------------
def load_credentials():
    return json.load(open(CREDENTIALS_FILE))

def save_credentials(creds):
    json.dump(creds, open(CREDENTIALS_FILE, "w"), indent=2)

def load_apis():
    return json.load(open(APIS_FILE))

def save_apis(apis):
    json.dump(apis, open(APIS_FILE, "w"), indent=2)

# -------------------- Endpoints --------------------
@app.post("/auth/login")
async def login(data: LoginRequest):
    creds = load_credentials()
    if data.user != creds["user"] or data.password != creds["password"]:
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrecta")
    return {"token": "fake-jwt-token"}  # más adelante reemplazar por JWT real

@app.post("/auth/change-password")
async def change_password(req: PasswordChangeRequest):
    creds = load_credentials()
    if req.old_password != creds["password"]:
        raise HTTPException(status_code=401, detail="Contraseña actual incorrecta")
    creds["password"] = req.new_password
    save_credentials(creds)
    return {"detail": "Contraseña cambiada correctamente"}

@app.post("/auth/apis")
async def change_apis(req: APIsRequest):
    save_apis({"kissoro": req.kissoro, "enplural": req.enplural})
    return {"detail": "APIs actualizadas correctamente"}
