import pandas as pd
import requests
from datetime import datetime
from app.core.persistence import load_data
from .holded_export import build_holded_csv
from ._utils_cols import get_patient_col, get_therapist_col, pick_col

HOLDED_API_BASE = "https://api.holded.com/api/invoicing/v1/documents"
HOLDED_CONTACTS_API = "https://api.holded.com/api/contacts/v1/contacts"


def normalize_column_name(name: str) -> str:
    """Normaliza nombre de columna para comparación."""
    return name.strip().lower().replace("á", "a").replace("é", "e").replace("í", "i").replace("ó", "o").replace("ú", "u")


def find_column(df: pd.DataFrame, possible_names: list) -> str:
    """Busca una columna en el DataFrame ignorando mayúsculas y tildes."""
    cols_map = {normalize_column_name(c): c for c in df.columns}
    for name in possible_names:
        normalized = normalize_column_name(name)
        if normalized in cols_map:
            return cols_map[normalized]
    return None


def get_or_create_contact(contact_data: dict, headers: dict, log_step) -> str:
    """
    Busca un contacto en Holded por NIF o email, si no existe lo crea.
    Retorna el contactId de Holded.
    """
    try:
        # 1. Buscar contacto existente por NIF
        nif = contact_data.get("vatnumber", "").strip()
        if nif:
            search_url = f"{HOLDED_CONTACTS_API}?vatnumber={nif}"
            r = requests.get(search_url, headers=headers, timeout=10)
            if r.status_code == 200:
                contacts = r.json()
                if contacts and len(contacts) > 0:
                    contact_id = contacts[0].get("id")
                    log_step(f"   📋 Contacto encontrado: {contact_data['name']} (NIF: {nif})")
                    return contact_id
        
        # 2. Si no existe, crear contacto nuevo
        log_step(f"   ➕ Creando contacto nuevo: {contact_data['name']}")
        
        # Preparar datos del contacto
        contact_payload = {
            "name": contact_data.get("name", ""),
            "code": contact_data.get("code", ""),
            "email": contact_data.get("email", ""),
            "mobile": contact_data.get("mobile", ""),
            "phone": contact_data.get("phone", ""),
            "vatnumber": nif,
            "billAddress": {
                "address": contact_data.get("address", ""),
                "postalCode": contact_data.get("postalCode", ""),
                "city": contact_data.get("city", ""),
                "province": contact_data.get("province", ""),
                "country": "ES"
            }
        }
        
        # Eliminar campos vacíos
        contact_payload = {k: v for k, v in contact_payload.items() if v}
        if "billAddress" in contact_payload:
            contact_payload["billAddress"] = {k: v for k, v in contact_payload["billAddress"].items() if v}
            if not contact_payload["billAddress"]:
                del contact_payload["billAddress"]
        
        r = requests.post(HOLDED_CONTACTS_API, json=contact_payload, headers=headers, timeout=15)
        
        if r.status_code in [200, 201]:
            contact_id = r.json().get("id")
            log_step(f"   ✅ Contacto creado: {contact_data['name']}")
            return contact_id
        else:
            log_step(f"   ⚠️ Error creando contacto {contact_data['name']}: {r.status_code} - {r.text[:200]}")
            return None
            
    except Exception as e:
        log_step(f"   ⚠️ Error procesando contacto {contact_data.get('name', 'desconocido')}: {e}")
        return None


def send_to_holded(empresa: str, merged_df, fecha_factura: str, proyecto: str, cuenta: str, export_dir: str, log_step):
    """
    Envía facturas a Holded automáticamente.
    
    Proceso:
    1. Genera CSV de respaldo
    2. Verifica API key
    3. Para cada paciente:
       a. Crea/busca contacto en Holded
       b. Agrupa sesiones del mes
       c. Crea factura con todos los items
    4. Reporta estadísticas
    """
    
    data = load_data()
    api_key = None
    empresa_nombre = ""
    
    # Determinar empresa y API key
    if empresa.strip().lower().startswith("kissoro"):
        api_key = data.get("apiKissoro", "")
        empresa_nombre = "Kissoro"
    elif "plural" in empresa.strip().lower():
        api_key = data.get("apiEnPlural", "")
        empresa_nombre = "En Plural Psicología"
    else:
        log_step(f"⚠️ Empresa desconocida: {empresa}. Se genera solo CSV.")
        return build_holded_csv(merged_df, empresa, fecha_factura, proyecto, cuenta, export_dir, log_step)
    
    # ============================================================
    # 1. CSV DE RESPALDO SIEMPRE
    # ============================================================
    log_step("💾 Generando CSV de respaldo...")
    filename = build_holded_csv(merged_df, empresa, fecha_factura, proyecto, cuenta, export_dir, log_step)
    log_step(f"✅ CSV de respaldo generado: {filename}")
    
    # ============================================================
    # 2. VERIFICAR API KEY
    # ============================================================
    if not api_key or api_key.strip() == "":
        log_step(f"⚠️ No hay API configurada para {empresa_nombre}. Solo se generó CSV.")
        return filename
    
    log_step(f"🔑 API de Holded configurada para {empresa_nombre}")
    
    # ============================================================
    # 3. PREPARAR COLUMNAS
    # ============================================================
    col_paciente = get_patient_col(merged_df)
    if not col_paciente:
        log_step("⚠️ No se encontró columna de paciente. Solo CSV disponible.")
        return filename
    
    col_terapeuta = get_therapist_col(merged_df)
    col_nif = find_column(merged_df, ["NIF", "DNI", "Documento de identidad"])
    col_email = find_column(merged_df, ["Email", "E-mail", "Correo"])
    col_telefono = find_column(merged_df, ["Teléfono", "Telefono", "Móvil", "Movil"])
    col_direccion = find_column(merged_df, ["Dirección", "Direccion", "Domicilio"])
    col_cp = find_column(merged_df, ["Código Postal", "CP", "Codigo Postal"])
    col_poblacion = find_column(merged_df, ["Población", "Poblacion", "Ciudad"])
    col_provincia = find_column(merged_df, ["Provincia"])
    
    # ============================================================
    # 4. AGRUPAR POR PACIENTE Y MES
    # ============================================================
    fecha_dt = pd.to_datetime(fecha_factura, errors="coerce")
    if pd.isna(fecha_dt):
        fecha_dt = pd.Timestamp.now()
    
    merged_df["__mes__"] = fecha_dt.to_period("M")
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Estadísticas
    stats = {
        "facturas_creadas": 0,
        "facturas_error": 0,
        "contactos_creados": 0,
        "contactos_encontrados": 0,
    }
    
    log_step(f"📤 Enviando facturas a Holded ({empresa_nombre})...")
    log_step("")
    
    # ============================================================
    # 5. PROCESAR CADA PACIENTE
    # ============================================================
    grupos = list(merged_df.groupby([col_paciente, "__mes__"], dropna=False))
    total_grupos = len(grupos)
    
    for idx, ((paciente, mes), grupo) in enumerate(grupos, 1):
        try:
            paciente_nombre = str(paciente).strip()
            if not paciente_nombre or paciente_nombre.lower() in ['nan', 'none', '']:
                log_step(f"⚠️ Saltando paciente sin nombre (fila {grupo.index[0]})")
                stats["facturas_error"] += 1
                continue
            
            log_step(f"[{idx}/{total_grupos}] Procesando: {paciente_nombre}")
            
            # ========================================
            # 5.1. PREPARAR DATOS DEL CONTACTO
            # ========================================
            primera_fila = grupo.iloc[0]
            
            contact_data = {
                "name": paciente_nombre,
                "code": str(primera_fila.get(col_nif, "")).strip() if col_nif else "",
                "vatnumber": str(primera_fila.get(col_nif, "")).strip() if col_nif else "",
                "email": str(primera_fila.get(col_email, "")).strip() if col_email else "",
                "phone": str(primera_fila.get(col_telefono, "")).strip() if col_telefono else "",
                "mobile": str(primera_fila.get(col_telefono, "")).strip() if col_telefono else "",
                "address": str(primera_fila.get(col_direccion, "")).strip() if col_direccion else "",
                "postalCode": str(primera_fila.get(col_cp, "")).strip() if col_cp else "",
                "city": str(primera_fila.get(col_poblacion, "")).strip() if col_poblacion else "",
                "province": str(primera_fila.get(col_provincia, "Tarragona")).strip() if col_provincia else "Tarragona",
            }
            
            # ========================================
            # 5.2. CREAR O BUSCAR CONTACTO
            # ========================================
            contact_id = get_or_create_contact(contact_data, headers, log_step)
            
            if contact_id:
                if "creando contacto" in log_step.__self__.__dict__.get("_last_log", ""):  # type: ignore
                    stats["contactos_creados"] += 1
                else:
                    stats["contactos_encontrados"] += 1
            
            # ========================================
            # 5.3. PREPARAR ITEMS DE LA FACTURA
            # ========================================
            items = []
            total_factura = 0.0
            
            for _, row in grupo.iterrows():
                # Obtener precio
                precio = 0.0
                for k in ["Precio unidad", "Importe", "Precio"]:
                    if k in row and pd.notna(row[k]):
                        try:
                            val_str = str(row[k]).replace('.', '').replace(',', '.')
                            val_str = ''.join(c for c in val_str if c.isdigit() or c == '.')
                            if val_str:
                                precio = float(val_str)
                                break
                        except:
                            pass
                
                # Obtener terapeuta
                terapeuta = str(row.get(col_terapeuta, "")).strip() if col_terapeuta else ""
                
                # Obtener fecha de sesión
                fecha_sesion = str(row.get("Fecha", ""))[:10]
                
                # Crear item
                descripcion = f"{fecha_sesion} – Sesión con {terapeuta}".strip(" – ")
                
                items.append({
                    "name": "Sesión de psicoterapia",
                    "description": descripcion,
                    "price": precio,
                    "quantity": int(row.get("Unidades", 1)) or 1,
                    "tax": 0,  # IVA 0% para servicios de salud
                })
                
                total_factura += precio
            
            # ========================================
            # 5.4. CREAR FACTURA EN HOLDED
            # ========================================
            invoice_payload = {
                "date": fecha_dt.strftime("%Y-%m-%d"),
                "dueDate": fecha_dt.strftime("%Y-%m-%d"),
                "contactName": paciente_nombre,
                "concept": "Servicios de Psicoterapia",
                "description": f"Sesiones de psicoterapia - {mes} ({empresa_nombre})",
                "items": items,
                "type": "invoice",
                "currency": "EUR",
                "tags": [f"#{proyecto.lower().replace(' ', '-')}"],
                "paymentMethod": "Transferencia",
            }
            
            # Agregar contactId si existe
            if contact_id:
                invoice_payload["contactId"] = contact_id
            
            # Enviar factura
            r = requests.post(HOLDED_API_BASE, json=invoice_payload, headers=headers, timeout=15)
            
            if r.status_code in [200, 201]:
                log_step(f"   ✅ Factura creada: {len(items)} sesiones, total {total_factura:.2f}€")
                stats["facturas_creadas"] += 1
            else:
                error_detail = r.text[:200] if len(r.text) > 0 else "Sin detalles"
                log_step(f"   ⚠️ Error {r.status_code}: {error_detail}")
                stats["facturas_error"] += 1
            
            log_step("")  # Línea en blanco para separar
            
        except Exception as e:
            log_step(f"   ❌ Error procesando {paciente}: {e}")
            stats["facturas_error"] += 1
            log_step("")
    
    # ============================================================
    # 6. LIMPIEZA Y ESTADÍSTICAS FINALES
    # ============================================================
    merged_df.drop(columns=["__mes__"], errors="ignore", inplace=True)
    
    log_step("═" * 50)
    log_step(f"📊 RESUMEN DE ENVÍO A HOLDED ({empresa_nombre})")
    log_step("═" * 50)
    log_step(f"✅ Facturas creadas: {stats['facturas_creadas']}")
    log_step(f"❌ Facturas con error: {stats['facturas_error']}")
    log_step(f"➕ Contactos nuevos creados: {stats['contactos_creados']}")
    log_step(f"📋 Contactos existentes: {stats['contactos_encontrados']}")
    log_step(f"💾 CSV de respaldo: {filename}")
    log_step("═" * 50)
    
    if stats["facturas_error"] > 0:
        log_step("⚠️ Algunas facturas tuvieron errores. Revisa el CSV de respaldo.")
    
    return filename
