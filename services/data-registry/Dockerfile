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
RUN pnpm --filter @football-oracle/data-registry prisma:generate
RUN pnpm --filter @football-oracle/data-registry build

FROM node:25-alpine AS runner

WORKDIR /app

# Install curl for healthchecks
RUN apk add --no-cache curl

# Copy from builder
COPY --from=builder /app ./

# Set non-privileged user
USER node

EXPOSE 3002

CMD ["node", "services/data-registry/dist/index.js"]

