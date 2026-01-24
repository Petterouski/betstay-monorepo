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
FROM node:18-alpine AS builder
WORKDIR /app
# Copiamos configs de dependencias
COPY package*.json ./
# Instalar dependencias (incluyendo devDependencies para poder compilar Nest)
RUN npm install
# Copiamos todo el código
COPY . .
# Construimos (Asumiendo que es un monorepo Nx, ajusta el comando si es necesario)
# Si es Nx puro:
RUN npx nx build api-gateway --configuration=production

# Etapa 2: Runner (Imagen ligera)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Solo dependencias de producción
RUN npm install --only=production
# Copiamos el build desde la etapa anterior
# OJO: La ruta del build en Nx suele ser dist/apps/api-gateway
COPY --from=builder /app/dist/apps/api-gateway ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]