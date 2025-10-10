# Imagen base ligera
FROM python:3.11-slim

# Variables de entorno
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Crear directorio de trabajo
WORKDIR /app

# Copiar dependencias e instalarlas
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el contenido del backend
COPY . .

# Exponer el puerto de FastAPI
EXPOSE 8000

# Comando de inicio (uvicorn en modo producción)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
