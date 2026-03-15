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

# Nginx config: reverse proxy /api to backend + SPA fallback
RUN printf 'server {\n\
  listen 80;\n\
  location /api {\n\
    proxy_pass http://backend:8000;\n\
    proxy_set_header Host $host;\n\
    proxy_set_header X-Real-IP $remote_addr;\n\
  }\n\
  location / {\n\
    root /usr/share/nginx/html;\n\
    try_files $uri $uri/ /index.html;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
