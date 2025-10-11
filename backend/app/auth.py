import json
from fastapi import APIRouter, HTTPException, Header, Form
from pydantic import BaseModel
from pathlib import Path

router = APIRouter(prefix="/auth", tags=["auth"])

# Ruta de almacenamiento persistente
STORAGE_FILE = Path("backend/app/storage.json")


# -----------------------------
# UTILIDADES DE LECTURA/ESCRITURA
# -----------------------------
def read_storage():
    if not STORAGE_FILE.exists():
        default_data = {
            "password": "admin123",
            "apis": {"kissoro": "", "enplural": "", "groq": ""},
            "ultimoExport": "-",
            "totalExportaciones": 0,
            "totalExportacionesFallidas": 0,
            "intentosLoginFallidos": 0,
            "totalLogins": 0,
        }
        write_storage(default_data)
    with open(STORAGE_FILE, "r") as f:
        return json.load(f)


def write_storage(data):
    with open(STORAGE_FILE, "w") as f:
        json.dump(data, f, indent=2)


# -----------------------------
# MODELOS
# -----------------------------
class LoginRequest(BaseModel):
    username: str
    password: str


# -----------------------------
# ENDPOINTS
# -----------------------------
@router.post("/login")
async def login(req: LoginRequest):
    storage = read_storage()
    if req.password != storage.get("password", "admin123"):
        storage["intentosLoginFallidos"] = storage.get("intentosLoginFallidos", 0) + 1
        write_storage(storage)
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    # Login correcto
    storage["totalLogins"] = storage.get("totalLogins", 0) + 1
    write_storage(storage)
    return {"token": "fake-jwt-token"}


@router.post("/change-password")
async def change_password(
    old_password: str = Form(...),
    new_password: str = Form(...),
    authorization: str = Header(None)
):
    storage = read_storage()
    if authorization != "Bearer fake-jwt-token":
        raise HTTPException(status_code=401, detail="No autorizado")
    if old_password != storage.get("password", "admin123"):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")
    storage["password"] = new_password
    write_storage(storage)
    return {"msg": "Contraseña cambiada"}


@router.post("/apis")
async def change_apis(
    kissoro: str = Form(""),
    enplural: str = Form(""),
    groq: str = Form(""),
    authorization: str = Header(None)
):
    storage = read_storage()
    if authorization != "Bearer fake-jwt-token":
        raise HTTPException(status_code=401, detail="No autorizado")

    if "apis" not in storage:
        storage["apis"] = {"kissoro": "", "enplural": "", "groq": ""}

    storage["apis"]["kissoro"] = kissoro
    storage["apis"]["enplural"] = enplural
    storage["apis"]["groq"] = groq
    write_storage(storage)
    return {"msg": "APIs actualizadas"}


@router.get("/status")
async def status():
    """Devuelve configuración y estadísticas para el dashboard"""
    storage = read_storage()
    return {
        "password": storage.get("password", "admin123"),
        "apiKissoro": storage.get("apis", {}).get("kissoro", ""),
        "apiEnPlural": storage.get("apis", {}).get("enplural", ""),
        "apiGroq": storage.get("apis", {}).get("groq", ""),
        "ultimoExport": storage.get("ultimoExport", "-"),
        "totalExportaciones": storage.get("totalExportaciones", 0),
        "totalExportacionesFallidas": storage.get("totalExportacionesFallidas", 0),
        "intentosLoginFallidos": storage.get("intentosLoginFallidos", 0),
        "totalLogins": storage.get("totalLogins", 0),
    }

