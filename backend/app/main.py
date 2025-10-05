from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json, os

app = FastAPI()

# ---------------- CORS ----------------
origins = ["http://192.168.1.50:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Configuración persistente ----------------
CONFIG_FILE = "config.json"

if not os.path.exists(CONFIG_FILE):
    config = {
        "password": os.getenv("ADMIN_PASSWORD", "admin123"),  # contraseña inicial
        "apis": {"kissoro": "", "enplural": ""}
    }
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f)
else:
    with open(CONFIG_FILE, "r") as f:
        config = json.load(f)

# ---------------- Modelos ----------------
class LoginRequest(BaseModel):
    user: str
    password: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

class UpdateApisRequest(BaseModel):
    kissoro: str
    enplural: str

# ---------------- Endpoints ----------------
@app.post("/auth/login")
def login(req: LoginRequest):
    if req.user != "admenplural" or req.password != config["password"]:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    return {"token": "dummy-token"}

@app.post("/auth/change-password")
def change_password(req: ChangePasswordRequest):
    if req.old_password != config["password"]:
        raise HTTPException(status_code=401, detail="Contraseña actual incorrecta")
    config["password"] = req.new_password
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f)
    return {"msg": "Contraseña actualizada correctamente"}

@app.post("/auth/apis")
def update_apis(req: UpdateApisRequest):
    config["apis"]["kissoro"] = req.kissoro
    config["apis"]["enplural"] = req.enplural
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f)
    return {"msg": "APIs actualizadas correctamente"}
