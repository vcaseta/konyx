from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
import secrets

app = FastAPI()

# CORS para frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    password: str

DEFAULT_PASSWORD = os.getenv("KONYX_PASSWORD", "admin123")

@app.post("/auth/login")
async def login(data: LoginRequest):
    if data.password != DEFAULT_PASSWORD:
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")
    token = secrets.token_hex(16)
    return {"token": token}
