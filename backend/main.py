import json, os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt

APP_USER = os.getenv("APP_USER", "admin")
APP_PASS = os.getenv("APP_PASS", "admin")
SECRET_KEY = os.getenv("SECRET_KEY", "konyx-super-secreto")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

DATA_FILE = "data.json"

app = FastAPI(title="Konyx API")

class LoginBody(BaseModel):
    user: str
    password: str

class TokenResponse(BaseModel):
    token: str

bearer_scheme = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Token inválido")
        return {"user": username}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

def read_data():
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, "w") as f:
            json.dump({"password": APP_PASS, "apis": {"kissoro": "", "enplural": ""}}, f)
    with open(DATA_FILE) as f:
        return json.load(f)

def write_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f)

@app.get("/ping")
def ping():
    return {"ok": True}

@app.post("/auth/login", response_model=TokenResponse)
def login(body: LoginBody):
    data = read_data()
    if body.user == APP_USER and body.password == data.get("password", APP_PASS):
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {"sub": body.user, "exp": expire}
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        return {"token": token}
    raise HTTPException(status_code=401, detail="Credenciales inválidas")

@app.get("/auth/me")
def me(user_data: dict = Depends(get_current_user)):
    return {"user": user_data["user"]}

@app.get("/auth/apis")
def get_apis(user_data: dict = Depends(get_current_user)):
    data = read_data()
    return data.get("apis", {})

@app.post("/auth/apis")
def set_apis(body: dict, user_data: dict = Depends(get_current_user)):
    data = read_data()
    data["apis"]["kissoro"] = body.get("kissoro", data["apis"].get("kissoro", ""))
    data["apis"]["enplural"] = body.get("enplural", data["apis"].get("enplural", ""))
    write_data(data)
    return data["apis"]

@app.post("/auth/change-password")
def change_password(body: dict, user_data: dict = Depends(get_current_user)):
    data = read_data()
    old_pass = body.get("old_password")
    new_pass = body.get("new_password")
    if old_pass != data.get("password", APP_PASS):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")
    data["password"] = new_pass
    write_data(data)
    return {"ok": True}
