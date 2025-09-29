FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# 1) Actualiza pip/setuptools/wheel para mejores binarios
RUN python -m pip install --no-cache-dir --upgrade pip setuptools wheel

# 2) Instala deps de Python
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 3) Copia la app
COPY app/ ./app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
