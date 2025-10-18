import pandas as pd
import os
from datetime import datetime

HOLDED_COLUMNS = [
    "Num factura", "Formato de numeración", "Fecha dd/mm/yyyy", "Fecha de vencimiento dd/mm/yyyy",
    "Descripción", "Nombre del contacto", "NIF del contacto", "Dirección", "Población", "Código postal",
    "Provincia", "País", "Concepto", "Descripción del producto", "SKU", "Precio unidad", "Unidades",
    "Descuento %", "IVA %", "Retención %", "Rec. de eq. %", "Operación", "Forma de pago (ID)",
    "Cantidad cobrada", "Fecha de cobro", "Cuenta de pago", "Tags separados por -", "Nombre canal de venta",
    "Cuenta canal de venta", "Moneda", "Cambio de moneda", "Almacén"
]


def build_holded_csv(merged: pd.DataFrame, empresa: str, fecha_factura: str, proyecto: str, cuenta: str, export_dir: str):
    """Genera CSV Holded agrupado por paciente+mes, sin duplicados."""

    possible_names = ["paciente", "nombre", "nombre del contacto"]
    col_paciente = next((c for c in merged.columns if c.strip().lower() in possible_names), None)
    if not col_paciente:
        raise ValueError("No se encontró una columna de paciente o nombre en el archivo.")

    fecha_general = pd.to_datetime(fecha_factura)
    merged["mes"] = fecha_general.to_period("M")
    merged["_grupo_id"] = merged.groupby([col_paciente, "mes"]).ngroup() + 1
    merged["Num factura"] = [f"F{fecha_general.strftime('%y%m')}{g:04d}" for g in merged["_grupo_id"]]
    merged["Formato de numeración"] = "F{yy}{mm}{num:04d}"

    merged["Fecha dd/mm/yyyy"] = fecha_general.strftime("%d/%m/%Y")
    merged["Fecha de vencimiento dd/mm/yyyy"] = fecha_general.strftime("%d/%m/%Y")
    merged["Descripción"] = f"Servicios de psicoterapia ({empresa})"
    merged["Concepto"] = "Servicios de Psicoterapia"
    merged["IVA %"] = 0
    merged["Forma de pago (ID)"] = "Transferencia"
    merged["Cuenta de pago"] = cuenta
    merged["Tags separados por -"] = f"#{proyecto.lower().replace(' ', '-')}"
    merged["Moneda"] = "EUR"
    merged["Cambio de moneda"] = 1
    merged["País"] = "España"
    merged["Operación"] = "Sujeta No Exenta"

    campos_cabecera = [
        "Nombre del contacto", "NIF del contacto", "Dirección", "Población", "Código postal", "Provincia", "País",
        "Fecha dd/mm/yyyy", "Fecha de vencimiento dd/mm/yyyy", "Descripción", "Concepto", "Forma de pago (ID)",
        "Cuenta de pago", "Operación", "Moneda", "Cambio de moneda", "Tags separados por -"
    ]

    for campo in campos_cabecera:
        if campo in merged.columns:
            merged[campo] = merged.groupby("Num factura")[campo].transform(lambda x: x.ffill().bfill().iloc[0])

    for col in HOLDED_COLUMNS:
        if col not in merged.columns:
            merged[col] = ""

    merged = merged.drop(columns=["_grupo_id", "mes"], errors="ignore")

    out_name = f"holded_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    out_path = os.path.join(export_dir, out_name)
    merged[HOLDED_COLUMNS].to_csv(out_path, index=False, encoding="utf-8-sig", sep=";")

    print(f"✅ CSV Holded generado sin duplicados: {out_path} ({len(merged)} filas)")
    return out_name
