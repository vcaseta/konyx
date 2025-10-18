import requests
from datetime import datetime
from app.core.persistence import load_data
from app.core.exporters.holded_export import build_holded_csv

HOLD_API_BASE = "https://api.holded.com/api/invoicing/v1/documents"


def send_to_holded(empresa: str, merged_df, fecha_factura: str, proyecto: str, cuenta: str, export_dir: str, log_step):
    """
    Envía las facturas generadas a la API de Holded según la empresa seleccionada.
    Si no hay API configurada, solo genera el CSV de respaldo.
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

    if not api_key:
        log_step(f"⚠️ No se encontró API configurada para {empresa_nombre}. Solo se generará CSV.")
        return build_holded_csv(merged_df, empresa, fecha_factura, proyecto, cuenta, export_dir)

    # 🔧 Generar CSV previo (respaldo)
    filename = build_holded_csv(merged_df, empresa, fecha_factura, proyecto, cuenta, export_dir)

    # 🔄 Agrupar por paciente+mes (cada factura)
    possible_names = ["paciente", "nombre", "nombre del contacto"]
    col_paciente = next((c for c in merged_df.columns if c.strip().lower() in possible_names), None)
    if not col_paciente:
        log_step("❌ No se encontró columna de paciente para agrupar.")
        return filename

    merged_df["mes"] = pd.to_datetime(fecha_factura).dt.to_period("M")
    grupos = merged_df.groupby([col_paciente, "mes"])

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

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

            # Añadir líneas
            for _, row in grupo.iterrows():
                invoice["items"].append({
                    "name": row.get("Concepto", "Sesión de psicoterapia"),
                    "description": row.get("Descripción del producto", ""),
                    "price": float(row.get("Precio unidad", 0)) or 0,
                    "quantity": int(row.get("Unidades", 1)) or 1,
                    "tax": 0,
                })

            # 📡 Enviar a Holded
            r = requests.post(HOLD_API_BASE, json=invoice, headers=headers, timeout=15)
            if r.status_code == 200:
                log_step(f"✅ Factura creada en Holded ({empresa_nombre}): {nombre}")
            else:
                log_step(f"⚠️ Error creando factura {nombre} ({empresa_nombre}): {r.text}")

        except Exception as e:
            log_step(f"❌ Error procesando factura de {nombre_paciente}: {e}")

    return filename
