# apps/api-gateway/Dockerfile
#FROM node:18-alpine

#WORKDIR /app

# Copiamos archivos de dependencias
#COPY package*.json ./

# Instalamos solo dependencias
#RUN npm install

# Copiamos todo el código fuente
#COPY . .

# Construimos la app (Nx usa webpack por debajo)
#RUN npx nx build api-gateway

# Exponemos el puerto
#EXPOSE 3000

# Comando de inicio
#CMD ["node", "dist/apps/api-gateway/main.js"]


#-----------------------------------------------------------------------------

# apps/api-gateway/Dockerfile

# 1. CAMBIO IMPORTANTE: Usamos Node 20 para evitar errores de compatibilidad
FROM node:20-alpine AS builder

WORKDIR /app

# Copiamos configs
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos todo el código
COPY . .

# Construimos la app
RUN npx nx build api-gateway --configuration=production

# --- SECCIÓN DE DEBUG (SHERLOCK HOLMES MEJORADO) ---
# 1. Listamos la carpeta raíz para ver si se creó 'dist' u otra cosa
# 2. Usamos 'find' para localizar el main.js donde sea que esté escondido
RUN echo "============== ESPIANDO EL SISTEMA DE ARCHIVOS ==============" && \
    ls -la && \
    echo "--- Buscando main.js en todo el disco ---" && \
    find . -name "main.js" -not -path "*/node_modules/*" && \
    echo "============================================================"

# Etapa 2: Runner
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

# --- INTENTO DE COPY ---
# Mantenemos esta ruta estándar. Si falla, el log de arriba nos dirá la ruta real.
COPY --from=builder /app/dist/apps/api-gateway ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]