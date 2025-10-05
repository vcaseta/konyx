from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
import secrets

app = FastAPI()

# Configuración CORS para frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["192.168.1.50"],  # Cambiar por tu dominio en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelo de request para login
class LoginRequest(BaseModel):
    user: str
    password: str

# Credenciales iniciales desde .env
DEFAULT_USER = os.getenv("KONYX_USER", "admenplural")
DEFAULT_PASSWORD = os.getenv("KONYX_PASSWORD", "admin123")

@app.post("/auth/login")
async def login(data: LoginRequest):
    if data.user != DEFAULT_USER or data.password != DEFAULT_PASSWORD:
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrecta")
    # Genera un token simple
    token = secrets.token_hex(16)
    return {"token": token}
