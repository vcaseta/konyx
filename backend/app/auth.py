from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any

from app.core.persistence import load_data, save_data

router = APIRouter(prefix="/auth", tags=["auth"])


# -----------------------------
# Modelos
# -----------------------------
class LoginRequest(BaseModel):
    username: Optional[str] = None
    password: str


class PasswordUpdate(BaseModel):
    old_password: str
    new_password: str
    confirm: str


class ApiUpdate(BaseModel):
    apiKissoro: Optional[str] = None
    apiEnPlural: Optional[str] = None
    apiGroq: Optional[str] = None


# -----------------------------
# Helpers
# -----------------------------
async def _read_payload(request: Request) -> Dict[str, Any]:
    """
    Lee el payload tanto si llega como JSON como si llega como FormData.
    Devuelve siempre un dict plano.
    """
    try:
        data = await request.json()
        if isinstance(data, dict):
            return data
    except Exception:
        pass

    try:
        form = await request.form()
        return {k: (v if v is not None else "") for k, v in form.items()}
    except Exception:
        pass

    return {}


def _ensure_defaults(d: Dict[str, Any]) -> Dict[str, Any]:
    """
    Garantiza llaves por defecto en el storage.
    No sobreescribe valores existentes.
    """
    d.setdefault("password", "admin123")
    d.setdefault("apiKissoro", "")
    d.setdefault("apiEnPlural", "")
    d.setdefault("apiGroq", "")
    d.setdefault("ultimoExport", "-")
    d.setdefault("totalExportaciones", 0)
    d.setdefault("totalExportacionesFallidas", 0)
    d.setdefault("intentosLoginFallidos", 0)
    d.setdefault("totalLogins", 0)
    return d


# -----------------------------
# Endpoints
# -----------------------------
@router.post("/login")
async def login(request: Request):
    """
    Acepta:
      - JSON: { "username": "...", "password": "..." }
      - FormData: username=...&password=...
    """
    payload = await _read_payload(request)
    password = (payload.get("password") or "").strip()

    if not password:
        raise HTTPException(status_code=400, detail="Falta 'password'.")

    data = _ensure_defaults(load_data())

    if password != data.get("password", "admin123"):
        data["intentosLoginFallidos"] = int(data.get("intentosLoginFallidos", 0)) + 1
        save_data(data)
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    data["totalLogins"] = int(data.get("totalLogins", 0)) + 1
    data["ultimoLogin"] = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    save_data(data)

    return {"token": "konyx_token_demo"}


@router.get("/status")
def status():
    """
    Devuelve configuración y métricas para el dashboard.
    """
    data = _ensure_defaults(load_data())
    return {
        "password": data.get("password", "admin123"),
        "apiKissoro": data.get("apiKissoro", ""),
        "apiEnPlural": data.get("apiEnPlural", ""),
        "apiGroq": data.get("apiGroq", ""),
        "ultimoExport": data.get("ultimoExport", "-"),
        "totalExportaciones": data.get("totalExportaciones", 0),
        "totalExportacionesFallidas": data.get("totalExportacionesFallidas", 0),
        "intentosLoginFallidos": data.get("intentosLoginFallidos", 0),
        "totalLogins": data.get("totalLogins", 0),
        "archivo_generado": data.get("archivo_generado", ""),
    }


@router.post("/update_password")
async def update_password(req: PasswordUpdate):
    """
    Cambia la contraseña global. Se usa desde PanelConfig.
    """
    data = _ensure_defaults(load_data())

    # Validar contraseña actual
    if req.old_password != data.get("password", "admin123"):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")

    # Validar coincidencia
    if req.new_password != req.confirm:
        raise HTTPException(status_code=400, detail="Las contraseñas no coinciden")

    # Actualizar y guardar
    data["password"] = req.new_password
    save_data(data)

    return {"message": "Contraseña actualizada correctamente", "password": req.new_password}


@router.post("/update_apis")
async def update_apis(req: ApiUpdate):
    """
    Actualiza APIs de Kissoro / EnPlural / Groq.
    """
    data = _ensure_defaults(load_data())

    if req.apiKissoro is not None:
        data["apiKissoro"] = req.apiKissoro
    if req.apiEnPlural is not None:
        data["apiEnPlural"] = req.apiEnPlural
    if req.apiGroq is not None:
        data["apiGroq"] = req.apiGroq

    save_data(data)
    return {
        "message": "APIs actualizadas correctamente",
        "apiKissoro": data["apiKissoro"],
        "apiEnPlural": data["apiEnPlural"],
        "apiGroq": data["apiGroq"],
    }
