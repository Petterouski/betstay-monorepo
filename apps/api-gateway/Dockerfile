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

# Etapa 1: Build
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

# Etapa 2: Runner
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

# --- LA CORRECCIÓN MAESTRA ---
# Copiamos desde la ruta que descubrimos en el log
COPY --from=builder /app/apps/api-gateway/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]