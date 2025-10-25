from fastapi import APIRouter, HTTPException, Request, Body, Header
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import jwt, JWTError, ExpiredSignatureError
import os

from app.core.persistence import load_data, save_data

router = APIRouter(prefix="/auth", tags=["auth"])

# ============================================================
# ⚙️ CONFIGURACIÓN DE SEGURIDAD
# ============================================================
SECRET_KEY = os.getenv("KONYX_SECRET", "supersecret_konyx").strip()
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 1440  # 24 horas
VALID_USERNAME = "admenplural"  # Usuario interno oculto


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


def _verify_token(token: str) -> dict:
    """Verifica un token JWT y devuelve el payload si es válido."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username != VALID_USERNAME:
            raise HTTPException(status_code=401, detail="Token inválido (usuario incorrecto)")
        return payload
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")


# ============================================================
# 🚪 LOGIN
# ============================================================
@router.post("/login")
async def login(request: Request):
    """Autenticación con usuario fijo oculto y control de intentos."""
    payload = await _read_payload(request)
    username = (payload.get("user") or payload.get("username") or "").strip()
    password = (payload.get("password") or "").strip()

    if not username or not password:
        raise HTTPException(status_code=400, detail="Faltan credenciales.")

    data = _ensure_defaults(load_data())

    # 🔒 Bloqueo tras demasiados intentos
    if int(data.get("intentosLoginFallidos", 0)) >= 10:
        raise HTTPException(status_code=403, detail="Demasiados intentos fallidos. Espere unos minutos.")

    # ✅ Validar usuario y contraseña
    if username.lower() != VALID_USERNAME or password != data.get("password", "admin123"):
        data["intentosLoginFallidos"] = int(data.get("intentosLoginFallidos", 0)) + 1
        save_data(data)
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    # 🎯 Login correcto
    data["intentosLoginFallidos"] = 0
    data["totalLogins"] = int(data.get("totalLogins", 0)) + 1
    data["ultimoLogin"] = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    save_data(data)

    token = _create_token(username)
    return {"token": token, "expires_in": TOKEN_EXPIRE_MINUTES * 60}


# ============================================================
# 🧾 VERIFY TOKEN
# ============================================================
@router.get("/verify")
def verify_token(authorization: Optional[str] = Header(None)):
    """
    Verifica si el token JWT sigue siendo válido.
    Se usa en el frontend para mantener la sesión activa.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Token no proporcionado")

    # Espera un header del tipo: Authorization: Bearer <token>
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Formato de token inválido")

    token = parts[1]
    payload = _verify_token(token)
    return {"valid": True, "user": payload.get("sub"), "exp": payload.get("exp")}


# ============================================================
# 📊 STATUS
# ============================================================
@router.get("/status")
def status():
    """Devuelve estado general (sin contraseñas)."""
    data = _ensure_defaults(load_data())
    return {
        "status": "ok",
        "ultimoExport": data.get("ultimoExport", "-"),
        "totalExportaciones": data.get("totalExportaciones", 0),
        "totalExportacionesFallidas": data.get("totalExportacionesFallidas", 0),
        "intentosLoginFallidos": data.get("intentosLoginFallidos", 0),
        "totalLogins": data.get("totalLogins", 0),
        "ultimoLogin": data.get("ultimoLogin", "-"),
    }


# ============================================================
# 🔑 CAMBIO DE CONTRASEÑA
# ============================================================
@router.post("/update_password")
async def update_password(req: PasswordUpdate = Body(...)):
    """Permite cambiar la contraseña global del sistema."""
    data = _ensure_defaults(load_data())

    if req.old_password != data.get("password", "admin123"):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")
    if req.new_password != req.confirm:
        raise HTTPException(status_code=400, detail="Las contraseñas no coinciden")
    if len(req.new_password) < 6:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 6 caracteres")

    data["password"] = req.new_password
    save_data(data)
    return {"message": "Contraseña actualizada correctamente"}


# ============================================================
# 🔁 ACTUALIZAR CLAVES DE API
# ============================================================
@router.post("/update_apis")
async def update_apis(req: ApiUpdate = Body(...)):
    """Actualiza APIs de Kissoro / EnPlural / Groq."""
    data = _ensure_defaults(load_data())

    if req.apiKissoro is not None:
        data["apiKissoro"] = req.apiKissoro
    if req.apiEnPlural is not None:
        data["apiEnPlural"] = req.apiEnPlural
    if req.apiGroq is not None:
        data["apiGroq"] = req.apiGroq

    save_data(data)
    return {"message": "APIs actualizadas correctamente"}
