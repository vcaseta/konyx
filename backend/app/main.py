import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt

# Configuración desde .env o valores por defecto
APP_USER = os.getenv("APP_USER", "admin")
APP_PASS = os.getenv("APP_PASS", "admin")
SECRET_KEY = os.getenv("SECRET_KEY", "konyx-super-secreto")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

app = FastAPI(title="Konyx API (mínimo)")

# Modelos
class LoginBody(BaseModel):
    user: str
    password: str

class TokenResponse(BaseModel):
    token: str

# Seguridad (token Bearer)
bearer_scheme = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Token inválido (sin usuario)")
        return {"user": username}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

# ------------------ Rutas ------------------

@app.get("/ping")
def ping():
    return {"ok": True}

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

@app.get("/auth/me")
def read_me(user_data: dict = Depends(get_current_user)):
    return {"user": user_data["user"]}
