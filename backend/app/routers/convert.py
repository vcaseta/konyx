from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, export, validate, convert

# ---------------------------------------
# 🚀 Inicialización del backend Konyx
# ---------------------------------------
app = FastAPI(
    title="Konyx Backend",
    version="2.0.0",
    description="Backend modular de Konyx: autenticación, validación, conversión y exportación."
)

# ---------------------------------------
# 🌍 CORS
# ---------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Puedes restringir a ["http://192.168.1.50"] en producción
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------
# 🧩 Registro de routers
# ---------------------------------------
app.include_router(auth.router, prefix="/auth")
app.include_router(export.router, prefix="/export")
app.include_router(validate.router, prefix="/validate")
app.include_router(convert.router, prefix="/convert")

# ---------------------------------------
# 🏠 Ruta base
# ---------------------------------------
@app.get("/")
def root():
    return {
        "status": "ok",
        "message": "Backend Konyx en ejecución 🚀",
        "version": "2.0.0",
        "routes": ["/auth", "/export", "/validate", "/convert"]
    }
