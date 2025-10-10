# --------------------------------------------
# 🧱 Imagen base
# --------------------------------------------
FROM python:3.11-slim

# --------------------------------------------
# ⚙️ Configuración del entorno
# --------------------------------------------
WORKDIR /app

# Instalar dependencias del sistema (para pandas y Excel)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar dependencias
COPY requirements.txt .

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código de la aplicación
COPY app ./app

# Crear carpeta de datos persistentes
RUN mkdir -p app/data

# Puerto expuesto
EXPOSE 8000

# --------------------------------------------
# 🚀 Comando de ejecución
# --------------------------------------------
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
