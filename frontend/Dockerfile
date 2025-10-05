# ---------- Stage 1: Builder ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos solo package.json y package-lock.json para cachear deps
COPY package*.json ./

# Instalamos todas las dependencias (dev + prod)
RUN npm install

# Copiamos el resto del proyecto
COPY . .

# Set environment variables for build
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_COMPANIES
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_COMPANIES=$NEXT_PUBLIC_COMPANIES
ENV NODE_ENV=production

# Build de Next.js
RUN npm run build

# ---------- Stage 2: Runtime ----------
FROM node:20-alpine AS runtime

WORKDIR /app

# Solo instalamos deps de producción
COPY package*.json ./
RUN npm install --omit=dev

# Copiamos build y public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

# Exponemos puerto de Next.js
EXPOSE 3000

# Comando de inicio en producción
CMD ["npm", "start"]

