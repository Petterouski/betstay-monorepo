FROM node:20-alpine

# --- EL FIX: Instalamos OpenSSL manualmente ---
RUN apk add --no-cache openssl
# ----------------------------------------------

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

# --- NUEVO: Generamos el cliente de Prisma para este servicio ---
RUN npx prisma generate --schema=./apps/hotel-core/prisma/schema.prisma
# ---------------------------------------------------------------

EXPOSE 3002

# Cambiamos a hotel-core
CMD ["npx", "nx", "serve", "hotel-core", "--host=0.0.0.0"]