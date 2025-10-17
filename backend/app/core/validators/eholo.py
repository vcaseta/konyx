import pandas as pd
from fastapi import HTTPException

def validate_eholo_sesiones(df: pd.DataFrame):
    """
    Valida que el fichero de sesiones de Eholo tenga exactamente
    las columnas esperadas, en el orden correcto y con los nombres exactos.
    """

    expected_columns = [
        "Profesional",
        "Paciente",
        "DNI",
        "Comunicación",
        "Tipo",
        "Fecha",
        "Precio",
        "Comisión centro",
        "Comisión profesional",
        "Bonos",
        "Estado",
        "Método de pago",
        "Fecha de pago",
    ]

    actual_columns = df.columns.tolist()

    # Comparar longitud
    if len(actual_columns) != len(expected_columns):
        raise HTTPException(
            status_code=400,
            detail=(
                f"El archivo de sesiones no tiene el número correcto de columnas "
                f"({len(actual_columns)} en lugar de {len(expected_columns)})."
            ),
        )

    # Comparar nombres exactos y orden
    if actual_columns != expected_columns:
        diffs = [
            f"Esperado '{exp}' pero encontrado '{act}'"
            for exp, act in zip(expected_columns, actual_columns)
            if exp != act
        ]
        raise HTTPException(
            status_code=400,
            detail="Las columnas del archivo de sesiones no coinciden con el formato Eholo esperado. "
                   f"Diferencias: {', '.join(diffs)}",
        )

    return True

