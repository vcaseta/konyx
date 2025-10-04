# ---------- Stage 1: Dependencias ----------
FROM node:20-alpine AS deps
WORKDIR /app

# Copia package.json y package-lock.json si existe
COPY package.json package-lock.json* ./

# Instalamos todas las dependencias (sin requerir package-lock.json)
RUN npm install --legacy-peer-deps

# ---------- Stage 2: Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Copiamos node_modules desde deps
COPY --from=deps /app/node_modules ./node_modules

# Copiamos todo el código
COPY . .

# Variables de entorno opcionales durante build
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_COMPANIES
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Construcción de Next.js en modo standalone
RUN npm run build

# ---------- Stage 3: Runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app

# Variables de entorno necesarias para producción
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copiamos la build standalone y archivos públicos
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

# Ejecuta Next.js en modo standalone
CMD ["node", "server.js"]  # Si tienes un archivo server.js. Si no, usa `next start` en su lugar.
