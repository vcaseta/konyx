import pandas as pd
import os
from datetime import datetime

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


def build_holded_csv(merged: pd.DataFrame, empresa: str, fecha_factura: str, proyecto: str, cuenta: str, export_dir: str):
    """
    Genera el CSV con formato Holded a partir de los datos fusionados.
    Devuelve el nombre del archivo generado.
    """

    # Asegurar que existan todas las columnas de Holded
    for col in HOLDED_COLUMNS:
        if col not in merged.columns:
            merged[col] = ""

    # Rellenar columnas básicas
    merged["Num factura"] = [f"F{datetime.now().strftime('%y%m%d')}-{i+1:03d}" for i in range(len(merged))]
    merged["Formato de numeración"] = "F{yy}{mm}{num}"
    merged["Fecha dd/mm/yyyy"] = pd.to_datetime(fecha_factura).strftime("%d/%m/%Y")
    merged["Fecha de vencimiento dd/mm/yyyy"] = pd.to_datetime(fecha_factura).strftime("%d/%m/%Y")
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

    # Seleccionar solo las columnas válidas en el orden correcto
    final_df = merged[HOLDED_COLUMNS].copy()

    # Generar archivo CSV
    out_name = f"holded_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    out_path = os.path.join(export_dir, out_name)
    final_df.to_csv(out_path, index=False, encoding="utf-8-sig")

    print(f"📤 Archivo Holded generado: {out_path} ({len(final_df)} filas)")
    return out_name
