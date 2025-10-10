# ⚙️ Konyx — Plataforma de Exportación y Gestión

Konyx es una herramienta desarrollada en **Next.js + FastAPI** para automatizar procesos de importación, exportación y gestión de datos administrativos.

Permite a los usuarios:
- Seleccionar formato de importación y exportación.
- Configurar empresa, proyecto, fecha y cuenta contable.
- Registrar exportaciones de forma segura.
- Gestionar contraseñas y APIs de conexión.
- Consultar estadísticas de exportación.
- Ver información de versión y autor desde el panel **About**.

---

## 🏗️ Arquitectura

```
📦 konyx/
├── app/
│   ├── dashboard/
│   │   └── page.tsx          # Panel principal (Next.js)
│   ├── context/
│   │   └── authContext.tsx   # Contexto de autenticación
│   └── page.tsx              # Página de inicio / login
├── components/
│   ├── PanelOption.tsx
│   ├── PanelFile.tsx
│   ├── PanelDate.tsx
│   ├── PanelConfig.tsx
│   ├── PanelDebug.tsx
│   ├── PanelExport.tsx
│   ├── PanelCerrar.tsx
│   ├── PanelAbout.tsx        # Panel “Acerca de Konyx”
│   └── Item.tsx
├── public/
│   ├── fondo.png
│   ├── logo.png
│   ├── logo-victor.jpg
│   └── favicon.ico
├── backend/
│   ├── main.py               # API FastAPI principal
│   └── data.json             # Datos persistentes (password, APIs, exportaciones)
└── README.md
```

---

## 🚀 Requisitos

- Node.js ≥ 18  
- Python ≥ 3.10  
- FastAPI  
- uvicorn  
- Next.js 14  

---

## ⚙️ Instalación y despliegue local

### 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/tuusuario/konyx.git
cd konyx
```

### 2️⃣ Instalar dependencias del frontend

```bash
npm install
```

### 3️⃣ Instalar dependencias del backend

```bash
cd backend
pip install fastapi uvicorn
```

*(opcional)*  
Si se usa `requirements.txt`, ejecuta:
```bash
pip install -r requirements.txt
```

---

## 🧠 Ejecución en desarrollo

### Iniciar el backend
Desde la carpeta `backend`:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Esto creará (si no existe) un archivo `data.json` con datos por defecto:

```json
{
  "password": "admin123",
  "apiKissoro": "",
  "apiEnPlural": "",
  "ultimoExport": "-",
  "totalExportaciones": 0
}
```

### Iniciar el frontend
En otra terminal, desde la raíz del proyecto:

```bash
npm run dev
```

Abre tu navegador en  
👉 http://localhost:3000

---

## 🧱 Estructura de datos persistentes (`data.json`)

```json
{
  "password": "admin123",
  "apiKissoro": "API_KISSORO_TOKEN",
  "apiEnPlural": "API_ENPLURAL_TOKEN",
  "ultimoExport": "09/10/2025",
  "totalExportaciones": 24
}
```

Estos valores se actualizan automáticamente desde el panel de configuración o cuando se realiza una nueva exportación.

---

## 🌐 Variables de entorno

Crea un archivo `.env.local` en la raíz del frontend:

```
NEXT_PUBLIC_BACKEND_URL=http://192.168.1.51:8000
```

> ⚠️ Asegúrate de que la IP o dominio coincida con la máquina donde se ejecuta FastAPI.

---

## 🧩 Compilación para producción

```bash
npm run build
npm run start
```

Esto genera una build optimizada en `.next/`.

Para desplegar en un servidor, asegúrate de que:
- El backend FastAPI esté corriendo en el puerto 8000.
- El frontend sirva desde el mismo dominio o con CORS permitido.

---

## 🧰 Mantenimiento

- **Cambiar versión / fecha:**  
  Edita el texto dentro de `components/PanelAbout.tsx`.
- **Resetear datos persistentes:**  
  Borra o edita `backend/data.json`.
- **Actualizar APIs o contraseña:**  
  Desde el panel “Configuración” en el dashboard.

---

## ✨ Autor

**Víctor Mut Vallvey**  
📧 [vcaseta75@gmail.com](mailto:vcaseta75@gmail.com)

© 2025 Konyx — Todos los derechos reservados.

---

## 🧩 Notas adicionales

- Backend y frontend pueden ejecutarse en servidores distintos, siempre que `NEXT_PUBLIC_BACKEND_URL` apunte al backend correcto.  
- Los datos del backend son persistentes entre sesiones.  
- No requiere base de datos: toda la información se almacena en `data.json`.

---

## 🧠 Próximas mejoras

- Animaciones suaves en paneles.  
- Exportación de logs de exportaciones.  
- Soporte multiusuario y roles.  
- Configuración avanzada de rutas API.
