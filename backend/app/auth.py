from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.core.persistence import load_data, save_data

router = APIRouter(prefix="/auth", tags=["auth"])

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
    apiGroq: str | None = None


# -----------------------------
# 🔑 LOGIN
# -----------------------------
@router.post("/login")
def login(req: LoginRequest):
    data = load_data()
    if req.password != data.get("password"):
        data["intentosLoginFallidos"] = data.get("intentosLoginFallidos", 0) + 1
        save_data(data)
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    return {"token": "konyx_token_demo"}


# -----------------------------
# 📡 STATUS
# -----------------------------
@router.get("/status")
def status():
    data = load_data()
    return {
        "password": data.get("password", "admin123"),
        "apiKissoro": data.get("apiKissoro", ""),
        "apiEnPlural": data.get("apiEnPlural", ""),
        "apiGroq": data.get("apiGroq", ""),
        "ultimoExport": data.get("ultimoExport", "-"),
        "totalExportaciones": data.get("totalExportaciones", 0),
        "totalExportacionesFallidas": data.get("totalExportacionesFallidas", 0),
        "intentosLoginFallidos": data.get("intentosLoginFallidos", 0),
    }


# -----------------------------
# 🧩 ACTUALIZAR CONTRASEÑA
# -----------------------------
@router.post("/update_password")
def update_password(req: PasswordUpdate):
    data = load_data()
    data["password"] = req.password
    save_data(data)
    return {"message": "Contraseña actualizada correctamente", "password": req.password}


# -----------------------------
# 🌐 ACTUALIZAR APIS (Kissoro, EnPlural, Groq)
# -----------------------------
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

    return {
        "message": "APIs actualizadas correctamente",
        "apiKissoro": data.get("apiKissoro", ""),
        "apiEnPlural": data.get("apiEnPlural", ""),
        "apiGroq": data.get("apiGroq", ""),
    }

