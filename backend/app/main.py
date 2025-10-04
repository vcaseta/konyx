import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt

# Carga usuario y contraseña desde .env o valores por defecto
APP_USER = os.getenv("APP_USER", "admin")
APP_PASS = os.getenv("APP_PASS", "admin")

# Configuración de JWT
SECRET_KEY = os.getenv("SECRET_KEY", "konyx-super-secreto")  # cambia esto en producción
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

app = FastAPI(title="Konyx API (mínimo)")

# Modelos
class LoginBody(BaseModel):
    user: str
    password: str

class TokenResponse(BaseModel):
    token: str

# Ping de prueba
@app.get("/ping")
def ping():
    return {"ok": True}

# Login con generación de token JWT real
@app.post("/auth/login", response_model=TokenResponse)
def login(body: LoginBody):
    if body.user == APP_USER and body.password == APP_PASS:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {
            "sub": body.user,
            "exp": expire
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        return {"token": token}
    
    raise HTTPException(status_code=401, detail="Credenciales inválidas")
