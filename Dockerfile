# ── Stage 1: Node build ──────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Cache layer — only invalidated when package files change
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline

# Copy source and build
COPY . .
# VITE_API_URL is intentionally empty; Nginx will proxy /api at runtime
RUN npm run build


# ── Stage 2: Nginx static server ─────────────────────────
FROM nginx:1.27-alpine AS runtime

# Remove default Nginx page
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config (injected below)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
