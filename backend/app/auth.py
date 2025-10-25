from fastapi import APIRouter, HTTPException, Request, Body
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import jwt, JWTError
import os
import time

from app.core.persistence import load_data, save_data

router = APIRouter(prefix="/auth", tags=["auth"])

# ============================================================
# 🔐 Configuración de seguridad
# ============================================================
SECRET_KEY = os.getenv("KONYX_SECRET", "supersecret_konyx")
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 1440  # 24 h
USUARIO_FIJO = "admenplural"

# ============================================================
# 🧠 Anti-abuso básico (rate limit)
# ============================================================
RATE_LIMIT_WINDOW = 60  # segundos
MAX_REQUESTS_PER_MINUTE = 30
_last_requests: Dict[str, list] = {}  # { ip: [timestamps] }


def _check_rate_limit(ip: str):
    now = time.time()
    timestamps = [t for t in _last_requests.get(ip, []) if now - t < RATE_LIMIT_WINDOW]
    if len(timestamps) >= MAX_REQUESTS_PER_MINUTE:
        raise HTTPException(status_code=429, detail="Demasiadas solicitudes, espere un momento")
    timestamps.append(now)
    _last_requests[ip] = timestamps


# ============================================================
# 🧩 Modelos
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
# 🧰 Helpers
# ============================================================
async def _read_payload(request: Request) -> Dict[str, Any]:
    """Lee el cuerpo del request (JSON o FormData)."""
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
    """Inicializa campos por defecto en la base persistente."""
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


def _create_token(username: str):
    """Genera token JWT con expiración."""
    expire = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    payload = {"sub": username, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def _verify_jwt_header(auth_header: Optional[str]):
    """Valida el token JWT recibido en Authorization header."""
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token no proporcionado")

    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username != USUARIO_FIJO:
            raise HTTPException(status_code=401, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")


# ============================================================
# 🚪 Endpoints
# ============================================================

@router.post("/login")
async def login(request: Request):
    """Autenticación básica con control de intentos."""
    client_ip = request.client.host
    _check_rate_limit(client_ip)

    payload = await _read_payload(request)
    username = (payload.get("user") or payload.get("username") or "").strip()
    password = (payload.get("password") or "").strip()

    if not password:
        raise HTTPException(status_code=400, detail="Falta 'password'.")

    data = _ensure_defaults(load_data())

    if int(data.get("intentosLoginFallidos", 0)) >= 10:
        raise HTTPException(status_code=403, detail="Demasiados intentos fallidos. Espere unos minutos.")

    if username != USUARIO_FIJO or password != data.get("password", "admin123"):
        data["intentosLoginFallidos"] = int(data.get("intentosLoginFallidos", 0)) + 1
        save_data(data)
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    # Login correcto
    data["intentosLoginFallidos"] = 0
    data["totalLogins"] = int(data.get("totalLogins", 0)) + 1
    data["ultimoLogin"] = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    save_data(data)

    token = _create_token(username or USUARIO_FIJO)
    return {"token": token}


@router.get("/status")
def status():
    """Devuelve estadísticas generales (sin exponer contraseñas)."""
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


@router.post("/update_password")
async def update_password(request: Request, req: PasswordUpdate = Body(...)):
    """Cambia la contraseña global. Requiere token JWT."""
    _verify_jwt_header(request.headers.get("Authorization"))  # ✅ Autenticación obligatoria

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


@router.post("/update_apis")
async def update_apis(request: Request, req: ApiUpdate = Body(...)):
    """Actualiza las claves API (Kissoro, EnPlural y Groq). Requiere token JWT."""
    _verify_jwt_header(request.headers.get("Authorization"))  # ✅ Autenticación obligatoria

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


@router.get("/verify")
async def verify_token(request: Request):
    """Verifica si el token JWT sigue siendo válido."""
    client_ip = request.client.host
    _check_rate_limit(client_ip)

    auth_header = request.headers.get("Authorization")
    try:
        _verify_jwt_header(auth_header)
        return {"valid": True, "user": USUARIO_FIJO}
    except HTTPException:
        return {"valid": False}
