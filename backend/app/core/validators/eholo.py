import pandas as pd
from fastapi import HTTPException

# ============================================================
# 🔍 VALIDACIÓN DE PLANTILLAS EHolo (sesiones + contactos)
# ============================================================

EXPECTED_COLUMNS_SESIONES_EHOLO = [
    "Nombre",
    "Fecha",
    "Importe",
    "Terapeuta",
    "Tipo",
    "Pagado",
    "Factura",
    "Notas",
]

EXPECTED_COLUMNS_CONTACTOS_EHOLO = [
    "Nombre",
    "Teléfono",
    "Email",
    "Dirección",
    "Código Postal",
    "Población",
    "Provincia",
    "País",
    "NIF",
]

def normalize(col: str) -> str:
    """Normaliza columnas eliminando tildes y espacios extra."""
    return (
        col.strip()
        .lower()
        .replace("á", "a")
        .replace("é", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ú", "u")
    )

def validate_eholo_sesiones(df: pd.DataFrame):
    cols = [normalize(c) for c in df.columns if not c.lower().startswith("unnamed")]
    expected = [normalize(c) for c in EXPECTED_COLUMNS_SESIONES_EHOLO]

    print("🧾 Columnas SESIONES detectadas:", cols)
    print("🎯 Columnas SESIONES esperadas:", expected)

    if len(cols) != len(expected):
        raise HTTPException(
            status_code=400,
            detail=f"El archivo de sesiones no tiene el número correcto de columnas ({len(cols)} en lugar de {len(expected)})."
        )

    if cols != expected:
        raise HTTPException(
            status_code=400,
            detail="Las columnas del archivo de sesiones no coinciden con la plantilla Eholo (orden o nombres distintos)."
        )

    print("✅ Validación de sesiones Eholo correcta.")
    return True


def validate_eholo_contactos(df: pd.DataFrame):
    cols = [normalize(c) for c in df.columns if not c.lower().startswith("unnamed")]
    expected = [normalize(c) for c in EXPECTED_COLUMNS_CONTACTOS_EHOLO]

    print("🧾 Columnas CONTACTOS detectadas:", cols)
    print("🎯 Columnas CONTACTOS esperadas:", expected)

    if len(cols) != len(expected):
        raise HTTPException(
            status_code=400,
            detail=f"El archivo de contactos no tiene el número correcto de columnas ({len(cols)} en lugar de {len(expected)})."
        )

    if cols != expected:
        raise HTTPException(
            status_code=400,
            detail="Las columnas del archivo de contactos no coinciden con la plantilla Eholo (orden o nombres distintos)."
        )

    print("✅ Validación de contactos Eholo correcta.")
    return True
