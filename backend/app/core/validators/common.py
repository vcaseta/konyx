import pandas as pd
from fastapi import HTTPException

def ensure_not_empty(df: pd.DataFrame, filename: str):
    """Verifica que el DataFrame tenga contenido."""
    if df.empty:
        raise HTTPException(status_code=400, detail=f"El archivo {filename} está vacío o no contiene datos.")

def ensure_min_columns(df: pd.DataFrame, min_cols: int, filename: str):
    """Verifica que tenga un número mínimo de columnas."""
    if len(df.columns) < min_cols:
        raise HTTPException(status_code=400, detail=f"El archivo {filename} tiene menos de {min_cols} columnas.")
