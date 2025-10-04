# ---------- Dependencias ----------
FROM node:20-alpine AS deps
WORKDIR /app

# Copiamos package.json y package-lock.json
COPY package.json package-lock.json* ./

# Instalamos dependencias
RUN npm ci --legacy-peer-deps

# ---------- Build ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Copiamos node_modules
COPY --from=deps /app/node_modules ./node_modules

# Copiamos código
COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build standalone
RUN npm run build

# ---------- Runtime ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copiamos artefactos
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
