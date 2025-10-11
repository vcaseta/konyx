from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, export, validate, convert

app = FastAPI(
    title="Konyx Backend",
    version="3.0.0",
    description="Backend modular de Konyx con Groq AI y exportación avanzada"
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

@app.get("/")
def root():
    return {
        "message": "✅ Backend Konyx activo",
        "version": "3.0.0",
        "routers": ["/auth", "/export", "/validate", "/convert"]
    }

@app.get("/health")
def health():
    return {"status": "ok", "message": "Servidor operativo"}

