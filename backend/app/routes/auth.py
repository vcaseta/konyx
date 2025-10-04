# app/routes/auth.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt

router = APIRouter()

# Usuarios demo (usuario: contraseña)
VALID_USERS = {
    "admin": "admin",
    "otro": "1234"
}

# Configuración JWT
SECRET_KEY = "cambia-esto-por-una-clave-muy-segura"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

class LoginRequest(BaseModel):
    user: str
    password: str

class TokenResponse(BaseModel):
    token: str

@router.post("/auth/login", response_model=TokenResponse)
def login(data: LoginRequest):
    if data.user not in VALID_USERS or VALID_USERS[data.user] != data.password:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": data.user,
        "exp": expire
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    return {"token": token}
