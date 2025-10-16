import pandas as pd
from fastapi import HTTPException

# ============================================================
# 🔍 VALIDACIÓN DE PLANTILLA CONTACTOS (Eholo)
# ============================================================

EXPECTED_COLUMNS_CONTACTOS_EHOLO = [
    "n. de ficha",
    "profesional",
    "nombre",
    "teléfono",
    "email",
    "documento de identidad",
    "estado",
    "etiquetas",
    "dirección",
    "tipo de sesión",
]

def normalize(col: str) -> str:
    """Normaliza el nombre de una columna para comparación."""
    return (
        col.strip()
        .lower()
        .replace("á", "a")
        .replace("é", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ú", "u")
    )

def validate_contactos_eholo_template(df: pd.DataFrame):
    """
    Verifica que el DataFrame subido cumpla la estructura exacta de contactos Eholo.
    Si faltan o sobran columnas, o el orden no coincide, se lanza HTTP 400.
    """
    cols = [normalize(c) for c in df.columns if not c.lower().startswith("unnamed")]
    expected = [normalize(c) for c in EXPECTED_COLUMNS_CONTACTOS_EHOLO]

    print("🧾 Columnas encontradas:", cols)
    print("🎯 Columnas esperadas:", expected)

    missing = [c for c in expected if c not in cols]
    extra = [c for c in cols if c not in expected]

    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"El archivo de contactos Eholo no tiene todas las columnas requeridas. Faltan: {', '.join(missing)}"
        )

    if extra:
        raise HTTPException(
            status_code=400,
            detail=f"El archivo de contactos Eholo tiene columnas no esperadas: {', '.join(extra)}"
        )

    if cols != expected:
        raise HTTPException(
            status_code=400,
            detail="El orden de las columnas no coincide exactamente con la plantilla de contactos Eholo."
        )

    print("✅ Validación de contactos Eholo completada correctamente.")
    return True
