# ---------- Etapa 1: build ----------
FROM node:20 AS builder
WORKDIR /app

# Config npm para entornos de build (más resiliente)
RUN npm config set fund false \
 && npm config set audit false \
 && npm config set progress false \
 && npm config set legacy-peer-deps true \
 && npm config set prefer-online true \
 && npm config set fetch-retries 5 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set registry https://registry.npmjs.org/

# Copiamos manifiestos primero
COPY package.json package-lock.json* ./

# Instala deps con reintentos y fallback de registry alternativo si falla
RUN (npm ci || npm install) \
 || (npm install --registry=https://registry.npmmirror.com/) \
 || (npm cache clean --force && npm install)

# Copiamos el resto del código
COPY . .

# Build Next
RUN npm run build

# ---------- Etapa 2: runtime ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

RUN npm config set fund false \
 && npm config set audit false \
 && npm config set legacy-peer-deps true \
 && npm config set registry https://registry.npmjs.org/ \
 && (npm install --omit=dev || npm install --omit=dev --registry=https://registry.npmmirror.com/)

EXPOSE 3000
CMD ["npm", "start", "-p", "3000"]
