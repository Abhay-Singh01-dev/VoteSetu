# Stage 1: Build both frontend and backend
FROM node:20-alpine AS builder

WORKDIR /app

# Install all dependencies (including dev tools for build)
COPY package*.json ./
RUN npm install

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

EXPOSE 8080

CMD ["npm", "start"]
