import os
import pandas as pd
from datetime import datetime
from openpyxl import Workbook
from openpyxl.utils.dataframe import dataframe_to_rows


def build_gestoria_excel(merged_df, empresa: str, fecha_factura: str, proyecto: str, cuenta: str, export_dir: str):
    """
    Genera un archivo Excel (.xlsx) para gestoría.
    - Cada línea representa una sesión.
    - Agrupación por paciente + mes.
    - IVA = 0% (servicios sanitarios)
    - Siempre devuelve el nombre del archivo generado.
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
    # 💾 Crear Excel con openpyxl
    # -----------------------------------
    filename = f"gestoria_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    filepath = os.path.join(export_dir, filename)

    wb = Workbook()
    ws = wb.active
    ws.title = "Facturas Gestoría"

    # Escribir encabezados y datos
    for r_idx, row in enumerate(dataframe_to_rows(df_out, index=False, header=True), 1):
        ws.append(row)

    # Autoajustar ancho de columnas
    for col in ws.columns:
        max_length = 0
        col_letter = col[0].column_letter
        for cell in col:
            try:
                max_length = max(max_length, len(str(cell.value)))
            except:
                pass
        ws.column_dimensions[col_letter].width = max_length + 2

    wb.save(filepath)

    return filename
