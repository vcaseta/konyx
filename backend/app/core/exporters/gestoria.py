import pandas as pd
import os
from datetime import datetime

def build_gestoria_excel(
    merged: pd.DataFrame,
    empresa: str,
    fecha_factura: str,
    proyecto: str,
    cuenta: str,
    export_dir: str,
):
    """
    Genera un Excel (.xlsx) para la Gestoría, agrupando las sesiones
    por paciente + mes, de modo que cada factura tenga un único número.
    """

    # 🔍 Detectar la columna de paciente
    possible_names = ["paciente", "nombre", "nombre del contacto"]
    col_paciente = next(
        (c for c in merged.columns if c.strip().lower() in possible_names),
        None,
    )
    if not col_paciente:
        raise ValueError("No se encontró una columna de paciente o nombre en el archivo.")

    # 🔹 Crear grupo por paciente + mes
    fecha_general = pd.to_datetime(fecha_factura)
    merged["mes"] = fecha_general.to_period("M")
    merged["_grupo_id"] = merged.groupby([col_paciente, "mes"]).ngroup() + 1
    merged["Num factura"] = [f"F{fecha_general.strftime('%y%m')}{g:04d}" for g in merged["_grupo_id"]]

    # 🔹 Añadir datos básicos
    merged["Fecha factura"] = fecha_general.strftime("%d/%m/%Y")
    merged["Empresa"] = empresa
    merged["Proyecto"] = proyecto
    merged["Cuenta contable"] = cuenta

    # 🔹 Reordenar columnas (si existen)
    base_cols = [
        "Num factura",
        "Fecha factura",
        col_paciente,
        "Empresa",
        "Proyecto",
        "Cuenta contable",
    ]

    other_cols = [c for c in merged.columns if c not in base_cols and not c.startswith("_")]
    final_cols = base_cols + other_cols

    final_df = merged[final_cols].copy()

    # 🔹 Guardar archivo Excel
    out_name = f"gestoria_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    out_path = os.path.join(export_dir, out_name)

    final_df.to_excel(out_path, index=False, engine="openpyxl")

    print(f"📘 Archivo Excel de Gestoría generado: {out_path} ({len(final_df)} filas)")
    return out_name
