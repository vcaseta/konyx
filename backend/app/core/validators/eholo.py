import pandas as pd
from fastapi import HTTPException

# ============================================================
# 🧾 UTILIDADES
# ============================================================

def normalize(col: str) -> str:
    """Normaliza nombres de columnas para comparación flexible."""
    return (
        col.strip()
        .lower()
        .replace("á", "a")
        .replace("é", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ú", "u")
    )

# ============================================================
# 🔍 VALIDACIÓN DE SESIONES (Eholo)
# ============================================================

EXPECTED_COLUMNS_SESIONES_EHOLO = [
    "profesional",
    "paciente",
    "dni",
    "comunicación",
    "tipo",
    "fecha",
    "precio",
    "comisión centro",
    "comisión profesional",
    "bonos",
    "estado",
    "método de pago",
    "fecha de pago",
]

def validate_eholo_sesiones(df: pd.DataFrame):
    """
    Valida que el fichero de sesiones Eholo tenga exactamente las columnas esperadas
    en el orden correcto, sin faltantes, sobrantes ni errores de nombre.
    """
    cols = [normalize(c) for c in df.columns if not c.lower().startswith("unnamed")]
    expected = [normalize(c) for c in EXPECTED_COLUMNS_SESIONES_EHOLO]

    print("🧾 Columnas SESIONES detectadas:", cols)
    print("🎯 Columnas SESIONES esperadas:", expected)

    missing = [c for c in expected if c not in cols]
    extra = [c for c in cols if c not in expected]

    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"El archivo de sesiones Eholo no tiene todas las columnas requeridas. Faltan: {', '.join(missing)}",
        )

    if extra:
        raise HTTPException(
            status_code=400,
            detail=f"El archivo de sesiones Eholo tiene columnas no esperadas: {', '.join(extra)}",
        )

    if cols != expected:
        raise HTTPException(
            status_code=400,
            detail="El orden de las columnas no coincide exactamente con la plantilla de sesiones Eholo.",
        )

    print("✅ Validación de sesiones Eholo completada correctamente.")
    return True


# ============================================================
# 🔍 VALIDACIÓN DE CONTACTOS (Eholo)
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

def validate_eholo_contactos(df: pd.DataFrame):
    """
    Valida que el fichero de contactos Eholo tenga exactamente las columnas esperadas
    en el orden correcto, sin faltantes, sobrantes ni errores de nombre.
    """
    cols = [normalize(c) for c in df.columns if not c.lower().startswith("unnamed")]
    expected = [normalize(c) for c in EXPECTED_COLUMNS_CONTACTOS_EHOLO]

    print("🧾 Columnas CONTACTOS detectadas:", cols)
    print("🎯 Columnas CONTACTOS esperadas:", expected)

    missing = [c for c in expected if c not in cols]
    extra = [c for c in cols if c not in expected]

    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"El archivo de contactos Eholo no tiene todas las columnas requeridas. Faltan: {', '.join(missing)}",
        )

    if extra:
        raise HTTPException(
            status_code=400,
            detail=f"El archivo de contactos Eholo tiene columnas no esperadas: {', '.join(extra)}",
        )

    if cols != expected:
        raise HTTPException(
            status_code=400,
            detail="El orden de las columnas no coincide exactamente con la plantilla de contactos Eholo.",
        )

    print("✅ Validación de contactos Eholo completada correctamente.")
    return True


