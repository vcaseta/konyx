import re

def _norm(s: str) -> str:
    return (
        s.strip().lower()
        .replace("á","a").replace("é","e").replace("í","i").replace("ó","o").replace("ú","u")
    )

def pick_col(df, candidates):
    cols_norm = {_norm(c): c for c in df.columns}
    for cand in candidates:
        if _norm(cand) in cols_norm:
            return cols_norm[_norm(cand)]
    return None

def get_patient_col(df):
    # Prioriza “paciente” y variantes; evita profesional
    return pick_col(df, [
        "paciente", "nombre paciente", "cliente", "nombre del contacto", "nombre contacto",
        "usuario", "nombre"
    ])

def get_therapist_col(df):
    return pick_col(df, ["profesional", "terapeuta", "psicologo/a", "psicologa", "psicologo"])
