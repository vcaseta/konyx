from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
import os

app = FastAPI(title="Konyx API")

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/login")
def login(data: LoginRequest):
    if data.username == os.getenv("ADMIN_USER") and data.password == os.getenv("ADMIN_PASS"):
        return {"success": True, "token": "fake-jwt-token"}
    raise HTTPException(status_code=401, detail="Credenciales inválidas")

@app.get("/ping")
def ping():
    return {"status": "ok"}
