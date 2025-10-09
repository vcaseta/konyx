from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json, os, secrets

app = FastAPI(title="Konyx Backend", version="1.0")

# Permitir conexión desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = "data.json"

# Inicializar datos por defecto
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


class LoginRequest(BaseModel):
    username: str
    password: str


@app.post("/auth/login")
def login(req: LoginRequest):
    data = read_data()
    if req.password != data["password"]:
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")
    token = secrets.token_hex(16)
    return {"token": token}


class PasswordChange(BaseModel):
    old_password: str
    new_password: str


@app.post("/auth/change_password")
def change_password(req: PasswordChange):
    data = read_data()
    if req.old_password != data["password"]:
        raise HTTPException(status_code=403, detail="Contraseña actual incorrecta")
    data["password"] = req.new_password
    write_data(data)
    return {"message": "Contraseña actualizada correctamente"}


class ApiConfig(BaseModel):
    apiKissoro: str | None = None
    apiEnPlural: str | None = None


@app.post("/config/apis")
def update_apis(req: ApiConfig):
    data = read_data()
    if req.apiKissoro is not None:
        data["apiKissoro"] = req.apiKissoro
    if req.apiEnPlural is not None:
        data["apiEnPlural"] = req.apiEnPlural
    write_data(data)
    return {"message": "APIs actualizadas correctamente"}


@app.get("/config/apis")
def get_apis():
    data = read_data()
    return {
        "apiKissoro": data["apiKissoro"],
        "apiEnPlural": data["apiEnPlural"]
    }
