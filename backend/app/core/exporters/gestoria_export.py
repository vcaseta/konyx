import os
import pandas as pd
from datetime import datetime
from openpyxl import Workbook
from openpyxl.utils.dataframe import dataframe_to_rows
from openpyxl.styles import Font, Alignment
from app.core.validators.enrich_contacts import validate_and_enrich_contacts
from ._utils_cols import get_patient_col, get_therapist_col


def build_gestoria_excel(merged_df, empresa: str, fecha_factura: str, proyecto: str, cuenta: str, export_dir: str, log_fn=print):
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
        num_factura = f"F{fecha_dt.strftime('%y%m')}{contador:04d}"
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

            facturas.append({
                "Número factura": num_factura,
                "Nombre fiscal": paciente,
                "NIF": row.get("NIF", ""),
                "Dirección": row.get("Dirección", ""),
                "Código postal": row.get("Código Postal", ""),
                "Población": row.get("Población", ""),
                "Provincia": row.get("Provincia", ""),
                "País": "España",
                "Fecha factura": fecha_dt.strftime("%d/%m/%Y"),
                "Concepto": "Servicios de Psicoterapia",
                "Detalle": detalle,
                "Terapeuta": terapeuta,
                "Base imponible": base,
                "IVA (%)": 0,
                "Total factura": base,
                "Forma de pago (ID)": "Transferencia",
                "Cuenta contable": cuenta,
                "Proyecto": proyecto,
                "Empresa": empresa,
            })
        contador += 1

    df_detalle = pd.DataFrame(facturas)

    # Resumen por paciente
    resumen_pac = (
        df_detalle.groupby("Nombre fiscal", as_index=False)
        .agg({"Base imponible": "sum"})
        .rename(columns={"Base imponible": "Total facturado (€)"})
    )

    # Resumen por terapeuta
    resumen_ter = (
        df_detalle.groupby("Terapeuta", as_index=False)
        .agg({"Base imponible": "sum"})
        .rename(columns={"Base imponible": "Total facturado (€)"})
    )

    wb = Workbook()

    # Hoja 1 - Detalle
    ws = wb.active
    ws.title = "Facturas Gestoría"
    for r in dataframe_to_rows(df_detalle, index=False, header=True):
        ws.append(r)
    for c in ws[1]:
        c.font = Font(bold=True)
        c.alignment = Alignment(horizontal="center")

    # Hoja 2 - Resumen Pacientes
    ws2 = wb.create_sheet("Resumen Pacientes")
    for r in dataframe_to_rows(resumen_pac, index=False, header=True):
        ws2.append(r)
    for c in ws2[1]:
        c.font = Font(bold=True)

    # Hoja 3 - Resumen Terapeutas
    ws3 = wb.create_sheet("Resumen Terapeutas")
    for r in dataframe_to_rows(resumen_ter, index=False, header=True):
        ws3.append(r)
    for c in ws3[1]:
        c.font = Font(bold=True)

    filename = f"gestoria_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    filepath = os.path.join(export_dir, filename)
    wb.save(filepath)

    log_fn(f"✅ Excel Gestoría generado: {filename}")
    return filename

