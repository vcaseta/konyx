import json
from fastapi import APIRouter, HTTPException, Header

router = APIRouter()

STORAGE_FILE = "backend/app/storage.json"

def read_storage():
    with open(STORAGE_FILE, "r") as f:
        return json.load(f)

def write_storage(data):
    with open(STORAGE_FILE, "w") as f:
        json.dump(data, f, indent=2)

@router.post("/login")
async def login(password: str):
    storage = read_storage()
    if password == storage["password"]:
        return {"token": "fake-jwt-token"}
    raise HTTPException(status_code=401, detail="Contraseña incorrecta")

@router.post("/change-password")
async def change_password(old_password: str, new_password: str, authorization: str = Header(None)):
    storage = read_storage()
    if authorization != "Bearer fake-jwt-token":
        raise HTTPException(status_code=401, detail="No autorizado")
    if old_password != storage["password"]:
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")
    storage["password"] = new_password
    write_storage(storage)
    return {"msg": "Contraseña cambiada"}

@router.post("/apis")
async def change_apis(kissoro: str, enplural: str, authorization: str = Header(None)):
    storage = read_storage()
    if authorization != "Bearer fake-jwt-token":
        raise HTTPException(status_code=401, detail="No autorizado")
    storage["apis"]["kissoro"] = kissoro
    storage["apis"]["enplural"] = enplural
    write_storage(storage)
    return {"msg": "APIs actualizadas"}
