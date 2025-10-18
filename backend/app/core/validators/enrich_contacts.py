import requests
import pandas as pd
from app.core.persistence import load_data


def groq_complete(prompt: str, log_fn=print) -> str:
    """
    Envía una consulta a Groq (modelo llama3-70b-8192).
    Si hay error, devuelve cadena vacía y registra aviso sin interrumpir el proceso.
    """
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
            log_fn(f"⚠️ Respuesta Groq vacía para prompt: {prompt[:60]}...")
            return ""

    except Exception as e:
        log_fn(f"⚠️ Error Groq: {e}")
        return ""


def validate_and_enrich_contacts(df: pd.DataFrame, log_fn=print) -> pd.DataFrame:
    """
    Valida y completa los datos de contacto del DataFrame.
    - Avisa si faltan NIF, dirección o provincia.
    - Si falta provincia y hay CP, consulta Groq para completarla.
    - Si falta NIF o dirección, registra aviso sin detener el proceso.
    """
    df = df.copy()
    required_cols = ["NIF", "Dirección", "Código Postal", "Población", "Provincia"]
    for col in required_cols:
        if col not in df.columns:
            df[col] = ""

    # Normalizar CP
    df["Código Postal"] = df["Código Postal"].astype(str).str.strip().str[:5]

    for idx, row in df.iterrows():
        nombre = str(row.get("Nombre") or row.get("Paciente") or "").strip()
        cp = str(row.get("Código Postal", "")).strip()
        provincia = str(row.get("Provincia", "")).strip()
        nif = str(row.get("NIF", "")).strip()

        # NIF vacío
        if not nif:
            log_fn(f"⚠️ {nombre}: NIF vacío o no encontrado.")

        # Provincia faltante: intentar completar con Groq
        if not provincia and cp:
            prompt = f"Indica la provincia de España correspondiente al código postal {cp}. Responde solo con el nombre."
            provincia_res = groq_complete(prompt, log_fn)
            if provincia_res:
                df.at[idx, "Provincia"] = provincia_res
                log_fn(f"✅ Provincia completada con Groq ({nombre} → {provincia_res})")
            else:
                log_fn(f"⚠️ {nombre}: No se pudo completar provincia para CP {cp}.")

        # Dirección o población faltante
        if not row.get("Dirección") or not row.get("Población"):
            log_fn(f"⚠️ {nombre}: Dirección o población incompleta.")

    return df
