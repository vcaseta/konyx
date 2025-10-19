import os
import pandas as pd
from datetime import datetime
from openpyxl import Workbook
from openpyxl.utils.dataframe import dataframe_to_rows
from openpyxl.styles import Font, Alignment
from app.core.validators.enrich_contacts import validate_and_enrich_contacts
from ._utils_cols import get_patient_col, get_therapist_col


def build_gestoria_excel(
    merged_df,
    empresa: str,
    fecha_factura: str,
    proyecto: str,
    cuenta: str,
    export_dir: str,
    log_fn=print,
    use_auto_numbering: bool = True,
):
    """
    Genera el Excel de exportación para Gestoría con las 28 columnas oficiales.
    Si use_auto_numbering == False, el campo "Número de documento" se rellena con 'PR%%%%'.
    """
    log_fn("🔍 Validando y completando contactos (Groq)...")
    merged_df = validate_and_enrich_contacts(merged_df, log_fn)

    col_paciente = get_patient_col(merged_df)
    col_terapeuta = get_therapist_col(merged_df)
    fecha_dt = pd.to_datetime(fecha_factura, errors="coerce")
    if pd.isna(fecha_dt):
        raise ValueError("Fecha factura inválida.")

    merged_df["Mes"] = fecha_dt.to_period("M")

    facturas = []
    contador = 1

    for (paciente, mes), grupo in merged_df.groupby([col_paciente, "Mes"], dropna=False):
        # Generar número de factura o marcador PR%%%%
        if use_auto_numbering:
            num_factura = f"F{fecha_dt.strftime('%y%m')}{contador:04d}"
        else:
            num_factura = "PR%%%%"

        for _, row in grupo.iterrows():
            terapeuta = str(row.get(col_terapeuta, "")).strip()
            detalle = f"{str(row.get('Fecha', ''))[:10]} – Sesión – {terapeuta}"

            base = 0.0
            for k in ["Importe", "Precio", "Precio unidad"]:
                if k in row and pd.notna(row[k]):
                    try:
                        base = float(row[k])
                        break
                    except:
                        pass

            # 28 columnas oficiales Gestoría
            factura = {
                "Número de documento": num_factura,
                "Formato de numeración": "",  # vacío
                "Fecha dd/mm/yyyy": fecha_dt.strftime("%d/%m/%Y"),
                "Fecha de vencimiento dd/mm/yyyy": fecha_dt.strftime("%d/%m/%Y"),
                "Descripción": detalle,
                "Nombre del contacto": paciente,
                "NIF": row.get("NIF", ""),
                "Dirección": row.get("Dirección", ""),
                "Población": row.get("Población", ""),
                "Código postal": row.get("Código Postal", ""),
                "Provincia": row.get("Provincia", ""),
                "País": "España",
                "Concepto": "Servicios de Psicoterapia",
                "Descripción del producto": "Sesión de psicoterapia",
                "SKU": "",
                "Precio unidad": base,
                "Unidades": 1,
                "Descuento %": 0,
                "IVA": 0,
                "Retención": 0,
                "Rec. de eq.": 0,
                "Operación": "",
                "Forma de pago (ID)": "Transferencia",
                "Tags separados por -": f"{proyecto}-{empresa}",
                "Nombre canal de venta": proyecto,
                "Cuenta canal de venta": cuenta,
                "Moneda": "EUR",
                "Cambio de moneda": 1,
            }
            facturas.append(factura)

        contador += 1

    df_final = pd.DataFrame(facturas)

    # Crear Excel con formato
    wb = Workbook()
    ws = wb.active
    ws.title = "Gestoría"

    # Insertar datos
    for r in dataframe_to_rows(df_final, index=False, header=True):
        ws.append(r)

    # Estilos encabezado
    for c in ws[1]:
        c.font = Font(bold=True)
        c.alignment = Alignment(horizontal="center")

    filename = f"gestoria_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    filepath = os.path.join(export_dir, filename)
    wb.save(filepath)

    log_fn(f"✅ Excel Gestoría generado: {filename}")
    return filename
