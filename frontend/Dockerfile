ARG NODE_VERSION=24-alpine

FROM node:${NODE_VERSION}

WORKDIR /app

# Copy only package files first — leverages Docker layer caching.
# npm install only reruns when package*.json actually changes, not on every source edit.
COPY package*.json ./

RUN npm install

# Source gets bind-mounted at runtime (via docker-compose), so this COPY
# is mainly a fallback for standalone `docker run` without a volume mount.
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]