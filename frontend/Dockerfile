# Etapa 1: build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos package.json y package-lock.json para instalar dependencias
COPY package*.json ./

RUN npm install

# Copiamos todo el código
COPY . .

# Build de Next.js
RUN npm run build

# Etapa 2: producción
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copiamos solo los archivos necesarios desde builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
