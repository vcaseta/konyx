import os
import pandas as pd
from datetime import datetime
from openpyxl import Workbook
from openpyxl.utils.dataframe import dataframe_to_rows
from openpyxl.styles import Font, Alignment


def build_gestoria_excel(merged_df, empresa: str, fecha_factura: str, proyecto: str, cuenta: str, export_dir: str):
    """
    Genera un archivo Excel (.xlsx) para gestoría.
    - Cada línea representa una sesión (una por factura real).
    - Agrupa por paciente + mes.
    - Añade hoja "Resumen mensual" con totales por paciente y total general.
    - IVA = 0% (servicios sanitarios).
    - Devuelve el nombre del archivo generado.
    """

    # -----------------------------------
    # 🔧 Normalizar columnas esperadas
    # -----------------------------------
    col_map = {
        "Nombre": "Paciente",
        "NIF": "NIF",
        "Correo": "Email",
        "Teléfono": "Teléfono",
        "Código Postal": "Código Postal",
        "Provincia": "Provincia",
        "Población": "Población",
        "Dirección": "Dirección",
    }

    for c in col_map.keys():
        if c not in merged_df.columns:
            merged_df[c] = ""

    # -----------------------------------
    # 🧮 Agrupar por paciente + mes
    # -----------------------------------
    merged_df["Fecha factura"] = pd.to_datetime(fecha_factura, errors="coerce").strftime("%d/%m/%Y")
    merged_df["Mes"] = pd.to_datetime(fecha_factura, errors="coerce").dt.to_period("M")

    # -----------------------------------
    # 🧾 Preparar líneas de factura
    # -----------------------------------
    facturas = []
    contador = 1

    for (paciente, mes), grupo in merged_df.groupby(["Nombre", "Mes"], dropna=False):
        nif = grupo["NIF"].iloc[0] if "NIF" in grupo else ""
        email = grupo["Correo"].iloc[0] if "Correo" in grupo else ""
        tel = grupo["Teléfono"].iloc[0] if "Teléfono" in grupo else ""
        direccion = grupo["Dirección"].iloc[0] if "Dirección" in grupo else ""
        cp = grupo["Código Postal"].iloc[0] if "Código Postal" in grupo else ""
        prov = grupo["Provincia"].iloc[0] if "Provincia" in grupo else ""
        pobl = grupo["Población"].iloc[0] if "Población" in grupo else ""

        for _, row in grupo.iterrows():
            concepto = "Servicios de Psicoterapia"
            terapeuta = row.get("Terapeuta", "")
            fecha_sesion = str(row.get("Fecha", ""))[:10]
            detalle = f"{fecha_sesion} – Sesión – {terapeuta}"

            factura_num = f"F250{contador:04d}"
            facturas.append({
                "Número factura": factura_num,
                "Nombre fiscal": paciente,
                "NIF": nif,
                "Dirección": direccion,
                "Código postal": cp,
                "Población": pobl,
                "Provincia": prov,
                "País": "España",
                "Email": email,
                "Teléfono": tel,
                "Fecha factura": merged_df['Fecha factura'].iloc[0],
                "Concepto": concepto,
                "Detalle": detalle,
                "Base imponible": float(row.get("Importe", 0)) or 0.0,
                "IVA (%)": 0,
                "Total factura": float(row.get("Importe", 0)) or 0.0,
                "Forma de pago (ID)": "Transferencia",
                "Cuenta contable": cuenta,
                "Proyecto": proyecto,
                "Empresa": empresa,
            })
            contador += 1

    df_out = pd.DataFrame(facturas)

    # -----------------------------------
    # 📊 Generar resumen mensual
    # -----------------------------------
    resumen = (
        df_out.groupby("Nombre fiscal", as_index=False)
        .agg({"Base imponible": "sum"})
        .rename(columns={"Base imponible": "Total facturado"})
    )
    resumen["Total facturado"] = resumen["Total facturado"].round(2)
    total_general = resumen["Total facturado"].sum().round(2)

    # -----------------------------------
    # 💾 Crear Excel con openpyxl
    # -----------------------------------
    filename = f"gestoria_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    filepath = os.path.join(export_dir, filename)

    wb = Workbook()

    # ------------------ Hoja principal ------------------
    ws = wb.active
    ws.title = "Facturas Gestoría"

    for row in dataframe_to_rows(df_out, index=False, header=True):
        ws.append(row)

    # Estilos
    header_font = Font(bold=True)
    for cell in ws[1]:
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center")

    # Autoajuste columnas
    for col in ws.columns:
        max_length = 0
        col_letter = col[0].column_letter
        for cell in col:
            try:
                max_length = max(max_length, len(str(cell.value)))
            except:
                pass
        ws.column_dimensions[col_letter].width = max_length + 2

    # ------------------ Hoja resumen ------------------
    ws2 = wb.create_sheet("Resumen mensual")

    ws2.append(["Paciente", "Total facturado (€)"])
    for row in dataframe_to_rows(resumen, index=False, header=False):
        ws2.append(row)

    ws2.append(["", ""])
    ws2.append(["TOTAL GENERAL", total_general])

    # Estilo de encabezados y totales
    ws2["A1"].font = Font(bold=True)
    ws2["B1"].font = Font(bold=True)
    ws2["A1"].alignment = Alignment(horizontal="center")
    ws2["B1"].alignment = Alignment(horizontal="center")

    ws2["A" + str(len(resumen) + 3)].font = Font(bold=True)
    ws2["B" + str(len(resumen) + 3)].font = Font(bold=True)
    ws2["A" + str(len(resumen) + 3)].alignment = Alignment(horizontal="center")
    ws2["B" + str(len(resumen) + 3)].alignment = Alignment(horizontal="right")

    # Autoajuste columnas
    for col in ws2.columns:
        max_length = 0
        col_letter = col[0].column_letter
        for cell in col:
            try:
                max_length = max(max_length, len(str(cell.value)))
            except:
                pass
        ws2.column_dimensions[col_letter].width = max_length + 4

    # Guardar archivo
    wb.save(filepath)

    return filename

