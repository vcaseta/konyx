from fastapi import APIRouter, HTTPException, Form
from app.core.persistence import load_data, save_data
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
async def login(usuario: str = Form(...), password: str = Form(...)):
    data = load_data()

    # Validación simple del password guardado
    stored_password = data.get("password", "1234")
    if password == stored_password:
        data["ultimoLogin"] = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
        data["totalLogins"] = data.get("totalLogins", 0) + 1  # ✅ incrementa logins correctos
        save_data(data)
        return {"token": f"konyx_token_{usuario}", "status": "ok"}

    # Login incorrecto
    data["intentosLoginFallidos"] = data.get("intentosLoginFallidos", 0) + 1
    save_data(data)
    raise HTTPException(status_code=401, detail="Credenciales incorrectas")

@router.get("/status")
async def status():
    """Devuelve información general del sistema."""
    data = load_data()
    return {
        "ultimoExport": data.get("ultimoExport", "-"),
        "totalExportaciones": data.get("totalExportaciones", 0),
        "totalExportacionesFallidas": data.get("totalExportacionesFallidas", 0),
        "intentosLoginFallidos": data.get("intentosLoginFallidos", 0),
        "totalLogins": data.get("totalLogins", 0),  # ✅ nuevo
        "password": data.get("password", "1234"),
        "apiKissoro": data.get("apiKissoro", ""),
        "apiEnPlural": data.get("apiEnPlural", ""),
        "apiGroq": data.get("apiGroq", ""),
        "archivo_generado": data.get("archivo_generado", ""),
    }

