import os
import pandas as pd
from datetime import datetime
from app.core.validators.enrich_contacts import validate_and_enrich_contacts
from app.core.validators.enrich_contacts import groq_complete
from ._utils_cols import get_patient_col, get_therapist_col


def build_holded_csv(merged: pd.DataFrame, empresa: str, fecha_factura: str, proyecto: str, cuenta: str, export_dir: str, log_fn=print):
    """
    Genera un CSV compatible con Holded (formato real de ejemplo).
    Agrupa por paciente+mes y concatena las sesiones en una sola línea.
    """
    log_fn("🔍 Validando y completando contactos (Groq)...")
    merged = validate_and_enrich_contacts(merged, log_fn)

    col_paciente = get_patient_col(merged)
    if not col_paciente:
        raise ValueError("No se encontró una columna de paciente (por ej. 'Paciente').")
    col_terapeuta = get_therapist_col(merged)

    fecha_general = pd.to_datetime(fecha_factura, errors="coerce")
    if pd.isna(fecha_general):
        raise ValueError("Fecha factura inválida.")

    merged["Mes"] = fecha_general.to_period("M")
    facturas = []
    contador = 1

    for (paciente, mes), grupo in merged.groupby([col_paciente, "Mes"], dropna=False):
        descripcion = []
        for _, row in grupo.iterrows():
            fecha = str(row.get("Fecha", ""))[:10]
            sesion = str(row.get("Tipo", "Sesión"))
            terapeuta = str(row.get(col_terapeuta, "")).strip()
            descripcion.append(f"{fecha} - {sesion} {terapeuta}".strip())

        facturas.append({
            "Número": f"FAC-{fecha_general.strftime('%Y%m')}-{contador:03d}",
            "Fecha": fecha_general.strftime("%Y-%m-%d"),
            "Vencimiento": fecha_general.strftime("%Y-%m-31"),
            "Cliente": paciente,
            "Email cliente": "",
            "Moneda": "EUR",
            "Concepto": "Servicios del mes",
            "Descripción": "\n".join(descripcion),
            "Cantidad": len(descripcion),
            "Precio": 0.0,
            "Impuesto": 21,
            "Descuento": 0,
            "Cuenta contable": cuenta,
            "Tags": f"#{proyecto.lower().replace(' ', '-')}",
        })
        contador += 1

    df_out = pd.DataFrame(facturas)
    filename = f"holded_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    out_path = os.path.join(export_dir, filename)
    df_out.to_csv(out_path, index=False, encoding="utf-8-sig", sep=",")

    log_fn(f"✅ CSV Holded generado: {filename} ({len(df_out)} facturas)")
    return filename
