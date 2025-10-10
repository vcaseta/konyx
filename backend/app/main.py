from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importar routers
from app.routers import auth, export, validate, convert

app = FastAPI(title="Konyx Backend", version="1.0.0")

# 🌍 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Puedes restringirlo a tu IP local o dominio
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔗 Registrar routers
app.include_router(auth.router, prefix="/auth", tags=["Autenticación"])
app.include_router(export.router, prefix="/export", tags=["Exportaciones"])
app.include_router(validate.router, prefix="/validate", tags=["Validación"])
app.include_router(convert.router, prefix="/convert", tags=["Conversión"])

