# apps/betting-engine/Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Instalamos Poetry y dependencias del sistema
RUN pip install poetry uvicorn fastapi

# Copiamos archivos de configuración de Poetry
COPY apps/betting-engine/pyproject.toml apps/betting-engine/poetry.lock* ./

# --- CORRECCIÓN AQUÍ ---
# Agregamos --no-root para que no busque el README ni instale el proyecto todavía
RUN poetry config virtualenvs.create false \
    && poetry install --no-interaction --no-ansi --no-root

# Copiamos el código fuente
COPY apps/betting-engine/ ./apps/betting-engine

# Ajustamos el PYTHONPATH para que encuentre el módulo
ENV PYTHONPATH=/app/apps/betting-engine

EXPOSE 3006

CMD ["uvicorn", "betting_engine.main:app", "--host", "0.0.0.0", "--port", "3006"]