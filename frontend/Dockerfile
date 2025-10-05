# ---------- Stage 1: Builder ----------
FROM node:20-alpine AS builder

# Variables de entorno para producción
ENV NODE_ENV=production
WORKDIR /app

# Copiamos solo los archivos de dependencias primero para cachear npm install
COPY package*.json ./
RUN npm ci

# Copiamos todo el proyecto
COPY . .

# Construimos la aplicación Next.js
RUN npm run build

# ---------- Stage 2: Runtime ----------
FROM node:20-alpine AS runtime

WORKDIR /app

# Copiamos dependencias y archivos necesarios del builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

# Instalamos solo dependencias de producción
RUN npm ci --omit=dev

# Puerto de la aplicación
EXPOSE 3000

# Comando para iniciar la app
CMD ["npm", "start"]
