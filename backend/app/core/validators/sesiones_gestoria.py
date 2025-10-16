import pandas as pd
from fastapi import HTTPException

# ============================================================
# 🔍 VALIDACIÓN DE PLANTILLA SESIONES (Gestoría)
# ============================================================

EXPECTED_COLUMNS_SESIONES_GESTORIA = [
    "Número",
    "Nombre fiscal",
    "Concepto",
    "IVA",
    "Importe",
    "Fecha",
    "Forma de pago (ID)",
    "Cuenta contable",
    "Proyecto",
    "Empresa",
    "NIF",
    "Email",
    "Teléfono",
    "Dirección",
    "Código postal",
    "Población",
    "Provincia",
    "País",
    "Tags",
]

def normalize(col: str) -> str:
    """Normaliza nombres de columnas eliminando tildes y espacios extra."""
    return (
        col.strip()
        .lower()
        .replace("á", "a")
        .replace("é", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ú", "u")
    )

def validate_sesiones_gestoria_template(df: pd.DataFrame):
    """
    Verifica que el DataFrame subido cumpla la estructura EXACTA del formato Gestoría.
    - Mismo número de columnas.
    - Mismo nombre y orden.
    - Sin columnas extra o faltantes.
    """
    cols = [normalize(c) for c in df.columns if not c.lower().startswith("unnamed")]
    expected = [normalize(c) for c in EXPECTED_COLUMNS_SESIONES_GESTORIA]

    print("🧾 Columnas encontradas:", cols)
    print("🎯 Columnas esperadas:", expected)

    missing = [c for c in expected if c not in cols]
    extra = [c for c in cols if c not in expected]

    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"El archivo Gestoría no tiene todas las columnas requeridas. Faltan: {', '.join(missing)}"
        )

    if extra:
        raise HTTPException(
            status_code=400,
            detail=f"El archivo Gestoría tiene columnas no esperadas: {', '.join(extra)}"
        )

    if cols != expected:
        raise HTTPException(
            status_code=400,
            detail="El orden de las columnas no coincide con la plantilla oficial de Gestoría."
        )

    print("✅ Validación de sesiones Gestoría completada correctamente.")
    return True
