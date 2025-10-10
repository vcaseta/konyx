from fastapi import APIRouter, HTTPException
from app.core.persistence import load_data, save_data
from app.models.models import LoginRequest, PasswordUpdate, ApiUpdate

router = APIRouter()

@router.post("/login")
def login(req: LoginRequest):
    data = load_data()
    if req.password != data.get("password"):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    return {"token": "konyx_token_demo"}

@router.get("/status")
def status():
    """Devuelve el estado completo sincronizable con el frontend."""
    data = load_data()
    return {
        "password": data.get("password", "admin123"),
        "apiKissoro": data.get("apiKissoro", ""),
        "apiEnPlural": data.get("apiEnPlural", ""),
        "ultimoExport": data.get("ultimoExport", "-"),
        "totalExportaciones": data.get("totalExportaciones", 0),
        "totalExportacionesFallidas": data.get("totalExportacionesFallidas", 0)  # ✅ Nuevo campo expuesto
    }

@router.post("/update_password")
def update_password(req: PasswordUpdate):
    data = load_data()
    data["password"] = req.password
    save_data(data)
    return {"message": "Contraseña actualizada correctamente", "password": req.password}

@router.post("/update_apis")
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
