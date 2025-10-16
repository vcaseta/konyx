import pandas as pd
from fastapi import HTTPException

def validate_eholo_template(df: pd.DataFrame):
    """
    Valida el formato de importación Eholo.
    (Pendiente de definir columnas exactas; de momento, solo verifica que tenga contenido)
    """
    if df.empty:
        raise HTTPException(status_code=400, detail="El archivo Eholo está vacío o no contiene datos.")
    if len(df.columns) < 5:
        raise HTTPException(status_code=400, detail="El archivo Eholo parece incompleto (muy pocas columnas).")

    return True
