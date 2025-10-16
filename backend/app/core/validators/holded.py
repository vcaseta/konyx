import pandas as pd
from fastapi import HTTPException

# Cabeceras oficiales de la plantilla Holded
HOLDED_COLUMNS = [
    "Num factura",
    "Formato de numeración",
    "Fecha dd/mm/yyyy",
    "Fecha de vencimiento dd/mm/yyyy",
    "Descripción",
    "Nombre del contacto",
    "NIF del contacto",
    "Dirección",
    "Población",
    "Código postal",
    "Provincia",
    "País",
    "Concepto",
    "Descripción del producto",
    "SKU",
    "Precio unidad",
    "Unidades",
    "Descuento %",
    "IVA %",
    "Retención %",
    "Rec. de eq. %",
    "Operación",
    "Forma de pago (ID)",
    "Cantidad cobrada",
    "Fecha de cobro",
    "Cuenta de pago",
    "Tags separados por -",
    "Nombre canal de venta",
    "Cuenta canal de venta",
    "Moneda",
    "Cambio de moneda",
    "Almacén",
]

def validate_holded_template(df: pd.DataFrame):
    """
    Valida que las columnas del archivo coincidan con la plantilla oficial de Holded.
    Lanza HTTPException si hay diferencias.
    """
    user_cols = [c.strip() for c in df.columns]
    expected_cols = [c.strip() for c in HOLDED_COLUMNS]

    missing = [c for c in expected_cols if c not in user_cols]
    extra = [c for c in user_cols if c not in expected_cols]

    if missing or extra:
        detail = "El archivo no coincide con la plantilla de Holded."
        if missing:
            detail += f" Faltan columnas: {missing}."
        if extra:
            detail += f" Columnas adicionales: {extra}."
        raise HTTPException(status_code=400, detail=detail)

    return True
