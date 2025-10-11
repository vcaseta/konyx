from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any

from app.core.persistence import load_data, save_data

router = APIRouter(prefix="/auth", tags=["auth"])


# -----------------------------
# Modelos (solo para documentación)
# -----------------------------
class LoginRequest(BaseModel):
    username: Optional[str] = None
    password: str


class PasswordUpdate(BaseModel):
    password: str


class ApiUpdate(BaseModel):
    apiKissoro: Optional[str] = None
    apiEnPlural: Optional[str] = None
    apiGroq: Optional[str] = None


# -----------------------------
# Helpers
# -----------------------------
async def _read_payload(request: Request) -> Dict[str, Any]:
    """
    Lee el cuerpo de la petición, ya sea JSON o FormData.
    Devuelve siempre un diccionario plano.
    """
    try:
        data = await request.json()
        if isinstance(data, dict):
            return data
    except Exception:
        pass

    try:
        form = await request.form()
        return {k: v for k, v in form.items()}
    except Exception:
        pass

    return {}


def _ensure_defaults(d: Dict[str, Any]) -> Dict[str, Any]:
    """Garantiza la existencia de todas las claves esperadas."""
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
@router.post("/login", include_in_schema=True)
async def login(request: Request):
    """
    Inicia sesión validando la contraseña almacenada.
    Acepta JSON o FormData.
    """
    payload = await _read_payload(request)
    password = (payload.get("password") or "").strip()

    if not password:
        raise HTTPException(status_code=400, detail="Falta el campo 'password'.")

    data = _ensure_defaults(load_data())

    # Contraseña incorrecta
    if password != data.get("password", "admin123"):
        data["intentosLoginFallidos"] = int(data.get("intentosLoginFallidos", 0)) + 1
        save_data(data)
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    # Login correcto
    data["totalLogins"] = int(data.get("totalLogins", 0)) + 1
    data["ultimoLogin"] = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    save_data(data)

    return {"token": "konyx_token_demo"}


@router.get("/status")
def status():
    """
    Devuelve configuración y métricas generales para el dashboard.
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
    Cambia la contraseña global.
    """
    if not req.password:
        raise HTTPException(status_code=400, detail="La nueva contraseña no puede estar vacía.")

    data = _ensure_defaults(load_data())
    data["password"] = req.password
    save_data(data)

    return {"message": "Contraseña actualizada correctamente", "password": req.password}


@router.post("/update_apis")
async def update_apis(req: ApiUpdate):
    """
    Actualiza las claves API (Kissoro, EnPlural y Groq).
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

