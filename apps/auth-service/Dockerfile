FROM node:20-alpine

# --- EL FIX: Instalamos OpenSSL manualmente ---
RUN apk add --no-cache openssl
# ----------------------------------------------

WORKDIR /app

# Copiamos los archivos de definición de dependencias del RAÍZ
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos todo el monorepo (necesario para que Nx vea el workspace)
COPY . .

# --- NUEVO: Generamos el cliente de Prisma para este servicio ---
RUN npx prisma generate --schema=./apps/auth-service/prisma/schema.prisma
# ---------------------------------------------------------------

# Exponemos el puerto que definimos en main.ts
EXPOSE 3001

# Comando de arranque usando Nx para desarrollo
# --host=0.0.0.0 es VITAL para que Docker pueda mapear el puerto
CMD ["npx", "nx", "serve", "auth-service", "--host=0.0.0.0"]