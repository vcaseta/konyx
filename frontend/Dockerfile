# ---------- Etapa 1: build ----------
FROM node:20 AS builder
WORKDIR /app

# Mejora resiliencia de npm en contenedores
RUN npm config set fund false \
 && npm config set audit false \
 && npm config set progress false \
 && npm config set prefer-online true \
 && npm config set fetch-retries 5 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set legacy-peer-deps true \
 && npm config set registry https://registry.npmjs.org/

# Copia manifiestos primero para cachear mejor
COPY package.json package-lock.json* ./

# Si hay lockfile usa npm ci, si no, usa npm install
# (no falla si no existe package-lock.json)
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copia el resto del código
COPY . .

# Genera el build de Next
RUN npm run build

# ---------- Etapa 2: runtime ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copiamos artefactos y package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Instala solo deps de producción (sin dev)
RUN npm config set fund false \
 && npm config set audit false \
 && npm config set legacy-peer-deps true \
 && npm config set registry https://registry.npmjs.org/ \
 && npm install --omit=dev

EXPOSE 3000
CMD ["npm", "start", "-p", "3000"]
