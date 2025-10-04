# ---------- Stage 1: Dependencias ----------
FROM node:20-alpine AS deps
WORKDIR /app

# Copiar el package.json y package-lock.json para instalar dependencias
COPY package.json package-lock.json* ./

# Instalar las dependencias de la aplicación, sin problemas de dependencias incompatibles
RUN npm install --legacy-peer-deps

# ---------- Stage 2: Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar node_modules desde deps
COPY --from=deps /app/node_modules ./node_modules

# Copiar todo el código fuente del proyecto
COPY . .

# Variables de entorno opcionales durante la construcción
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_COMPANIES
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Construcción de la aplicación Next.js en modo standalone
RUN npm run build

# ---------- Stage 3: Runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app

# Variables de entorno para producción
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copiar la build generada y archivos públicos
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Exponer el puerto
EXPOSE 3000

# Ejecutar la aplicación Next.js en modo standalone
CMD ["node", "server.js"]  # Asegúrate de que el archivo server.js existe

