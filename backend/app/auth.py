from fastapi import APIRouter, HTTPException, Request, Body
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import jwt, JWTError
import os

from app.core.persistence import load_data, save_data

router = APIRouter(prefix="/auth", tags=["auth"])

# ============================================================
# ⚙️ CONFIGURACIÓN DE SEGURIDAD
# ============================================================
SECRET_KEY = os.getenv("KONYX_SECRET", "supersecret_konyx").strip()
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 1440  # 24 horas


# ============================================================
# 📦 MODELOS
# ============================================================
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


# ============================================================
# 🧩 HELPERS
# ============================================================
async def _read_payload(request: Request) -> Dict[str, Any]:
    """Lee el payload tanto si llega como JSON como FormData."""
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
    """Garantiza llaves por defecto en el storage."""
    d.setdefault("password", "admin123")
    d.setdefault("apiKissoro", "")
    d.setdefault("apiEnPlural", "")
    d.setdefault("apiGroq", "")
    d.setdefault("ultimoExport", "-")
    d.setdefault("totalExportaciones", 0)
    d.setdefault("totalExportacionesFallidas", 0)
    d.setdefault("intentosLoginFallidos", 0)
    d.setdefault("totalLogins", 0)
    d.setdefault("ultimoLogin", "-")
    return d


def _create_token(username: str) -> str:
    """Genera un token JWT con expiración."""
    expire = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    payload = {"sub": username, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


# ============================================================
# 🚪 LOGIN
# ============================================================
@router.post("/login")
async def login(request: Request):
    """Autenticación básica con contador de intentos fallidos."""
    payload = await _read_payload(request)
    username = (payload.get("user") or payload.get("username") or "").strip()
    password = (payload.get("password") or "").strip()

    if not password:
        raise HTTPException(status_code=400, detail="Falta 'password'.")

    data = _ensure_defaults(load_data())

    # Bloqueo si demasiados intentos fallidos
    if int(data.get("intentosLoginFallidos", 0)) >= 10:
        raise HTTPException(status_code=403, detail="Demasiados intentos fallidos. Espere unos minutos.")

    # Validar contraseña
    if password != data.get("password", "
