# Stage 1: Build Dependencies (Builder Stage)
ARG PYTHON_VERSION=3.12-slim
# We use Slim which is a debian based distribution (OS). Slim is a small version of Debian 
# with unnecessary packages removed (which is best for Python's Django/Flask) 

FROM python:${PYTHON_VERSION} AS builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System dependencies needed to build psycopg2 and other C-extension packages
# In order to do that we need to compile psycopg2 and we are using build-essential compiler
# With libpq-dev development tool to do so
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Build wheels instead of installing directly 
# We store the compiled files in /wheels dir with .whl (wheel) extensin
# So that pip can directly install these wheel files 
RUN pip install --upgrade pip && \
    pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt







# Stage 2: Runtime 
FROM python:${PYTHON_VERSION}

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=backend.settings

WORKDIR /app

# libpq5 is the runtime tool which is needed to successfully execute the DB connection
# build-essential and libpq-dev are only needed for compiling. They are not required here
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /wheels /wheels

COPY requirements.txt .

RUN pip install --no-cache-dir --no-index --find-links=/wheels -r requirements.txt \
    && rm -rf /wheels

COPY . .

# Collect all the static files at build time (Images, Fonts, CSS, JS, etc)
RUN python manage.py collectstatic --noinput --ignore=input.css

EXPOSE 8000

# Were use Daphne ASGI-server instead of runserver because our application has websocket connections 
# and ASGI can efficiently handle websocket connections and HTTP requests 
# 0.0.0.0 -> So that daphne can listen on all network interfaces, 127.0.0.1 -> it only accept
# connections from inside the container  
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "backend.asgi:application"]
