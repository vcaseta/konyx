# Konyx App – Despliegue con Docker y GitHub Actions

Este proyecto contiene el **frontend (Next.js)** y el **backend (FastAPI)** de la aplicación Konyx, desplegados mediante Docker y automatizados con GitHub Actions.

---

## 🐳 Despliegue local con Docker

### 1. Clona el repositorio

```bash
git clone https://github.com/tuusuario/konyx.git
cd konyx
```

### 2. Crea un archivo `.env`

Copia el siguiente contenido en un archivo `.env` en la raíz del proyecto:

```env
TZ=Europe/Madrid

# Login inicial (solo para demo)
APP_USER=admin
APP_PASS=admin

NEXT_PUBLIC_BACKEND_URL=http://192.168.1.51:8000
NEXT_PUBLIC_APP_NAME=Konyx
NEXT_PUBLIC_COMPANIES=[{"id":"001","name":"Kissoro"},{"id":"002","name":"En Plural Psicologia"}]
```

> ⚠️ Asegúrate de que la red `lan-local` existe y que estás fuera de CGNAT si usas IPs fijas.

### 3. Levanta los contenedores

```bash
docker compose up -d
```

Esto desplegará:

- `konyx-backend` en `192.168.1.51:8000`
- `konyx-frontend` en `192.168.1.50:3000`

---

## 🚀 CI/CD con GitHub Actions

Este proyecto incluye un workflow que:

- Construye imágenes Docker para backend y frontend.
- Publica las imágenes en `ghcr.io`.

### Flujo automático

1. Cada push en la rama `main` dispara el workflow `build.yml`.
2. Se generan las imágenes y se suben a:

```
ghcr.io/vcaseta/konyx-backend:latest
ghcr.io/vcaseta/konyx-frontend:latest
```

> Accede a GitHub > Settings > Packages para ver las imágenes.

---

## 🧩 Estructura

```
konyx/
├── backend/              # FastAPI
├── frontend/             # Next.js + Tailwind
├── docker-compose.yml
├── .env                  # Configuración unificada (NO subir al repo)
└── .github/workflows/
    └── build.yml         # Workflow de CI/CD
```

---

## 🔐 Seguridad

- Usa variables de entorno para evitar credenciales hardcodeadas.
- No subas `.env` al repositorio.
- Usa secretos en GitHub Actions si necesitas credenciales externas.

---

## 🧪 Testing manual

1. Accede a `http://192.168.1.50:3000`
2. Inicia sesión con:
   - Usuario: `admin`
   - Contraseña: `admin`
3. Verifica navegación, carga de datos, exportación, etc.

---

## 📬 Soporte

Para errores o sugerencias, abre un issue o contacta al desarrollador.

---

© 2025 Konyx App