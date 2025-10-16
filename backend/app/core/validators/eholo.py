import pandas as pd
from fastapi import HTTPException

# ============================================================
# 🔍 VALIDACIÓN DE PLANTILLA EHolo (Sesiones)
# ============================================================

EXPECTED_COLUMNS_EHOLO = [
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

def normalize(col: str) -> str:
    """Normaliza el nombre de una columna para comparación."""
    return col.strip().lower().replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u")

def validate_eholo_template(df: pd.DataFrame):
    """
    Verifica que el DataFrame subido cumpla la estructura exacta de Eholo.
    Si faltan o sobran columnas, se lanza una excepción HTTP 400.
    """
    cols = [normalize(c) for c in df.columns if not c.lower().startswith("unnamed")]
    expected = [normalize(c) for c in EXPECTED_COLUMNS_EHOLO]

    missing = [c for c in expected if c not in cols]
    extra = [c for c in cols if c not in expected]

    print("🧾 Columnas encontradas:", cols)
    print("🎯 Columnas esperadas:", expected)

    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"El archivo de sesiones Eholo no tiene todas las columnas requeridas. Faltan: {', '.join(missing)}"
        )

    if extra:
        raise HTTPException(
            status_code=400,
            detail=f"El archivo de sesiones Eholo tiene columnas no esperadas: {', '.join(extra)}"
        )

    # Validación estricta: orden exacto
    if cols != expected:
        raise HTTPException(
            status_code=400,
            detail="El orden de las columnas no coincide exactamente con la plantilla Eholo."
        )

    print("✅ Validación Eholo completada correctamente.")
    return True
