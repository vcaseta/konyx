# ---------- Dependencias ----------
FROM node:20-alpine AS deps
WORKDIR /app

# Instala deps con lock si existe
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# ---------- Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Copia node_modules del stage anterior
COPY --from=deps /app/node_modules ./node_modules
# Copia el código
COPY . .

# Variables PÚBLICAS de Next en build (opcional, se pueden pasar como --build-arg)
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_COMPANIES

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build standalone (asegúrate de tener output: "standalone" en next.config.js)
RUN npm run build

# ---------- Runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Next 14 standalone escucha en server.js
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copiamos artefactos standalone + estáticos + public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
# server.js queda en la raíz tras copiar .next/standalone
CMD ["node", "server.js"]
