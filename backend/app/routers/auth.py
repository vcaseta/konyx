from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any
import os

from app.core.persistence import load_data, save_data

router = APIRouter(prefix="/auth", tags=["auth"])

# ======================================================
# ⚙️ CONFIGURACIÓN
# ======================================================
SECRET_USER = "admenplural"  # 👈 Usuario fijo (no expuesto)
DEFAULT_PASS = os.getenv("KONYX_SECRET", "peloponcho@25-superseguro")

# -----------------------------
# Modelos
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
    """Lee el cuerpo JSON o FormData de la petición."""
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
    """Garantiza que todas las claves estén presentes."""
    d.setdefault("password", DEFAULT_PASS)
    d.setdefault("apiKissoro", "")
    d.setdefault("apiEnPlural", "")
    d.setdefault("apiGroq", "")
    d.setdefault("ultimoExport", "-")
    d.setdefault("totalExportaciones", 0)
    d.setdefault("totalExportacionesFallidas", 0)
    d.setdefault("intentosLoginFallidos", 0)
    d.setdefault("totalLogins", 0)
    return d


# ======================================================
# 🔑 LOGIN
# ======================================================
@router.post("/login", include_in_schema=True)
async def login(request: Request):
    """
    Inicia sesión validando usuario y contraseña.
    Acepta JSON o FormData.
    """
    payload = await _read_payload(request)
    username = (payload.get("user") or payload.get("username") or "").strip()
    password = (payload.get("password") or "").strip()

    if not username or not password:
        raise HTTPException(status_code=400, detail="Faltan usuario o contraseña.")

    data = _ensure_defaults(load_data())

    # 🔒 Validación estricta
    if username != SECRET_USER or password != data.get("password", DEFAULT_PASS):
        data["intentosLoginFallidos"] = int(data.get("intentosLoginFallidos", 0)) + 1
        save_data(data)
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    # ✅ Login correcto
    data["totalLogins"] = int(data.get("totalLogins", 0)) + 1
    data["ultimoLogin"] = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    save_data(data)

    return {"token": "konyx_token_demo"}


# ======================================================
# 📊 STATUS
# ======================================================
@router.get("/status")
def status():
    """Devuelve configuración y métricas generales."""
    data = _ensure_defaults(load_data())
    return {
        "password": data.get("password", DEFAULT_PASS),
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


# ======================================================
# 🔧 UPDATE PASSWORD
# ======================================================
@router.post("/update_password")
async def update_password(req: PasswordUpdate):
    """Cambia la contraseña global."""
    if not req.password:
        raise HTTPException(status_code=400, detail="La nueva contraseña no puede estar vacía.")

    data = _ensure_defaults(load_data())
    data["password"] = req.password
    save_data(data)

    return {"message": "Contraseña actualizada correctamente", "password": req.password}


# ======================================================
# 🔧 UPDATE APIS
# ======================================================
@router.post("/update_apis")
async def update_apis(req: ApiUpdate):
    """Actualiza las claves API (Kissoro, EnPlural y Groq)."""
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
