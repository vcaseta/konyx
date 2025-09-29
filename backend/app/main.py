import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

APP_USER = os.getenv("APP_USER", "admin")
APP_PASS = os.getenv("APP_PASS", "admin")

app = FastAPI(title="Konyx API (mínimo)")

class LoginBody(BaseModel):
  username: str
  password: str

@app.get("/ping")
def ping():
  return {"ok": True}

@app.post("/auth/login")
def login(body: LoginBody):
  if body.username == APP_USER and body.password == APP_PASS:
    return {"token": "demo-token"}
  raise HTTPException(status_code=401, detail="Credenciales inválidas")
