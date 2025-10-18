import pandas as pd
import requests
from datetime import datetime
from app.core.persistence import load_data
from .holded_export import build_holded_csv
from ._utils_cols import get_patient_col, get_therapist_col

HOLD_API_BASE = "https://api.holded.com/api/invoicing/v1/documents"

def send_to_holded(empresa: str, merged_df, fecha_factura: str, proyecto: str, cuenta: str, export_dir: str, log_step):
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

    # CSV de respaldo SIEMPRE
    filename = build_holded_csv(merged_df, empresa, fecha_factura, proyecto, cuenta, export_dir)
    log_step(f"💾 CSV de respaldo generado: {filename}")

    if not api_key:
        log_step(f"⚠️ No hay API configurada para {empresa_nombre}. No se crearán facturas.")
        return filename

    col_paciente = get_patient_col(merged_df)
    if not col_paciente:
        log_step("⚠️ No se encontró columna de paciente. No se crearán facturas.")
        return filename
    col_terapeuta = get_therapist_col(merged_df)

    fecha_dt = pd.to_datetime(fecha_factura, errors="coerce")
    merged_df["__mes__"] = (fecha_dt if not pd.isna(fecha_dt) else pd.Timestamp.now()).to_period("M")

    headers = { "Authorization": f"Bearer {api_key}", "Content-Type": "application/json" }

    for (paciente, mes), grupo in merged_df.groupby([col_paciente, "__mes__"], dropna=False):
        try:
            invoice = {
                "date": datetime.now().strftime("%Y-%m-%d"),
                "contactName": str(paciente),
                "concept": "Servicios de Psicoterapia",
                "description": f"Servicios de psicoterapia ({empresa_nombre})",
                "items": [],
                "type": "invoice",
                "currency": "EUR",
                "dueDate": datetime.now().strftime("%Y-%m-%d"),
                "tags": [f"#{proyecto.lower().replace(' ', '-')}"],
                "paymentMethod": "Transferencia",
            }

            for _, row in grupo.iterrows():
                precio = 0.0
                for k in ["Precio unidad","Importe","Precio"]:
                    if k in row and pd.notna(row[k]):
                        try:
                            precio = float(row[k]); break
                        except: pass
                ter = str(row.get(col_terapeuta, "")).strip() if col_terapeuta else ""
                fecha_sesion = str(row.get("Fecha",""))[:10]
                invoice["items"].append({
                    "name": "Sesión de psicoterapia",
                    "description": f"{fecha_sesion} – Sesión – {ter}".strip(" –"),
                    "price": precio,
                    "quantity": int(row.get("Unidades", 1)) or 1,
                    "tax": 0,
                })

            r = requests.post(HOLD_API_BASE, json=invoice, headers=headers, timeout=15)
            if r.status_code == 200:
                log_step(f"✅ Factura creada en Holded ({empresa_nombre}): {paciente}")
            else:
                log_step(f"⚠️ Error creando factura {paciente} ({empresa_nombre}): {r.text}")

        except Exception as e:
            log_step(f"❌ Error procesando factura de {paciente}: {e}")

    merged_df.drop(columns=["__mes__"], errors="ignore", inplace=True)
    log_step(f"📦 Envío a Holded ({empresa_nombre}) finalizado con CSV de respaldo.")
    return filename

