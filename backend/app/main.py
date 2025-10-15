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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🧩 Routers
app.include_router(auth.router)
app.include_router(export.router)
app.include_router(validate.router)
app.include_router(convert.router)

# ============================================================
# 🩺 ENDPOINTS BÁSICOS
# ============================================================

@app.get("/")
def root():
    return {
        "message": "✅ Backend Konyx activo",
        "version": "3.1.0",
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
    print("🔗 Rutas disponibles:")
    print("   - /auth")
    print("   - /export")
    print("   - /validate")
    print("   - /convert")
    print("🌍 CORS: habilitado para todos los orígenes (*)")
    print("=" * 70 + "\n")

