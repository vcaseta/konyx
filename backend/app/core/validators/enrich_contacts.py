import requests
import pandas as pd
from app.core.persistence import load_data

# ============================================================
# 🧠 Completar datos con Groq
# ============================================================
def groq_complete(prompt: str, log_fn=print) -> str:
    data = load_data()
    api_key = data.get("apiGroq", "").strip()
    if not api_key:
        log_fn("⚠️ API Groq no configurada (no se completarán datos automáticamente).")
        return ""

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama3-70b-8192",
                "messages": [
                    {
                        "role": "system",
                        "content": "Eres un asistente administrativo que completa datos de pacientes en España.",
                    },
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.2,
                "max_tokens": 60,
            },
            timeout=10,
        )
        data = response.json()
        if "choices" in data and len(data["choices"]) > 0:
            return data["choices"][0]["message"]["content"].strip()
        else:
            return ""
    except Exception as e:
        log_fn(f"⚠️ Error Groq: {e}")
        return ""

# ============================================================
# 🧩 Validación y enriquecimiento
# ============================================================
def find_col(df: pd.DataFrame, possible_names: list):
    """Busca una columna ignorando mayúsculas, tildes y espacios."""
    cols = {c.strip().lower().replace(" ", "").replace(".", ""): c for c in df.columns}
    for name in possible_names:
        key = name.strip().lower().replace(" ", "").replace(".", "")
        if key in cols:
            return cols[key]
    return None


def validate_and_enrich_contacts(df: pd.DataFrame, log_fn=print) -> pd.DataFrame:
    df = df.copy()

    # Buscar columnas relevantes (sin depender del nombre exacto)
    nif_col = find_col(df, ["NIF", "DNI", "N.I.F", "Documento", "Identificación", "NIF/Pasaporte"])
    direccion_col = find_col(df, ["Dirección", "Domicilio", "Calle"])
    cp_col = find_col(df, ["Código Postal", "CP", "C.P."])
    poblacion_col = find_col(df, ["Población", "Ciudad", "Localidad"])
    provincia_col = find_col(df, ["Provincia", "Region"])
    nombre_col = find_col(df, ["Nombre", "Paciente", "Nombre fiscal"])

    # Asegurar que existen las columnas
    for col, default in [
        (nif_col or "NIF", ""),
        (direccion_col or "Dirección", ""),
        (cp_col or "Código Postal", ""),
        (poblacion_col or "Población", ""),
        (provincia_col or "Provincia", ""),
        (nombre_col or "Nombre", ""),
    ]:
        if col not in df.columns:
            df[col] = default

    df["Código Postal"] = df["Código Postal"].astype(str).str.strip().str[:5]

    # Evitar mensajes repetidos
    seen = set()

    for idx, row in df.iterrows():
        nombre = str(row.get(nombre_col or "Nombre", "")).strip()
        if not nombre:
            continue

        # ---- NIF ----
        nif = str(row.get(nif_col or "NIF", "")).strip()
        if not nif and nombre not in seen:
            log_fn(f"⚠️ {nombre}: NIF vacío o no encontrado.")
            seen.add(nombre)

        # ---- Dirección / Población ----
        direccion = str(row.get(direccion_col or "Dirección", "")).strip()
        poblacion = str(row.get(poblacion_col or "Población", "")).strip()
        if (not direccion or not poblacion) and nombre not in seen:
            log_fn(f"⚠️ {nombre}: Dirección o población incompleta.")
            seen.add(nombre)

        # ---- Provincia ----
        provincia = str(row.get(provincia_col or "Provincia", "")).strip()
        cp = str(row.get(cp_col or "Código Postal", "")).strip()
        if not provincia and cp:
            prompt = f"Indica la provincia de España correspondiente al código postal {cp}. Responde solo con el nombre."
            provincia_res = groq_complete(prompt, log_fn)
            if provincia_res:
                df.at[idx, provincia_col or "Provincia"] = provincia_res
                log_fn(f"✅ Provincia completada con Groq ({nombre} → {provincia_res})")

    return df
