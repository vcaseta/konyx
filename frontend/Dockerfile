# ---------- Stage 1: Builder ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Stage 2: Runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
RUN npm ci --omit=dev

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]

