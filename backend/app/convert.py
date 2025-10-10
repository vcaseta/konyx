from fastapi import APIRouter

router = APIRouter()

@router.post("/csv")
def convert_csv():
    return {"message": "Conversor CSV → Holded pendiente de implementación"}
