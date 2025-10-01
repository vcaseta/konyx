from fastapi import FastAPI, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List

app = FastAPI(title="Konyx API")

# CORS (ajusta orígenes si quieres restringir)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------- Modelos ---------
class LoginIn(BaseModel):
    user: str
    pass_: str | None = None  # por si envías "pass" desde el front, mapea en el handler

class TokenOut(BaseModel):
    token: str

class Company(BaseModel):
    id: str
    name: str

class Invoice(BaseModel):
    id: str
    number: str
    total: float

# --------- Utilidades ---------
def get_current_token(authorization: Optional[str] = Header(default=None)):
    """
    Autenticación ultrabásica:
    - Espera 'Authorization: Bearer <token>'
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization")
    token = authorization.split(" ", 1)[1].strip()
    if token == "":
        raise HTTPException(status_code=401, detail="Invalid token")
    return token

def get_company_id(x_company: Optional[str] = Header(default=None)):
    if not x_company:
        raise HTTPException(status_code=400, detail="X-Company header required")
    return x_company

# --------- Endpoints ---------
@app.post("/auth/login", response_model=TokenOut)
def login(payload: dict):
    """
    Demo: acepta cualquier usuario/contraseña y devuelve un token de ejemplo.
    Si en tu front envías { user, pass }, aquí lo recogemos igualmente.
    """
    user = payload.get("user")
    _ = payload.get("pass") or payload.get("pass_")
    if not user:
        raise HTTPException(status_code=400, detail="user required")
    # Aquí pondrías la verificación real (Holded/tu BBDD/etc.)
    return TokenOut(token="demo-token-" + user)

@app.get("/companies", response_model=List[Company])
def list_companies(token: str = Depends(get_current_token)):
    # Demo estática: dos empresas
    return [
        Company(id="holded-a", name="Empresa A"),
        Company(id="holded-b", name="Empresa B"),
    ]

@app.get("/invoices", response_model=List[Invoice])
def list_invoices(
    token: str = Depends(get_current_token),
    company_id: str = Depends(get_company_id),
):
    # Demo por empresa (cambia por la consulta real a Holded usando company_id)
    if company_id == "holded-a":
        data = [
            Invoice(id="A-001", number="A-001", total=120.0),
            Invoice(id="A-002", number="A-002", total=80.5),
        ]
    else:
        data = [
            Invoice(id="B-101", number="B-101", total=300.0),
            Invoice(id="B-102", number="B-102", total=49.9),
        ]
    return data
