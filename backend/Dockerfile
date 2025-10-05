# 1️⃣ Imagen base
FROM python:3.11-slim

# 2️⃣ Crear directorio de trabajo
WORKDIR /app

# 3️⃣ Copiar requirements
COPY requirements.txt .

# 4️⃣ Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# 5️⃣ Copiar la aplicación
COPY app/ ./app

# 6️⃣ Exponer puerto
EXPOSE 8000

# 7️⃣ Comando de arranque
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
