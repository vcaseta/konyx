import pandas as pd
import requests
from datetime import datetime
from app.core.persistence import load_data
from app.core.exporters.holded_export import build_holded_csv


HOLD_API_BASE = "https://api.holded.com/api/invoicing/v1/documents"


def send_to_holded(empresa: str, merged_df, fecha_factura: str, proyecto: str, cuenta: str, export_dir: str, log_step):
    """
    Envía las facturas generadas a la API de Holded según la empresa seleccionada.
    Siempre genera el CSV de respaldo, haya o no conexión con Holded.
    """
    data = load_data()
    api_key = None

    if empresa.strip().lower().startswith("kissoro"):
        api_key = data.get("apiKissoro", "")
        empresa_nombre = "Kissoro"
    elif empresa.strip().lower().startswith("en plural"):
        api_key = data.get("apiEnPlural", "")
        empresa_nombre = "En Plural Psicología"
    else:
        log_step(f"⚠️ Empresa desconocida: {empresa}. Se genera solo CSV.")
        return build_holded_csv(merged_df, empresa, fecha_factura, proyecto, cuenta, export_dir)

    # 🧾 Generar CSV de respaldo SIEMPRE
    filename = build_holded_csv(merged_df, empresa, fecha_factura, proyecto, cuenta, export_dir)
    log_step(f"💾 CSV de respaldo generado: {filename}")

    # 🚫 Si no hay API configurada, se detiene aquí
    if not api_key:
        log_step(f"⚠️ No se encontró API configurada para {empresa_nombre}. No se crearán facturas.")
        return filename

    # 🔄 Agrupar por paciente+mes (cada factura = un grupo)
    possible_names = ["paciente", "nombre", "nombre del contacto", "nombre completo"]
    col_paciente = next((c for c in merged_df.columns if c.strip().lower() in possible_names), None)
    if not col_paciente:
        log_step("⚠️ No se encontró columna de paciente para agrupar. No se crearán facturas.")
        return filename

    try:
        fecha_obj = pd.to_datetime(fecha_factura, errors="coerce")
        if fecha_obj is not pd.NaT:
            merged_df["mes"] = fecha_obj.to_period("M")
        else:
            merged_df["mes"] = datetime.now().strftime("%Y-%m")
    except Exception:
        merged_df["mes"] = datetime.now().strftime("%Y-%m")

    grupos = merged_df.groupby([col_paciente, "mes"], dropna=False)

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    # 📡 Enviar facturas una a una
    for nombre_paciente, grupo in grupos:
        try:
            nombre = str(nombre_paciente[0]) if isinstance(nombre_paciente, tuple) else nombre_paciente

            # 🧾 Crear cuerpo de factura
            invoice = {
                "date": datetime.now().strftime("%Y-%m-%d"),
                "contactName": nombre,
                "concept": "Servicios de Psicoterapia",
                "description": f"Servicios de psicoterapia ({empresa_nombre})",
                "items": [],
                "type": "invoice",
                "currency": "EUR",
                "dueDate": datetime.now().strftime("%Y-%m-%d"),
                "tags": [f"#{proyecto.lower().replace(' ', '-')}"],
                "paymentMethod": "Transferencia",
            }

            # Añadir líneas de detalle
            for _, row in grupo.iterrows():
                precio = 0
                for key in ["Precio unidad", "Importe", "Precio"]:
                    if key in row and pd.notna(row[key]):
                        try:
                            precio = float(row[key])
                            break
                        except ValueError:
                            continue

                invoice["items"].append({
                    "name": row.get("Concepto", "Sesión de psicoterapia"),
                    "description": row.get("Descripción del producto", ""),
                    "price": precio,
                    "quantity": int(row.get("Unidades", 1)) or 1,
                    "tax": 0,
                })

            # 📤 Enviar a Holded
            try:
                r = requests.post(HOLD_API_BASE, json=invoice, headers=headers, timeout=15)
                if r.status_code == 200:
                    log_step(f"✅ Factura creada en Holded ({empresa_nombre}): {nombre}")
                else:
                    log_step(f"⚠️ Error creando factura {nombre} ({empresa_nombre}): {r.text}")
            except requests.exceptions.RequestException as e:
                log_step(f"⚠️ No se pudo conectar con Holded ({empresa_nombre}): {e}. Se mantiene CSV de respaldo.")

        except Exception as e:
            log_step(f"❌ Error procesando factura de {nombre_paciente}: {e}")

    log_step(f"📦 Exportación a Holded ({empresa_nombre}) completada con respaldo CSV.")
    return filename
