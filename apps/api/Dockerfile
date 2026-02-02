# SD Thai Food - API Dockerfile (NestJS)
# Multi-stage build for optimized production image

# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml* ./
COPY turbo.json ./

# Copy packages
COPY packages/ ./packages/

# Copy API source
COPY apps/api/package.json ./apps/api/
COPY apps/api/ ./apps/api/

# Install pnpm
RUN npm install -g pnpm@8.15.4

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN cd packages/prisma && pnpm db:generate

# Build API
RUN cd apps/api && pnpm build

# Stage 2: Production dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml* ./

# Copy packages
COPY packages/prisma/package.json ./packages/prisma/
COPY packages/prisma/schema.prisma ./packages/prisma/

# Copy API package.json
COPY apps/api/package.json ./apps/api/

# Install pnpm
RUN npm install -g pnpm@8.15.4

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Generate Prisma client
RUN cd packages/prisma && pnpm db:generate

# Stage 3: Runtime
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy production dependencies
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=nestjs:nodejs /app/packages ./packages
COPY --from=deps --chown=nestjs:nodejs /app/apps/api/node_modules ./apps/api/node_modules

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./apps/api/

# Set user
USER nestjs

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production \
    PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to handle signals
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "apps/api/dist/main.js"]
