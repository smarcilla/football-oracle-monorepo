FROM node:25-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm --ignore-scripts

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY tsconfig.base.json ./

# Copy all package.jsons for better dependency caching (consistent with other Dockerfiles)
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY services/engine/package.json ./services/engine/
COPY services/journalist/package.json ./services/journalist/
COPY services/data-registry/package.json ./services/data-registry/
COPY packages/kafka/package.json ./packages/kafka/
COPY packages/types/package.json ./packages/types/

# Install dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy packages and service source
COPY packages/ packages/
COPY services/data-registry/ services/data-registry/

# Build (including types dependency)
RUN pnpm --filter @football-oracle/types build
RUN DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy pnpm --filter @football-oracle/data-registry prisma:generate
RUN pnpm --filter @football-oracle/data-registry build

FROM node:25-alpine AS runner

WORKDIR /app

# Install dependencies for Prisma and healthcheck
RUN apk add --no-cache curl libgcc libstdc++ openssl

# Copy from builder
COPY --from=builder /app ./

# Ensure entrypoint is executable
RUN chmod +x services/data-registry/entrypoint.sh

# Set non-privileged user
USER node

EXPOSE 3002

ENTRYPOINT ["/app/services/data-registry/entrypoint.sh"]
CMD ["node", "services/data-registry/dist/index.js"]

