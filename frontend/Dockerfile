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
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

ENV PORT=8080
ENV BACKEND_URL=http://vpasi-backend:8000

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
