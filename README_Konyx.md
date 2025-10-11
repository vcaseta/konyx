# 🧠 Konyx Export Manager
Gestor inteligente de exportaciones con integración de **Groq AI** y soporte multiempresa (Kissoro / En Plural Psicología).

---

## 🚀 Descripción general

**Konyx Export Manager** es una herramienta web que permite:
- Subir dos archivos Excel:  
  - **Sesiones** (facturación o servicios)  
  - **Contactos** (clientes)
- Validar y unificar los datos.
- Corregir errores automáticamente con **Groq AI**.
- Exportar un Excel final con dos hojas:
  - **Datos Exportados**
  - **Cambios IA** (registro de correcciones aplicadas)
- Integración con APIs de terceros (Holded, Gestoría, Kissoro, En Plural).
- Panel de progreso y control en tiempo real.

---

## 🏗️ Arquitectura

- **Frontend:** Next.js + React + TailwindCSS  
- **Backend:** FastAPI + Pandas + Groq API  
- **Base de datos:** persistencia en `data.json`  
- **Contenedorizado:** Docker (listo para producción)

---

## ⚙️ Requisitos previos

- Node.js >= 18  
- Python >= 3.11  
- Docker (opcional, recomendado para despliegue)
- Cuenta en [Groq](https://groq.com/) (si quieres usar su API IA)

---

## 🧩 Instalación y despliegue

### 🐍 Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

O con Docker:

```bash
docker build -t konyx-backend .
docker run -d -p 8000:8000 konyx-backend
```

Verifica en: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 🧭 Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

`.env.local`:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

Producción:
```bash
npm run build
npm start
```

---

## 🧾 Endpoints principales (Backend)

| Método | Ruta | Descripción |
|--------|------|--------------|
| `POST` | `/auth/login` | Inicia sesión |
| `GET` | `/auth/status` | Devuelve configuración y métricas |
| `POST` | `/auth/update_password` | Cambia la contraseña |
| `POST` | `/auth/update_apis` | Actualiza claves API |
| `POST` | `/validate/excel` | Valida el formato del Excel |
| `POST` | `/convert/procesar` | Detecta tipo de importación |
| `POST` | `/export/start` | Ejecuta la exportación |
| `GET` | `/export/progress` | Stream SSE con pasos del proceso |
| `GET` | `/export/download/{filename}` | Descarga el Excel generado |

---

## 📁 Salida del archivo

Los archivos exportados se guardan en:
```
backend/app/exports/export_YYYYMMDD_HHMMSS.xlsx
```

**Hoja 1:** Datos exportados  
**Hoja 2:** Cambios IA aplicados

---

## 🧑‍💻 Autor

**Víctor Mut Vallvey**  
📧 [vcaseta75@gmail.com](mailto:vcaseta75@gmail.com)  
📅 Octubre 2025  
🧾 Versión 3.0.0

---

© 2025 Víctor Mut Vallvey — Todos los derechos reservados.
