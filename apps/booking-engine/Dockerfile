# apps/booking-engine/Dockerfile
FROM golang:1.25-alpine AS builder

WORKDIR /app

# 1. Copiamos el go.mod a su lugar correcto
COPY apps/booking-engine/go.mod ./apps/booking-engine/

# 2. TRUCO: Cambiamos el directorio de trabajo a la carpeta del servicio
WORKDIR /app/apps/booking-engine

# 3. Ahora sí, descargamos dependencias (porque ya estamos en la carpeta correcta)
RUN go mod download

# 4. Regresamos a la raíz para copiar todo el código
WORKDIR /app
COPY . .

# 5. Volvemos a entrar para compilar
WORKDIR /app/apps/booking-engine
RUN go build -o booking-service .

# --- Etapa Final (Imagen ligera) ---
FROM alpine:latest
WORKDIR /root/
# Copiamos el binario compilado desde la ruta correcta
COPY --from=builder /app/apps/booking-engine/booking-service .

EXPOSE 3003

CMD ["./booking-service"]