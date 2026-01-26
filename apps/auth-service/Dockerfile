# apps/auth-service/Dockerfile
FROM node:20-alpine

# 1. Instalar OpenSSL (Necesario para Prisma en Alpine Linux)
RUN apk add --no-cache openssl

WORKDIR /app

# 2. Copias dependencias y las instalas
COPY package*.json ./
RUN npm install

# 3. Copias todo el código
COPY . .

# 4. Generas el Cliente de Prisma (CRÍTICO)
COPY apps/auth-service/prisma ./apps/auth-service/prisma
RUN npx prisma generate --schema=./apps/auth-service/prisma/schema.prisma

# 5. COMPILAMOS la aplicación (En lugar de nx serve)
# Esto crea la carpeta 'dist' optimizada
RUN npx nx build auth-service --configuration=production

# 6. Exponemos puerto
EXPOSE 3001

# 7. COMANDO MAESTRO DE ARRANQUE
# Explicación:
# A) "npx prisma migrate deploy": Crea las tablas en la BD remota si no existen.
# B) "node dist/...": Arranca la versión compilada y ligera (sin Nx overhead).
CMD sh -c "npx prisma migrate deploy --schema=./apps/auth-service/prisma/schema.prisma && node apps/auth-service/dist/main.js"