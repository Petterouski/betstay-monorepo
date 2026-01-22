# apps/api-gateway/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos solo dependencias
RUN npm install

# Copiamos todo el código fuente
COPY . .

# Construimos la app (Nx usa webpack por debajo)
RUN npx nx build api-gateway

# Exponemos el puerto
EXPOSE 3000

# Comando de inicio
CMD ["node", "dist/apps/api-gateway/main.js"]