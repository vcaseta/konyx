# --------------------------------------------------------
# 🐍 BASE: Python 3.11 slim
# --------------------------------------------------------
FROM python:3.11-slim

ENV DEBIAN_FRONTEND=noninteractive

# --------------------------------------------------------
# 📦 DEPENDENCIAS DEL SISTEMA
# --------------------------------------------------------
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    libffi-dev \
    libssl-dev \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# --------------------------------------------------------
# 📂 DIRECTORIO DE TRABAJO
# --------------------------------------------------------
WORKDIR /app

# --------------------------------------------------------
# 📜 COPIAR PROYECTO
# --------------------------------------------------------
COPY . /app

# --------------------------------------------------------
# ⚙️ INSTALAR DEPENDENCIAS PYTHON
# --------------------------------------------------------
RUN pip install --upgrade pip \
 && pip install \
    fastapi \
    uvicorn \
    pandas \
    openpyxl \
    python-dotenv \
    requests \
    python-multipart

# --------------------------------------------------------
# 🌍 EXPONER PUERTO
# --------------------------------------------------------
EXPOSE 8000

# --------------------------------------------------------
# 🧠 VARIABLES DE ENTORNO
# --------------------------------------------------------
ENV PYTHONUNBUFFERED=1
ENV GROQ_API_KEY=""
ENV APP_ENV=production

# --------------------------------------------------------
# 🚀 COMANDO DE ARRANQUE
# --------------------------------------------------------
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]


