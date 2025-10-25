from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import APIRouter
from app.routers import auth, export, validate, convert
import os

# ============================================================
# 🚀 CONFIGURACIÓN INICIAL
# ============================================================

VERSION = "3.1.0"
ALLOWED_ORIGINS = [
    "https://konyx.duckdns.org",     # ✅ Frontend oficial
    "https://api.konyx.duckdns.org", # ✅ Subdominio API
    "http://localhost:3000",         # (opcional para desarrollo local)
]

app = FastAPI(
    title="Konyx Backend",
    version=VERSION,
    description="Backend modular de Konyx con Groq AI y exportación avanzada",
    docs_url=None,        # ❌ Desactiva /docs (Swagger UI)
    redoc_url=None,       # ❌ Desactiva /redoc (ReDoc)
    openapi_url=None,     # ❌ Desactiva /openapi.json
)

# 🌍 CORS — restringido al dominio del frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# 🧩 MONTAJE DE ROUTERS BAJO /api
# ============================================================

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router)
api_router.include_router(export.router)
api_router.include_router(validate.router)
api_router.include_router(convert.router)

app.include_router(api_router)

# ============================================================
# 🩺 ENDPOINTS BÁSICOS
# ============================================================

@app.get("/")
def root():
    """Muestra información básica del backend (segura)."""
    return {
        "message": "✅ Backend Konyx activo",
        "version": VERSION,
        "base_path": "/api",
        "routers": ["/auth", "/export", "/validate", "/convert"],
    }


@app.get("/health")
def health():
    """Usado por el frontend y sistemas de monitoreo."""
    return {"status": "ok", "message": "Servidor operativo"}


# ============================================================
# 🏁 LOG DE INICIO
# ============================================================

@app.on_event("startup")
async def startup_event():
    print("\n" + "=" * 70)
    print("🟢 INICIANDO BACKEND KONYX")
    print(f"📦 Versión: {VERSION}")
    print(f"📂 Ruta base: {os.getcwd()}")
    print("🔗 Rutas disponibles bajo /api/:")
    print("   - /auth")
    print("   - /export")
    print("   - /validate")
    print("   - /convert")
    print("🌍 CORS permitido para:")
    for origin in ALLOWED_ORIGINS:
        print(f"   → {origin}")
    print("🔒 /docs, /redoc y /openapi.json desactivados")
    print("=" * 70 + "\n")

