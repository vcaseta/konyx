import os
import pandas as pd
from datetime import datetime
from ._utils_cols import get_patient_col, get_therapist_col


def build_holded_csv(merged: pd.DataFrame, empresa: str, fecha_factura: str, proyecto: str, cuenta: str, export_dir: str):
    """
    Genera CSV compatible con Holded según formato validado (una línea por paciente+mes).
    Las sesiones del mismo paciente se agrupan y se listan separadas por saltos de línea en la columna Descripción.
    """

    col_paciente = get_patient_col(merged)
    if not col_paciente:
        raise ValueError("No se encontró una columna de paciente (por ej. 'Paciente').")

    col_terapeuta = get_therapist_col(merged)

    fecha_dt = pd.to_datetime(fecha_factura, errors="coerce")
    if pd.isna(fecha_dt):
        raise ValueError("Fecha factura inválida.")

    # Crear agrupador paciente+mes
    merged["__mes__"] = fecha_dt.to_period("M")
    merged["__gid__"] = merged.groupby([col_paciente, "__mes__"]).ngroup() + 1

    facturas = []
    contador = 1

    for (paciente, mes), grupo in merged.groupby([col_paciente, "__mes__"], dropna=False):
        # Número de factura
        num_factura = f"FAC-{fecha_dt.strftime('%Y%m')}-{contador:03d}"

        # Detalle de sesiones (una por línea)
        detalles = []
        for _, row in grupo.iterrows():
            fecha_sesion = str(row.get("Fecha", ""))[:10]
            tipo = str(row.get("Tipo", "Sesión")).strip()
            terapeuta = str(row.get(col_terapeuta, "")).strip() if col_terapeuta else ""
            importe = None
            for k in ["Importe", "Precio", "Precio unidad"]:
                if k in row and pd.notna(row[k]):
                    try:
                        importe = float(row[k])
                        break
                    except:
                        pass
            if importe is None:
                importe = 0.0

            detalles.append(f"{fecha_sesion} - {tipo} {importe:.0f}€")

        descripcion = "\n".join(detalles)

        # Total y cantidad
        cantidad = len(detalles)
        total = sum(
            float(row.get("Importe", row.get("Precio", 0)) or 0)
            for _, row in grupo.iterrows()
        )

        factura = {
            "Número": num_factura,
            "Fecha": fecha_dt.strftime("%Y-%m-%d"),
            "Vencimiento": fecha_dt.strftime("%Y-%m-31"),
            "Cliente": paciente,
            "Email cliente": "",
            "Moneda": "EUR",
            "Concepto": "Servicios del mes",
            "Descripción": descripcion,
            "Cantidad": cantidad,
            "Precio": round(total, 2),
            "Impuesto": 21,
            "Descuento": 0,
            "Cuenta contable": "70500000",
            "Tags": "",
        }

        facturas.append(factura)
        contador += 1

    df_out = pd.DataFrame(facturas)

    # Guardar CSV (UTF-8 con comas, NO con ;)
    out_path = os.path.join(export_dir, "holded_export.csv")
    df_out.to_csv(out_path, index=False, encoding="utf-8-sig")

    print(f"✅ CSV Holded generado correctamente: {out_path} ({len(df_out)} facturas únicas)")
    return "holded_export.csv"
