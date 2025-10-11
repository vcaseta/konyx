from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.persistence import load_data, save_data

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    username: str
    password: str

class PasswordUpdate(BaseModel):
    password: str

class ApiUpdate(BaseModel):
    apiKissoro: str | None = None
    apiEnPlural: str | None = None
    apiGroq: str | None = None

@router.post("/login")
def login(req: LoginRequest):
    data = load_data()
    if req.password != data.get("password"):
        data["intentosLoginFallidos"] = data.get("intentosLoginFallidos", 0) + 1
        save_data(data)
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")
    return {"token": "konyx_token_demo"}

@router.get("/status")
def status():
    data = load_data()
    return data

@router.post("/update_password")
def update_password(req: PasswordUpdate):
    data = load_data()
    data["password"] = req.password
    save_data(data)
    return {"message": "Contraseña actualizada", "password": req.password}

@router.post("/update_apis")
def update_apis(req: ApiUpdate):
    data = load_data()
    if req.apiKissoro is not None:
        data["apiKissoro"] = req.apiKissoro
    if req.apiEnPlural is not None:
        data["apiEnPlural"] = req.apiEnPlural
    if req.apiGroq is not None:
        data["apiGroq"] = req.apiGroq
    save_data(data)
    return {"message": "APIs actualizadas correctamente", **data}
