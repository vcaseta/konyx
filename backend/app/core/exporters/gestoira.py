import pandas as pd
import os
from datetime import datetime

GESTORIA_COLUMNS = [
    "Fecha",
    "Cliente",
    "NIF",
    "Descripción",
    "Importe",
    "Cuenta contable",
    "Forma de pago",
    "Proyecto",
    "Empresa",
    "Observaciones",
]


def build_gestoria_csv(merged: pd.DataFrame, empresa: str, fecha_factura: str, proyecto: str, cuenta: str, export_dir: str):
    """
    Genera un CSV simplificado con los campos necesarios para la gestoría.
    Devuelve el nombre del archivo generado.
    """

    # Crear DataFrame base
    df = pd.DataFrame()
    df["Fecha"] = pd.to_datetime(fecha_factura).strftime("%d/%m/%Y")
    df["Empresa"] = empresa
    df["Proyecto"] = proyecto

    # Campos del cliente
    if "nombre" in merged.columns:
        df["Cliente"] = merged["nombre"]
    elif "paciente" in merged.columns:
        df["Cliente"] = merged["paciente"]
    else:
        df["Cliente"] = "Desconocido"

    df["NIF"] = merged["nif"] if "nif" in merged.columns else ""

    # Descripción e importe
    if "tipo" in merged.columns:
        df["Descripción"] = merged["tipo"]
    else:
        df["Descripción"] = "Servicios de Psicoterapia"

    if "importe" in merged.columns:
        df["Importe"] = merged["importe"]
    elif "precio" in merged.columns:
        df["Importe"] = merged["precio"]
    else:
        df["Importe"] = 0

    # Relleno de columnas contables
    df["Cuenta contable"] = cuenta
    df["Forma de pago"] = "Transferencia"
    df["Observaciones"] = ""

    # Reordenar columnas
    df = df[GESTORIA_COLUMNS]

    # Generar archivo CSV
    out_name = f"gestoria_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    out_path = os.path.join(export_dir, out_name)
    df.to_csv(out_path, index=False, encoding="utf-8-sig")

    print(f"📤 Archivo Gestoría generado: {out_path} ({len(df)} filas)")
    return out_name
