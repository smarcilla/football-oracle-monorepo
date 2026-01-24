FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY services/engine/package.json ./services/engine/
COPY services/journalist/package.json ./services/journalist/
COPY packages/kafka/package.json ./packages/kafka/
COPY packages/types/package.json ./packages/types/

RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter @football-oracle/web build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000

CMD ["node", "apps/web/server.js"]

