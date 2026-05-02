# Stage 1: Build both frontend and backend
FROM node:20-alpine AS builder

WORKDIR /app

# Install all dependencies (including dev tools for build)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build frontend and backend -> dist/
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine AS runtime

WORKDIR /app

# We need only production dependencies at runtime
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled artifacts from builder
COPY --from=builder /app/dist ./dist

# Ensure Node runs in production mode
ENV NODE_ENV=production
ENV PORT=8080

# Run as non-root user for better container hardening
USER node

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/healthz" || exit 1

CMD ["npm", "start"]
