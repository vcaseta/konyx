# ---------- Build ----------
FROM node:20 AS builder
WORKDIR /app

# Instalar deps con lock si existe
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copiar código y compilar
COPY . .
RUN npm run build

# ---------- Runtime ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copiamos artefactos ya compilados
COPY --from=builder /app ./

EXPOSE 3000
CMD ["npm","run","start"]
