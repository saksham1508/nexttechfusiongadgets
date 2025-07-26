# Agile: Multi-stage React build with performance optimization
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    curl \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development
ENV NODE_ENV=development
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

# Build stage (Six Sigma: optimized production build)
FROM base AS build

# Set build environment
ENV NODE_ENV=production
ENV GENERATE_SOURCEMAP=false
ENV INLINE_RUNTIME_CHUNK=false

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application with optimizations
RUN npm run build

# Production stage (Lean: minimal runtime image)
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=build /app/build /usr/share/nginx/html

# Create non-root user
RUN addgroup -g 1001 -S nginx && \
    adduser -S nexttech -u 1001 -G nginx

# Set proper permissions
RUN chown -R nexttech:nginx /usr/share/nginx/html && \
    chown -R nexttech:nginx /var/cache/nginx && \
    chown -R nexttech:nginx /var/log/nginx && \
    chown -R nexttech:nginx /etc/nginx/conf.d

# Create nginx PID directory
RUN mkdir -p /var/run/nginx && \
    chown -R nexttech:nginx /var/run/nginx

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Switch to non-root user
USER nexttech

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Labels
LABEL maintainer="NextTechFusionGadgets Team" \
      version="1.0.0" \
      description="NextTechFusionGadgets Frontend" \
      org.opencontainers.image.source="https://github.com/nexttechfusiongadgets/frontend"