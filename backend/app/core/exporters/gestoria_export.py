import os
import pandas as pd
from datetime import datetime
from openpyxl import Workbook
from openpyxl.utils.dataframe import dataframe_to_rows
from openpyxl.styles import Font, Alignment
from ._utils_cols import get_patient_col, get_therapist_col

def build_gestoria_excel(merged_df, empresa: str, fecha_factura: str, proyecto: str, cuenta: str, export_dir: str):
    """
    Excel para gestoría:
    - Cada línea = sesión (detalle), agrupadas bajo un Nº factura único por **paciente+mes**.
    - Hoja 1: detalle; Hoja 2: resumen por paciente y total mensual.
    - Usa 'paciente' (no el profesional).
    """

    col_paciente = get_patient_col(merged_df)
    if not col_paciente:
        raise ValueError("No se encontró una columna de paciente en el archivo (por ej. 'Paciente').")
    col_terapeuta = get_therapist_col(merged_df)

    fecha_dt = pd.to_datetime(fecha_factura, errors="coerce")
    if pd.isna(fecha_dt):
        raise ValueError("Fecha factura inválida.")

    # columnas de contacto (si no existen, se crean vacías)
    for c in ["NIF","Dirección","Código Postal","Población","Provincia","Correo","Teléfono"]:
        if c not in merged_df.columns:
            merged_df[c] = ""

    merged_df["Fecha factura"] = fecha_dt.strftime("%d/%m/%Y")
    merged_df["Mes"] = fecha_dt.to_period("M")

    # Construcción de líneas
    facturas = []
    contador = 1

    for (paciente, mes), grupo in merged_df.groupby([col_paciente, "Mes"], dropna=False):
        nif = str(grupo["NIF"].iloc[0] or "")
        email = str(grupo["Correo"].iloc[0] or "")
        tel = str(grupo["Teléfono"].iloc[0] or "")
        direccion = str(grupo["Dirección"].iloc[0] or "")
        cp = str(grupo["Código Postal"].iloc[0] or "")
        prov = str(grupo["Provincia"].iloc[0] or "")
        pobl = str(grupo["Población"].iloc[0] or "")

        num_factura = f"F{fecha_dt.strftime('%y%m')}{contador:04d}"

        for _, row in grupo.iterrows():
            concepto = "Servicios de Psicoterapia"
            fecha_sesion = str(row.get("Fecha", ""))[:10]
            terapeuta = str(row.get(col_terapeuta, "")).strip() if col_terapeuta else ""
            detalle = f"{fecha_sesion} – Sesión – {terapeuta}".strip(" –")

            base = 0.0
            for k in ["Importe","Precio","Precio unidad"]:
                if k in row and pd.notna(row[k]):
                    try:
                        base = float(row[k]); break
                    except: pass

            facturas.append({
                "Número factura": num_factura,
                "Nombre fiscal": paciente,
                "NIF": nif,
                "Dirección": direccion,
                "Código postal": cp,
                "Población": pobl,
                "Provincia": prov,
                "País": "España",
                "Email": email,
                "Teléfono": tel,
                "Fecha factura": fecha_dt.strftime("%d/%m/%Y"),
                "Concepto": concepto,
                "Detalle": detalle,
                "Base imponible": base,
                "IVA (%)": 0,
                "Total factura": base,
                "Forma de pago (ID)": "Transferencia",
                "Cuenta contable": cuenta,
                "Proyecto": proyecto,
                "Empresa": empresa,
            })

        contador += 1

    df_out = pd.DataFrame(facturas)

    # Resumen mensual por paciente
    resumen = (
        df_out.groupby("Nombre fiscal", as_index=False)
        .agg({"Base imponible": "sum"})
        .rename(columns={"Base imponible": "Total facturado"})
    )
    resumen["Total facturado"] = resumen["Total facturado"].round(2)
    total_general = float(resumen["Total facturado"].sum().round(2)) if not resumen.empty else 0.0

    # Excel
    filename = f"gestoria_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    filepath = os.path.join(export_dir, filename)

    from openpyxl import Workbook
    wb = Workbook()

    # Hoja detalle
    ws = wb.active
    ws.title = "Facturas Gestoría"
    for row in dataframe_to_rows(df_out, index=False, header=True): ws.append(row)
    for cell in ws[1]: cell.font = Font(bold=True); cell.alignment = Alignment(horizontal="center")
    for col in ws.columns:
        width = max(len(str(c.value)) if c.value is not None else 0 for c in col) + 2
        ws.column_dimensions[col[0].column_letter].width = width

    # Hoja resumen
    ws2 = wb.create_sheet("Resumen mensual")
    ws2.append(["Paciente", "Total facturado (€)"])
    for row in dataframe_to_rows(resumen, index=False, header=False): ws2.append(row)
    ws2.append(["", ""]); ws2.append(["TOTAL GENERAL", total_general])
    ws2["A1"].font = ws2["B1"].font = Font(bold=True)
    ws2["A1"].alignment = Alignment(horizontal="center"); ws2["B1"].alignment = Alignment(horizontal="center")
    ws2[f"A{len(resumen)+3}"].font = ws2[f"B{len(resumen)+3}"].font = Font(bold=True)
    ws2[f"A{len(resumen)+3}"].alignment = Alignment(horizontal="center"); ws2[f"B{len(resumen)+3}"].alignment = Alignment(horizontal="right")
    for col in ws2.columns:
        width = max(len(str(c.value)) if c.value is not None else 0 for c in col) + 4
        ws2.column_dimensions[col[0].column_letter].width = width

    wb.save(filepath)
    return filename

