from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import secrets

app = FastAPI()

# Permitir frontend en CORS
FRONTEND_ORIGINS = ["http://192.168.1.50:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],      # permite GET, POST, OPTIONS
    allow_headers=["*"],      # permite Content-Type, Authorization, etc.
)

class LoginRequest(BaseModel):
    user: str
    password: str

# Credenciales iniciales
DEFAULT_USER = os.getenv("KONYX_USER", "adminplural")
DEFAULT_PASSWORD = os.getenv("KONYX_PASSWORD", "admin123")

@app.post("/auth/login")
async def login(data: LoginRequest):
    if data.user != DEFAULT_USER or data.password != DEFAULT_PASSWORD:
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrecta")
    token = secrets.token_hex(16)
    return {"token": token}
