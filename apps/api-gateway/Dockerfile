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
COPY package*.json ./
# Instalamos dependencias (incluyendo devDependencies para compilar)
RUN npm install
COPY . .
# Construimos
RUN npx nx build api-gateway --configuration=production

# --- SECCIÓN DE DEBUG (SHERLOCK HOLMES) ---
# Esto imprimirá en el log de GitHub qué carpetas se crearon realmente
RUN echo "============== CHISMEANDO LA CARPETA DIST ==============" && \
    ls -R /app/dist && \
    echo "========================================================"

# Etapa 2: Runner
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production

# --- INTENTO DE COPY (Si falla, miraremos el log de arriba) ---
# Dejo la ruta original, pero si falla, ya sabremos por qué gracias al 'ls' de arriba
COPY --from=builder /app/dist/apps/api-gateway ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]