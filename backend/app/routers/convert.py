from fastapi import APIRouter

router = APIRouter(prefix="/convert", tags=["convert"])

@router.get("/")
def convert_root():
    return {"message": "Convert endpoint (pendiente de implementación)"}
