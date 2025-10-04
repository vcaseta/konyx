import os
import json
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt

# ------------------ Config ------------------
DATA_FILE = "data.json"  # JSON local para persistencia
SECRET_KEY = os.getenv("SECRET_KEY", "konyx-super-secreto")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Inicializa archivo JSON si no existe
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, "w") as f:
        json.dump({"user": os.getenv("APP_USER", "admin"),
                   "pass": os.getenv("APP_PASS", "admin"),
                   "apis": {"kissoro": "", "enplural": ""}}, f)

# ------------------ App ------------------
app = FastAPI(title="Konyx Backend")

# ------------------ Modelos ------------------
class LoginBody(BaseModel):
    user: str
    password: str

class TokenResponse(BaseModel):
    token: str

class ChangePasswordBody(BaseModel):
    old_password: str
    new_password: str

class ApisBody(BaseModel):
    kissoro: str
    enplural: str

# ------------------ Seguridad ------------------
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

# ------------------ Helpers ------------------
def read_data():
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def write_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

# ------------------ Endpoints ------------------
@app.get("/ping")
def ping():
    return {"ok": True}

@app.post("/auth/login", response_model=TokenResponse)
def login(body: LoginBody):
    data = read_data()
    if body.user == data["user"] and body.password == data["pass"]:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {"sub": body.user, "exp": expire}
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        return {"token": token}
    raise HTTPException(status_code=401, detail="Credenciales inválidas")

@app.post("/auth/change-password")
def change_password(body: ChangePasswordBody, user=Depends(get_current_user)):
    data = read_data()
    if body.old_password != data["pass"]:
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")
    data["pass"] = body.new_password
    write_data(data)
    return {"ok": True, "msg": "Contraseña cambiada correctamente"}

@app.get("/auth/apis")
def get_apis(user=Depends(get_current_user)):
    data = read_data()
    return data["apis"]

@app.post("/auth/apis")
def set_apis(body: ApisBody, user=Depends(get_current_user)):
    data = read_data()
    data["apis"]["kissoro"] = body.kissoro
    data["apis"]["enplural"] = body.enplural
    write_data(data)
    return {"ok": True, "msg": "APIs actualizados correctamente"}

@app.get("/auth/me")
def read_me(user=Depends(get_current_user)):
    return {"user": user["user"]}
