import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt  # Asegúrate de tenerlo instalado: pip install PyJWT
from dotenv import load_dotenv

# Cargar variables de entorno desde .env (si no lo haces desde el Dockerfile)
load_dotenv()

# Configuración de usuario y contraseña por defecto
APP_USER = os.getenv("APP_USER", "admin")
APP_PASS = os.getenv("APP_PASS", "admin")

# Configuración del token JWT
SECRET_KEY = os.getenv("SECRET_KEY", "clave-ultra-secreta")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

app = FastAPI(title="Konyx API (mínimo)")

# Modelo de datos para login
class LoginBody(BaseModel):
    user: str
    password: str

# Ruta de prueba
@app.get("/ping")
def ping():
    return {"ok": True}

# Ruta de login
@app.post("/auth/login")
def login(body: LoginBody):
    if body.user != APP_USER or body.password != APP_PASS:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": body.user,
        "exp": expire
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    return {"token": token}
