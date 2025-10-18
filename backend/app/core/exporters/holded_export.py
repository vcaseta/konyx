import os
import pandas as pd
from datetime import datetime
from ._utils_cols import get_patient_col, get_therapist_col

HOLDED_COLUMNS = [
    "Num factura", "Formato de numeración", "Fecha dd/mm/yyyy", "Fecha de vencimiento dd/mm/yyyy",
    "Descripción", "Nombre del contacto", "NIF del contacto", "Dirección", "Población", "Código postal",
    "Provincia", "País", "Concepto", "Descripción del producto", "SKU", "Precio unidad", "Unidades",
    "Descuento %", "IVA %", "Retención %", "Rec. de eq. %", "Operación", "Forma de pago (ID)",
    "Cantidad cobrada", "Fecha de cobro", "Cuenta de pago", "Tags separados por -", "Nombre canal de venta",
    "Cuenta canal de venta", "Moneda", "Cambio de moneda", "Almacén",
]

def build_holded_csv(merged: pd.DataFrame, empresa: str, fecha_factura: str, proyecto: str, cuenta: str, export_dir: str):
    """Genera CSV Holded agrupado por **paciente+mes**, sobrescribiendo el archivo anterior."""

    col_paciente = get_patient_col(merged)
    if not col_paciente:
        raise ValueError("No se encontró una columna de paciente en el archivo (por ej. 'Paciente').")

    col_terapeuta = get_therapist_col(merged)

    fecha_general = pd.to_datetime(fecha_factura, errors="coerce")
    if pd.isna(fecha_general):
        raise ValueError("Fecha factura inválida.")

    # Agrupar por paciente+mes
    merged["__mes__"] = fecha_general.to_period("M")
    merged["__gid__"] = merged.groupby([col_paciente, "__mes__"]).ngroup() + 1

    # Datos cabecera/plantilla Holded
    merged["Num factura"] = [f"F{fecha_general.strftime('%y%m')}{g:04d}" for g in merged["__gid__"]]
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
    merged["Nombre del contacto"] = merged[col_paciente]

    # Descripción por línea
    def desc_linea(row):
        fecha = str(row.get("Fecha", ""))[:10]
        ter = str(row.get(col_terapeuta, "")).strip() if col_terapeuta else ""
        return f"{fecha} – Sesión – {ter}".strip(" –")

    merged["Descripción del producto"] = merged.apply(desc_linea, axis=1)

    # Precio y unidades
    if "Precio unidad" not in merged.columns:
        merged["Precio unidad"] = merged.get("Importe", merged.get("Precio", 0)).fillna(0)
    merged["Unidades"] = merged.get("Unidades", 1)

    # Completar columnas faltantes
    for col in HOLDED_COLUMNS:
        if col not in merged.columns:
            merged[col] = ""

    # Limpiar auxiliares
    merged = merged.drop(columns=["__gid__", "__mes__"], errors="ignore")

    # 📁 Guardar SIEMPRE con el mismo nombre
    out_path = os.path.join(export_dir, "holded_export.csv")
    merged[HOLDED_COLUMNS].to_csv(out_path, index=False, encoding="utf-8-sig", sep=";")

    print(f"✅ Archivo Holded sobrescrito: {out_path} ({len(merged)} filas)")
    return "holded_export.csv"
