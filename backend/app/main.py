import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pathlib import Path

app = FastAPI()

CREDENTIALS_FILE = Path(__file__).parent / "credentials.json"

def load_credentials():
    with open(CREDENTIALS_FILE, "r") as f:
        return json.load(f)

def save_credentials(data):
    with open(CREDENTIALS_FILE, "w") as f:
        json.dump(data, f, indent=2)

class LoginRequest(BaseModel):
    user: str
    password: str

class PasswordChangeRequest(BaseModel):
    old_password: str
    new_password: str

@app.post("/auth/login")
async def login(data: LoginRequest):
    creds = load_credentials()
    if data.user != creds["user"] or data.password != creds["password"]:
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrecta")
    return {"token": "fake-jwt-token"}  # reemplazar por JWT real si quieres

@app.post("/auth/change-password")
async def change_password(req: PasswordChangeRequest):
    creds = load_credentials()
    if req.old_password != creds["password"]:
        raise HTTPException(status_code=401, detail="Contraseña actual incorrecta")
    creds["password"] = req.new_password
    save_credentials(creds)
    return {"detail": "Contraseña cambiada correctamente"}
