# ---------- Stage 1: build dependencies ----------
ARG PYTHON_VERSION=3.12-slim

FROM python:${PYTHON_VERSION} AS builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System deps needed to build psycopg2 and other C-extension packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Build wheels instead of installing directly — keeps stage 2 lean
RUN pip install --upgrade pip && \
    pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt



# ---------- Stage 2: runtime ----------
FROM python:${PYTHON_VERSION}

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=backend.settings

WORKDIR /app

# libpq5 is the runtime lib psycopg2 needs (build-essential/libpq-dev were only needed to compile it)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /wheels /wheels

COPY requirements.txt .

RUN pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt \
    && rm -rf /wheels

COPY . .

# Collect static files at build time (safe default; STATICFILES_DIRS already set)
RUN python manage.py collectstatic --noinput

EXPOSE 8000

# Daphne serves the ASGI app — matches ASGI_APPLICATION = 'backend.asgi.application'
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "backend.asgi:application"]