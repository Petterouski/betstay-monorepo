# apps/web-client/Dockerfile
FROM node:20-alpine AS base

# 1. Instalar dependencias de sistema para Alpine (Necesario para Next.js/SWC)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# --- ETAPA DE DEPENDENCIAS ---
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# --- ETAPA DE CONSTRUCCIÓN ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Argumento de construcción: Necesario para que Next.js "queme" la URL del back en el código
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Compilamos usando Nx (Genera la carpeta dist/apps/web-client/.next/standalone)
RUN npx nx run web-client:build:production

# --- ETAPA FINAL (RUNNER) ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Crear usuario para seguridad (Igual que las buenas prácticas)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar solo lo necesario del modo Standalone de Next.js
# A) Archivos públicos (imágenes, favicon)
COPY --from=builder /app/apps/web-client/public ./public
# B) El servidor standalone (Código optimizado)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-client/.next/standalone ./
# C) Archivos estáticos generados (CSS/JS)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web-client/.next/static ./apps/web-client/.next/static

USER nextjs

EXPOSE 3000

# COMANDO MAESTRO DE ARRANQUE
# Next.js standalone genera un server.js dentro de la carpeta del proyecto
CMD ["node", "apps/web-client/server.js"]