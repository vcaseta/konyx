from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, export, validate, convert
import os

# ============================================================
# 🚀 CONFIGURACIÓN INICIAL
# ============================================================

app = FastAPI(
    title="Konyx Backend",
    version="3.1.0",
    description="Backend modular de Konyx con Groq AI y exportación avanzada",
)

# 🌍 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # o especificar tu dominio si quieres más seguridad
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# 🧩 MONTAJE DE ROUTERS BAJO /api
# ============================================================

from fastapi import APIRouter
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
    return {
        "message": "✅ Backend Konyx activo",
        "version": "3.1.0",
        "base_path": "/api",
        "routers": ["/auth", "/export", "/validate", "/convert"],
    }

@app.get("/health")
def health():
    return {"status": "ok", "message": "Servidor operativo"}

# ============================================================
# 🏁 LOG DE INICIO
# ============================================================

@app.on_event("startup")
async def startup_event():
    print("\n" + "=" * 70)
    print("🟢 INICIANDO BACKEND KONYX")
    print(f"📦 Versión: 3.1.0")
    print(f"📂 Ruta base: {os.getcwd()}")
    print("🔗 Rutas disponibles bajo /api/:")
    print("   - /auth")
    print("   - /export")
    print("   - /validate")
    print("   - /convert")
    print("🌍 CORS: habilitado para todos los orígenes (*)")
    print("=" * 70 + "\n")
