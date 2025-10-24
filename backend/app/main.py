import os
from datetime import datetime, timedelta
import jwt
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# -------------------------------------------------
# Configuración general
# -------------------------------------------------
APP_USER = os.getenv("APP_USER", "admin")
APP_PASS = os.getenv("APP_PASS", "admin")
SECRET_KEY = os.getenv("SECRET_KEY", "konyx-super-secreto")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

app = FastAPI(title="Konyx API (mínimo)")

# -------------------------------------------------
# CORS (permite acceso desde IPs y dominio DuckDNS)
# -------------------------------------------------
origins = [
    "https://vcaseta.duckdns.org",
    "http://vcaseta.duckdns.org",
    "http://localhost",
    "http://127.0.0.1",
    "http://192.168.1.50",
    "http://192.168.1.51",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# Modelos
# -------------------------------------------------
class LoginBody(BaseModel):
    user: str
    password: str

class TokenResponse(BaseModel):
    token: str

# -------------------------------------------------
# Seguridad (token Bearer)
# -------------------------------------------------
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

# -------------------------------------------------
# Rutas
# -------------------------------------------------
@app.get("/ping")
def ping():
    """Ruta de prueba rápida."""
    return {"ok": True, "timestamp": datetime.utcnow().isoformat()}

@app.post("/auth/login", response_model=TokenResponse)
def login(body: LoginBody):
    """Login básico que genera token JWT."""
    if body.user == APP_USER and body.password == APP_PASS:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {"sub": body.user, "exp": expire}
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        return {"token": token}

    raise HTTPException(status_code=401, detail="Credenciales inválidas")

@app.get("/auth/me")
def read_me(user_data: dict = Depends(get_current_user)):
    """Devuelve el usuario autenticado."""
    return {"user": user_data["user"]}
