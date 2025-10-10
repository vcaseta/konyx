from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, export, validate, convert

# -------------------------------------------------
# 🚀 APP CONFIG
# -------------------------------------------------
app = FastAPI(
    title="Konyx Backend",
    version="2.0.0",
    description="Backend modular para gestión de exportaciones y APIs de Konyx"
)

# -------------------------------------------------
# 🌍 CORS CONFIG
# -------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción puedes limitar a ["http://192.168.1.50:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# 🧩 ROUTERS
# -------------------------------------------------
app.include_router(auth.router)
app.include_router(export.router)
app.include_router(validate.router)
app.include_router(convert.router)

# -------------------------------------------------
# 🏠 ROOT ENDPOINT
# -------------------------------------------------
@app.get("/")
def root():
    return {
        "message": "Bienvenido al backend de Konyx ✅",
        "version": "2.0.0",
        "routers": ["/auth", "/export", "/validate", "/convert"],
    }

# -------------------------------------------------
# ⚙️ HEALTH CHECK
# -------------------------------------------------
@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Servidor Konyx activo"}
