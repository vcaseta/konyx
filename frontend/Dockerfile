# ---------- Stage 1: Builder ----------
FROM node:20-alpine AS builder

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar todo el proyecto
COPY . .

# Build de Next.js
RUN npm run build

# ---------- Stage 2: Runtime ----------
FROM node:20-alpine AS runtime

# Crear directorio de trabajo
WORKDIR /app

# Copiar los archivos necesarios del build
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Exponer puerto de Next.js
EXPOSE 3000

# Comando para arrancar Next.js en modo producción
CMD ["npx", "next", "start", "-p", "3000"]

