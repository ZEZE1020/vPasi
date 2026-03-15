# ============================================================
# vPasi Frontend — Multi-stage Dockerfile
# ============================================================
# Stage "dev":  Node + Vite dev server (for docker-compose.override)
# Stage "prod": Nginx serving static build + API reverse proxy
# ============================================================

# ── Dev stage (used by docker-compose.override.yml) ──────────
FROM node:22-alpine AS dev
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ── Build stage ──────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# ── Production stage ─────────────────────────────────────────
FROM nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx template: Cloud Run PORT + runtime backend URL proxy
RUN mkdir -p /etc/nginx/templates && printf 'server {\n\
  listen ${PORT};\n\
  location /api {\n\
    proxy_pass ${BACKEND_URL};\n\
    proxy_http_version 1.1;\n\
    proxy_set_header Connection "";\n\
    proxy_set_header Host $host;\n\
    proxy_set_header X-Real-IP $remote_addr;\n\
    proxy_buffering off;\n\
    proxy_cache off;\n\
    proxy_read_timeout 3600s;\n\
    add_header X-Accel-Buffering no;\n\
  }\n\
  location / {\n\
    root /usr/share/nginx/html;\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
}\n' > /etc/nginx/templates/default.conf.template

ENV PORT=8080
ENV BACKEND_URL=http://127.0.0.1:8080

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
