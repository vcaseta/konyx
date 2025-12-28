import os
import pandas as pd
from datetime import datetime
from openpyxl import Workbook
from openpyxl.utils.dataframe import dataframe_to_rows
from openpyxl.styles import Font, Alignment
from app.core.validators.enrich_contacts import validate_and_enrich_contacts
from ._utils_cols import get_patient_col, get_therapist_col, pick_col


def build_gestoria_excel(
    merged_df,
    empresa: str,
    fecha_factura: str,
    proyecto: str,
    cuenta: str,
    export_dir: str,
    log_fn=print,
    use_auto_numbering: bool = True,
    invoice_prefix: str = "",
    invoice_start_number: int = 1,
):
    """
    Genera el Excel de exportación para Gestoría con el formato completo (20 columnas solicitadas).
    Cada sesión se exporta como una factura independiente.
    
    Columnas generadas:
    1. Empresa (Piscologia/Kissoro)
    2. Numero factura
    3. Fecha factura
    4. NIF cliente
    5. Nombre cliente
    6. Direccion cliente
    7. Codigo postal cliente
    8. Poblacion cliente
    9. Provincia cliente
    10. Telefono contacto cliente
    11. Mail cliente
    12. Concepto
    13. Descripcion del producto
    14. Precio unitario
    15. IVA
    16. Total precio
    17. Nombre canal de venta
    18. Cuenta canal de venta
    19. Forma de pago
    20. Fecha de pago
    """
    log_fn("🔍 Validando y completando contactos (Groq)...")
    merged_df = validate_and_enrich_contacts(merged_df, log_fn)
    
    # Obtener columnas dinámicamente
    col_paciente = get_patient_col(merged_df)
    col_terapeuta = get_therapist_col(merged_df)
    col_telefono = pick_col(merged_df, ["teléfono", "telefono", "tel", "móvil", "movil"])
    col_email = pick_col(merged_df, ["email", "e-mail", "mail", "correo", "correo electrónico"])
    col_fecha_pago = pick_col(merged_df, ["fecha de pago", "fecha pago", "pago"])
    col_metodo_pago = pick_col(merged_df, ["método de pago", "metodo de pago", "forma de pago", "pago"])
    col_tipo_sesion = pick_col(merged_df, ["tipo", "tipo de sesión", "tipo sesion", "concepto"])
    
    # Parsear fecha de factura
    fecha_dt = pd.to_datetime(fecha_factura, errors="coerce")
    if pd.isna(fecha_dt):
        raise ValueError("Fecha factura inválida.")
    
    facturas = []
    contador = 1
    
    for _, row in merged_df.iterrows():
        # ========================================
        # 1. NÚMERO DE FACTURA
        # ========================================
        if use_auto_numbering and invoice_prefix:
            # Usar la numeración personalizada del usuario
            num_factura = f"{invoice_prefix}{(invoice_start_number + contador - 1):04d}"
        elif use_auto_numbering:
            # Usar numeración por defecto basada en fecha
            num_factura = f"F{fecha_dt.strftime('%y%m')}{contador:04d}"
        else:
            # Sin numeración automática
            num_factura = "PR%%%%"
        
        # ========================================
        # 2. DATOS DEL CLIENTE
        # ========================================
        paciente = str(row.get(col_paciente, "")).strip() if col_paciente else ""
        nif = str(row.get("NIF", row.get("DNI", row.get("Documento de identidad", "")))).strip()
        
        # Dirección
        direccion = str(row.get("Dirección", "")).strip()
        codigo_postal = str(row.get("Código Postal", row.get("CP", ""))).strip()
        poblacion = str(row.get("Población", "")).strip()
        provincia = str(row.get("Provincia", "Tarragona")).strip()  # Por defecto Tarragona
        
        # Contacto
        telefono = ""
        if col_telefono:
            telefono = str(row.get(col_telefono, "")).strip()
        
        email = ""
        if col_email:
            email = str(row.get(col_email, "")).strip()
        
        # ========================================
        # 3. DATOS DE LA SESIÓN
        # ========================================
        terapeuta = str(row.get(col_terapeuta, "")).strip() if col_terapeuta else ""
        
        # Concepto (tipo de sesión)
        concepto = "Servicios de Psicoterapia"
        if col_tipo_sesion:
            tipo_sesion = str(row.get(col_tipo_sesion, "")).strip()
            if tipo_sesion:
                concepto = tipo_sesion
        
        # Descripción del producto
        fecha_sesion = str(row.get("Fecha", ""))[:10]
        descripcion = f"Sesión con {terapeuta}" if terapeuta else "Sesión de psicoterapia"
        
        # ========================================
        # 4. PRECIO E IVA
        # ========================================
        # Determinar precio base
        base = 0.0
        for k in ["Importe", "Precio", "Precio unidad", "Precio unitario"]:
            if k in row and pd.notna(row[k]):
                try:
                    val_str = str(row[k])
                    # Manejar formato europeo: 1.234,56 → 1234.56
                    val_str = val_str.replace('.', '').replace(',', '.')
                    # Eliminar caracteres no numéricos excepto punto
                    val_str = ''.join(c for c in val_str if c.isdigit() or c == '.')
                    if val_str:
                        base = float(val_str)
                        break
                except Exception:
                    pass
        
        # IVA (por defecto 0% para servicios de salud)
        iva = 0
        for k in ["IVA", "Tipo IVA", "% IVA"]:
            if k in row and pd.notna(row[k]):
                try:
                    iva = float(row[k])
                    break
                except Exception:
                    pass
        
        # Total precio
        total_precio = base * (1 + iva / 100)
        
        # ========================================
        # 5. FORMA Y FECHA DE PAGO
        # ========================================
        forma_pago = "Transferencia"  # Por defecto
        if col_metodo_pago:
            metodo = str(row.get(col_metodo_pago, "")).strip().lower()
            if "tarjeta" in metodo or "tpv" in metodo:
                forma_pago = "Tarjeta"
            elif "efectivo" in metodo:
                forma_pago = "Efectivo"
            elif "transferencia" in metodo:
                forma_pago = "Transferencia"
            elif "bizum" in metodo:
                forma_pago = "Bizum"
        
        fecha_pago = ""
        if col_fecha_pago:
            fp = row.get(col_fecha_pago, "")
            if pd.notna(fp):
                try:
                    # Intentar parsear la fecha
                    fp_dt = pd.to_datetime(fp, errors="coerce")
                    if not pd.isna(fp_dt):
                        fecha_pago = fp_dt.strftime("%d/%m/%Y")
                except Exception:
                    pass
        
        # ========================================
        # 6. CONSTRUIR FACTURA CON COLUMNAS SOLICITADAS
        # ========================================
        factura = {
            # Columnas solicitadas (20 columnas)
            "Empresa": empresa,
            "Numero factura": num_factura,
            "Fecha factura": fecha_dt.strftime("%d/%m/%Y"),
            "NIF cliente": nif,
            "Nombre cliente": paciente,
            "Direccion cliente": direccion,
            "Codigo postal cliente": codigo_postal,
            "Poblacion cliente": poblacion,
            "Provincia cliente": provincia,
            "Telefono contacto cliente": telefono,
            "Mail cliente": email,
            "Concepto": concepto,
            "Descripcion del producto": descripcion,
            "Precio unitario": base,
            "IVA": iva,
            "Total precio": total_precio,
            "Nombre canal de venta": proyecto,
            "Cuenta canal de venta": cuenta,
            "Forma de pago": forma_pago,
            "Fecha de pago": fecha_pago,
        }
        
        facturas.append(factura)
        contador += 1
    
    # ========================================
    # 7. CREAR DATAFRAME Y EXCEL
    # ========================================
    df_final = pd.DataFrame(facturas)
    
    # Crear libro Excel
    wb = Workbook()
    ws = wb.active
    ws.title = "Gestoría"
    
    # Insertar encabezados y datos
    for r in dataframe_to_rows(df_final, index=False, header=True):
        ws.append(r)
    
    # Estilos encabezado
    for c in ws[1]:
        c.font = Font(bold=True)
        c.alignment = Alignment(horizontal="center")
    
    # Ajustar anchos de columna
    column_widths = {
        'A': 15,  # Empresa
        'B': 18,  # Numero factura
        'C': 15,  # Fecha factura
        'D': 12,  # NIF cliente
        'E': 30,  # Nombre cliente
        'F': 40,  # Direccion cliente
        'G': 12,  # Codigo postal
        'H': 20,  # Poblacion
        'I': 15,  # Provincia
        'J': 15,  # Telefono
        'K': 30,  # Email
        'L': 30,  # Concepto
        'M': 40,  # Descripcion
        'N': 15,  # Precio unitario
        'O': 8,   # IVA
        'P': 15,  # Total precio
        'Q': 25,  # Nombre canal
        'R': 15,  # Cuenta canal
        'S': 15,  # Forma pago
        'T': 15,  # Fecha pago
    }
    
    for col, width in column_widths.items():
        ws.column_dimensions[col].width = width
    
    # Guardar archivo
    filename = f"gestoria_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    filepath = os.path.join(export_dir, filename)
    wb.save(filepath)
    
    log_fn(f"✅ Excel Gestoría generado: {filename}")
    log_fn(f"   📊 Total facturas: {len(facturas)}")
    log_fn(f"   💰 Total facturado: {df_final['Total precio'].sum():.2f} €")
    
    # Estadísticas de calidad de datos
    stats = {
        "con_nif": df_final['NIF cliente'].notna().sum(),
        "con_direccion": df_final['Direccion cliente'].notna().sum(),
        "con_email": df_final['Mail cliente'].notna().sum(),
        "con_telefono": df_final['Telefono contacto cliente'].notna().sum(),
    }
    
    log_fn(f"   ℹ️  Datos completos:")
    log_fn(f"      - NIF: {stats['con_nif']}/{len(facturas)} ({stats['con_nif']/len(facturas)*100:.1f}%)")
    log_fn(f"      - Dirección: {stats['con_direccion']}/{len(facturas)} ({stats['con_direccion']/len(facturas)*100:.1f}%)")
    log_fn(f"      - Email: {stats['con_email']}/{len(facturas)} ({stats['con_email']/len(facturas)*100:.1f}%)")
    log_fn(f"      - Teléfono: {stats['con_telefono']}/{len(facturas)} ({stats['con_telefono']/len(facturas)*100:.1f}%)")
    
    return filename
