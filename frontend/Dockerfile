# ---------- Stage 1: Dependencias ----------
FROM node:20-alpine AS deps
WORKDIR /app

# Copiar package.json y package-lock.json si existe
COPY package.json package-lock.json* ./

# Instalamos todas las dependencias (usando npm)
RUN npm install --legacy-peer-deps

# ---------- Stage 2: Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Copiamos node_modules desde deps
COPY --from=deps /app/node_modules ./node_modules

# Copiamos todo el código fuente
COPY . .

# Variables de entorno opcionales durante el build
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_COMPANIES
ENV NODE_ENV=development  
ENV NEXT_TELEMETRY_DISABLED=1 

# Construcción de Next.js
RUN npm run build

# ---------- Stage 3: Runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app

# Configuramos las variables de entorno
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copiamos la build de Next.js (modo standalone)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Exponemos el puerto de la aplicación
EXPOSE 3000

# Ejecutamos la aplicación de Next.js en modo producción
CMD ["node", "server.js"]

