from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.persistence import load_data, save_data

router = APIRouter(tags=["auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

class PasswordUpdate(BaseModel):
    password: str

class ApiUpdate(BaseModel):
    apiKissoro: str | None = None
    apiEnPlural: str | None = None

@router.post("/login")
def login(req: LoginRequest):
    data = load_data()

    if req.password != data.get("password"):
        data["loginFallidos"] = data.get("loginFallidos", 0) + 1
        save_data(data)
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    return {"token": "konyx_token_demo"}

@router.get("/status")
def status():
    data = load_data()
    return {
        "password": data.get("password", "admin123"),
        "apiKissoro": data.get("apiKissoro", ""),
        "apiEnPlural": data.get("apiEnPlural", ""),
        "ultimoExport": data.get("ultimoExport", "-"),
        "totalExportaciones": data.get("totalExportaciones", 0),
        "exportacionesFallidas": data.get("exportacionesFallidas", 0),
        "loginFallidos": data.get("loginFallidos", 0)
    }

@router.post("/update_password")
def update_password(req: PasswordUpdate):
    data = load_data()
    data["password"] = req.password
    save_data(data)
    return {"message": "Contraseña actualizada correctamente"}

@router.post("/update_apis")
def update_apis(req: ApiUpdate):
    data = load_data()
    if req.apiKissoro is not None:
        data["apiKissoro"] = req.apiKissoro
    if req.apiEnPlural is not None:
        data["apiEnPlural"] = req.apiEnPlural
    save_data(data)
    return {"message": "APIs actualizadas correctamente"}
