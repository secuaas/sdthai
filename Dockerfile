# SD Thai Food Platform - Fullstack Dockerfile
# Multi-stage build for NestJS API + Next.js Frontend

# ============================================================================
# Stage 1: Build Next.js Frontend
# ============================================================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./
COPY turbo.json ./

# Copy packages
COPY packages/ ./packages/

# Copy frontend source
COPY apps/web/package.json ./apps/web/
COPY apps/web/ ./apps/web/

# Install pnpm
RUN npm install -g pnpm@8.15.4

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client (needed for types)
RUN cd packages/prisma && pnpm db:generate

# Build frontend (standalone mode for production)
RUN cd apps/web && pnpm build

# ============================================================================
# Stage 2: Build NestJS Backend
# ============================================================================
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./
COPY turbo.json ./

# Copy packages
COPY packages/ ./packages/

# Copy backend source
COPY apps/api/package.json ./apps/api/
COPY apps/api/ ./apps/api/

# Install pnpm
RUN npm install -g pnpm@8.15.4

# Install dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN cd packages/prisma && pnpm db:generate

# Build backend
RUN cd apps/api && pnpm build

# ============================================================================
# Stage 3: Production Dependencies
# ============================================================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml ./

# Copy packages metadata
COPY packages/prisma/package.json ./packages/prisma/
COPY packages/prisma/schema.prisma ./packages/prisma/

# Copy apps metadata
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install pnpm
RUN npm install -g pnpm@8.15.4

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Install Prisma CLI globally for generate command
RUN npm install -g prisma@5.22.0

# Generate Prisma client for production
RUN cd packages/prisma && prisma generate

# ============================================================================
# Stage 4: Final Runtime Image
# ============================================================================
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S sdthai -u 1001

# Copy production dependencies
COPY --from=deps --chown=sdthai:nodejs /app/node_modules ./node_modules
COPY --from=deps --chown=sdthai:nodejs /app/packages ./packages
COPY --from=deps --chown=sdthai:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps --chown=sdthai:nodejs /app/apps/web/node_modules ./apps/web/node_modules

# Copy generated Prisma client from backend-builder stage
COPY --from=backend-builder --chown=sdthai:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Copy Prisma package index files (created in source)
COPY --chown=sdthai:nodejs packages/prisma/index.js ./packages/prisma/
COPY --chown=sdthai:nodejs packages/prisma/index.d.ts ./packages/prisma/

# Copy built backend
COPY --from=backend-builder --chown=sdthai:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=backend-builder --chown=sdthai:nodejs /app/apps/api/package.json ./apps/api/

# Copy built frontend (Next.js standalone)
COPY --from=frontend-builder --chown=sdthai:nodejs /app/apps/web/.next/standalone ./apps/web/
COPY --from=frontend-builder --chown=sdthai:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=frontend-builder --chown=sdthai:nodejs /app/apps/web/public ./apps/web/public

# Copy workspace files
COPY --chown=sdthai:nodejs pnpm-workspace.yaml package.json ./

USER sdthai

# Expose port for API (Web will be served via reverse proxy)
EXPOSE 3000

ENV NODE_ENV=production

# Health check (API endpoint)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start API server (NestJS)
CMD ["dumb-init", "node", "apps/api/dist/main.js"]
