# Six Sigma: Multi-stage Docker build for optimal performance and security
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies for better performance
RUN apk add --no-cache \
    dumb-init \
    curl \
    && rm -rf /var/cache/apk/*

# Create non-root user for security (Lean: security best practices)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nexttech -u 1001

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development
ENV NODE_ENV=development
RUN npm ci --include=dev
COPY . .
USER nexttech
EXPOSE 5000
CMD ["dumb-init", "npm", "run", "dev"]

# Production dependencies stage (Lean: minimize image size)
FROM base AS deps
ENV NODE_ENV=production
RUN npm ci --only=production && npm cache clean --force

# Production build stage
FROM base AS production

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY . .

# Remove development files (Lean: minimize attack surface)
RUN rm -rf \
    tests/ \
    *.test.js \
    *.spec.js \
    .eslintrc.js \
    .prettierrc.js \
    load-test.yml \
    README.md

# Create logs directory
RUN mkdir -p logs && chown -R nexttech:nodejs logs

# Health check (Six Sigma: monitoring)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/api/health || exit 1

# Switch to non-root user
USER nexttech

# Expose port
EXPOSE $PORT

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "server.js"]

# Labels for better container management
LABEL maintainer="NextTechFusionGadgets Team" \
      version="1.0.0" \
      description="NextTechFusionGadgets Backend API" \
      org.opencontainers.image.source="https://github.com/nexttechfusiongadgets/backend"