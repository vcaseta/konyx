from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse, StreamingResponse
from app.core.persistence import load_data, save_data
from datetime import datetime
import pandas as pd
import io, os, json, time, re

# --- GPT ---
import openai
from dotenv import load_dotenv
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

router = APIRouter(prefix="/export", tags=["export"])

# ============================================================
# 📡 STREAM DE PROGRESO (SSE)
# ============================================================
progress_log: list[str] = []

def log_step(text: str):
    """Añade un mensaje al stream de progreso (y al log de servidor)."""
    progress_log.append(text)
    print("📡", text)

def progress_stream():
    """Genera eventos SSE con los pasos acumulados."""
    for step in progress_log:
        yield f"data: {json.dumps({'step': step})}\n\n"
        time.sleep(0.6)  # ritmo agradable de lectura
    yield "event: end\ndata: {}\n\n"

@router.get("/progress")
async def export_progress():
    """Endpoint SSE: el frontend se conecta aquí para leer el progreso en vivo."""
    return StreamingResponse(progress_stream(), media_type="text/event-stream")


# ============================================================
# 🔎 VALIDACIÓN DE FORMATOS
# ============================================================
def detectar_formato_sesiones(df: pd.DataFrame) -> str:
    cols = [c.strip().lower() for c in df.columns]
    # “Eholo” genérico: presencia de campos clave
    if all(any(ec in c for c in cols) for ec in ["fecha", "iva", "total"]):
        return "Eholo"
    # “Gestoría” aproximado: bastantes coincidencias de cabeceras típicas
    gestor_cols = [
        "fecha factura", "numero factura", "nombre", "nif",
        "concepto", "importe base", "iva", "irpf", "total"
    ]
    matches = sum(any(gc in c for c in cols) for gc in gestor_cols)
    if matches >= 6:
        return "Gestoría"
    return "Desconocido"

def validar_contactos(df: pd.DataFrame):
    cols = [c.strip().lower() for c in df.columns]
    # Basta con que exista al menos un identificador razonable
    if not any(x in cols for x in ["nombre", "nif", "cif", "email"]):
        raise HTTPException(
            status_code=400,
            detail="El archivo de contactos no tiene columnas válidas (nombre, NIF/CIF o email)."
        )

def normalizar_columnas(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df.columns = [re.sub(r"\s+", " ", c.strip().lower()) for c in df.columns]
    # Normalizaciones frecuentes
    if "cif" in df.columns and "nif" not in df.columns:
        df.rename(columns={"cif": "nif"}, inplace=True)
    if "razon social" in df.columns and "nombre" not in df.columns:
        df.rename(columns={"razon social": "nombre"}, inplace=True)
    return df


# ============================================================
# 🤖 GPT: ANÁLISIS Y CORRECCIÓN
# ============================================================
def _extract_json(text: str) -> dict | None:
    try:
        start = text.find("{")
        end = text.rfind("}") + 1
        if start == -1 or end == 0:
            return None
        return json.loads(text[start:end])
    except Exception:
        return None

def analizar_tablas_gpt(df_ses: pd.DataFrame, df_con: pd.DataFrame) -> dict | None:
    """
    Pide a GPT un mapeo de columnas y clave de unión.
    Devuelve dict con: {"join_key": "...", "fields": {...}, "csv_columns": [...]}
    """
    try:
        muestras_ses = df_ses.head(10).fillna("").to_dict(orient="records")
        muestras_con = df_con.head(10).fillna("").to_dict(orient="records")

        prompt = f"""
Analiza estas dos tablas (muestras):

[Sesiones]
{muestras_ses}

[Contactos]
{muestras_con}

Devuelve SOLO JSON con esta forma:
{{
  "join_key": "nif | nombre | email",
  "fields": {{
    "nombre": ["posibles encabezados en sesiones o contactos"],
    "nif": ["..."],
    "importe": ["total", "importe base", "..."],
    "fecha": ["fecha", "fecha factura", "..."],
    "concepto": ["concepto", "descripcion", "..."],
    "iva": ["iva", "..."],
    "irpf": ["irpf", "..."],
    "total": ["total", "..."]
  }},
  "csv_columns": ["fecha", "nombre", "nif", "concepto", "importe base", "iva", "irpf", "total", "empresa", "proyecto", "cuenta contable", "usuario export"]
}}
No añadas explicaciones fuera del JSON.
"""

        completion = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Eres un experto en conciliación contable y análisis tabular."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
        )
        raw = completion.choices[0].message.content
        data = _extract_json(raw)
        return data
    except Exception as e:
        print("❌ Error en analizar_tablas_gpt:", e)
        return None

def detectar_cambios(df_original: pd.DataFrame, df_corregido: pd.DataFrame, prefix: str = "") -> list[str]:
    """Compara dos DataFrames y devuelve una lista textual de diferencias."""
    cambios: list[str] = []
    # Igualamos columnas si fuera necesario
    inter_cols = [c for c in df_original.columns if c in df_corregido.columns]
    ori = df_original[inter_cols].reset_index(drop=True)
    cor = df_corregido[inter_cols].reset_index(drop=True)

    # Garantizamos mismo length para comparar (hasta el mínimo)
    length = min(len(ori), len(cor))
    for i in range(length):
        for col in inter_cols:
            o = "" if pd.isna(ori.at[i, col]) else str(ori.at[i, col])
            c = "" if pd.isna(cor.at[i, col]) else str(cor.at[i, col])
            if o.strip() != c.strip():
                # Algunos mensajes bonitos según columna
                emoji = "✏️"
                if col in ("fecha", "fecha factura"): emoji = "📅"
                if col in ("nif", "cif"): emoji = "🧾"
                if col in ("importe", "total", "importe base", "iva", "irpf"): emoji = "💶"
                cambios.append(f"{emoji} {prefix}{col}: '{o}' → '{c}' (fila {i+1})")
    return cambios

def corregir_datos_con_gpt(df_ses: pd.DataFrame, df_con: pd.DataFrame):
    """
    Envía muestras a GPT para que proponga correcciones/normalizaciones.
    Devuelve (df_ses_corregido, df_con_corregido) y emite logs de cambios.
    """
    try:
        muestras_ses = df_ses.head(15).fillna("").to_dict(orient="records")
        muestras_con = df_con.head(15).fillna("").to_dict(orient="records")

        prompt = f"""
Corrige y completa los datos de estas tablas. Reglas:
- Normaliza fechas a formato dd/mm/yyyy.
- Normaliza NIF/CIF (quitar espacios/guiones, mayúsculas).
- Arregla nombres si hay coincidencias evidentes.
- Convierte importes a número decimal (punto como separador).
- Rellena valores vacíos cuando se puedan inferir.
- Mantén los nombres de campos originales cuando sea razonable.
- Devuelve SOLO JSON con:
{{
  "sesiones": [ {{... filas corregidas ...}} ],
  "contactos": [ {{... filas corregidas ...}} ],
  "correcciones": ["texto humano breve por cambio detectado (opcional)"]
}}
No incluyas explicaciones fuera del JSON.
Facturas (sesiones): {muestras_ses}
Contactos: {muestras_con}
"""

        completion = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Eres un experto en limpieza y conciliación de datos contables."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
        )

        raw = completion.choices[0].message.content
        data = _extract_json(raw)
        if not data or "sesiones" not in data or "contactos" not in data:
            log_step("⚠️ GPT no devolvió un JSON válido de correcciones. Se mantienen datos originales.")
            return df_ses, df_con

        df_ses_corr = pd.DataFrame(data["sesiones"])
        df_con_corr = pd.DataFrame(data["contactos"])

        # Emisión de cambios detectados (comparativa local)
        cambios = detectar_cambios(df_ses, df_ses_corr, prefix="Sesión ")
        cambios += detectar_cambios(df_con, df_con_corr, prefix="Contacto ")

        # Añadimos correcciones textuales opcionales del propio GPT
        if "correcciones" in data and isinstance(data["correcciones"], list):
            cambios += [f"🤖 {c}" for c in data["correcciones"]]

        # Publicamos (limitamos para no saturar)
        for msg in cambios[:120]:
            log_step(msg)

        log_step(f"✅ GPT completó {len(cambios)} correcciones/normalizaciones.")
        return df_ses_corr, df_con_corr

    except Exception as e:
        log_step(f"⚠️ Error corrigiendo datos con GPT: {e}")
        return df_ses, df_con


# ============================================================
# 🚀 ENDPOINT PRINCIPAL
# ============================================================
@router.post("/start")
async def start_export(
    formatoImport: str = Form(...),
    formatoExport: str = Form(...),
    empresa: str = Form(...),
    fechaFactura: str = Form(...),
    proyecto: str = Form(...),
    cuenta: str = Form(...),
    usuario: str = Form(...),
    ficheroSesiones: UploadFile = File(...),
    ficheroContactos: UploadFile = File(...),
):
    """
    Flujo real:
    1) Lee Excel
    2) Valida formatos
    3) Corrige/normaliza con GPT (y emite cambios)
    4) Analiza mapeo con GPT para renombrar/ligar columnas
    5) Merge por join_key
    6) Añade campos extra (empresa, proyecto, cuenta, fecha)
    7) Genera CSV y actualiza métricas
    """
    # reset del stream
    progress_log.clear()

    try:
        log_step("🔄 Iniciando exportación...")
        log_step("📥 Leyendo ficheros Excel...")

        # 1) Leer ficheros
        ses_bytes = await ficheroSesiones.read()
        con_bytes = await ficheroContactos.read()
        df_ses = pd.read_excel(io.BytesIO(ses_bytes))
        df_con = pd.read_excel(io.BytesIO(con_bytes))
        log_step("✅ Ficheros cargados.")

        # 2) Validar formatos
        log_step("🔎 Validando formato de sesiones...")
        tipo_detectado = detectar_formato_sesiones(df_ses)
        if tipo_detectado == "Desconocido":
            raise HTTPException(status_code=400, detail="El archivo de sesiones no es Eholo ni Gestoría.")
        log_step(f"🧩 Sesiones → formato detectado: {tipo_detectado}")

        log_step("🔎 Validando formato de contactos...")
        validar_contactos(df_con)
        log_step("✅ Contactos válidos.")

        # Normalizar cabeceras frecuentes
        df_ses = normalizar_columnas(df_ses)
        df_con = normalizar_columnas(df_con)

        # 3) Corrección / normalización semántica con GPT
        log_step("🤖 Analizando y corrigiendo datos con GPT...")
        df_ses, df_con = corregir_datos_con_gpt(df_ses, df_con)
        log_step("✅ Datos corregidos por GPT (si fue posible).")

        # 4) Análisis de mapeo con GPT
        log_step("🧠 Obteniendo mapeo de columnas y clave de unión (GPT)...")
        mapeo = analizar_tablas_gpt(df_ses, df_con)
        if not mapeo:
            log_step("⚠️ GPT no devolvió mapeo válido. Intentando unión local por NIF o nombre.")
            join_key = "nif" if ("nif" in df_ses.columns and "nif" in df_con.columns) else "nombre"
            fields = {}
            csv_cols = []
        else:
            join_key = mapeo.get("join_key", "nif")
            fields = mapeo.get("fields", {})
            csv_cols = mapeo.get("csv_columns", [])
            # Renombrado de columnas según mapeo
            for campo, posibles in fields.items():
                if not isinstance(posibles, list): 
                    continue
                for cand in posibles:
                    c = cand.strip().lower()
                    if c in df_ses.columns and campo not in df_ses.columns:
                        df_ses.rename(columns={c: campo}, inplace=True)
                    if c in df_con.columns and campo not in df_con.columns:
                        df_con.rename(columns={c: campo}, inplace=True)
            log_step(f"🗂️ Columnas renombradas según GPT. Unión por '{join_key}'.")

        # Asegurar normalización clave para join
        if "nif" in df_ses.columns: df_ses["nif"] = df_ses["nif"].astype(str).str.strip().str.upper()
        if "nif" in df_con.columns: df_con["nif"] = df_con["nif"].astype(str).str.strip().str.upper()
        if "nombre" in df_ses.columns: df_ses["nombre"] = df_ses["nombre"].astype(str).str.strip().str.lower()
        if "nombre" in df_con.columns: df_con["nombre"] = df_con["nombre"].astype(str).str.strip().str.lower()

        # 5) Merge
        if join_key not in df_ses.columns or join_key not in df_con.columns:
            log_step(f"⚠️ La clave '{join_key}' no existe en ambas tablas. Usando fallback.")
            join_key = "nif" if ("nif" in df_ses.columns and "nif" in df_con.columns) else "nombre"

        log_step(f"🔗 Conciliando por '{join_key}'...")
        merged = pd.merge(df_ses, df_con, how="left", on=join_key)
        log_step("✅ Conciliación realizada.")

        # 6) Campos extra de interfaz
        merged["fecha factura"] = fechaFactura
        merged["empresa"] = empresa
        merged["proyecto"] = proyecto
        merged["cuenta contable"] = cuenta
        merged["usuario export"] = usuario
        log_step("🧾 Campos de contexto aplicados (empresa, proyecto, cuenta, fecha).")

        # 7) CSV
        os.makedirs("./app/exports", exist_ok=True)
        filename = f"export_{empresa.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        filepath = f"./app/exports/{filename}"

        # columnas finales — si GPT propuso, usar; si no, best-effort
        columnas_csv = csv_cols or [
            c for c in [
                "fecha factura", "numero factura", "nombre", "nif", "concepto",
                "importe base", "iva", "irpf", "total", "empresa",
                "proyecto", "cuenta contable", "usuario export"
            ] if c in merged.columns
        ]
        merged.to_csv(filepath, index=False, encoding="utf-8-sig", columns=columnas_csv)
        log_step("💾 CSV generado correctamente.")

        # 8) Métricas
        data = load_data()
        data["ultimoExport"] = datetime.now().strftime("%d/%m/%Y")
        data["totalExportaciones"] = data.get("totalExportaciones", 0) + 1
        save_data(data)
        log_step("📈 Estadísticas actualizadas.")
        log_step("✅ Exportación finalizada.")

        return {
            "message": "Exportación completada correctamente",
            "archivo_generado": filename,
            "ultimoExport": data["ultimoExport"],
            "totalExportaciones": data["totalExportaciones"]
        }

    except HTTPException:
        # ya formateado
        raise
    except Exception as e:
        data = load_data()
        data["totalExportacionesFallidas"] = data.get("totalExportacionesFallidas", 0) + 1
        save_data(data)
        log_step(f"❌ Error en exportación: {e}")
        raise HTTPException(status_code=400, detail=f"Error procesando exportación: {e}")


# ============================================================
# 📥 DESCARGA DEL CSV
# ============================================================
@router.get("/download/{filename}")
async def download_csv(filename: str):
    path = f"./app/exports/{filename}"
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return FileResponse(path, media_type="text/csv", filename=filename)
