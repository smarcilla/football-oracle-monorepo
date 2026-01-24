FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY services/engine/package.json ./services/engine/
COPY services/journalist/package.json ./services/journalist/
COPY packages/kafka/package.json ./packages/kafka/
COPY packages/types/package.json ./packages/types/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @football-oracle/kafka build
RUN pnpm --filter @football-oracle/engine build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app ./

CMD ["node", "services/engine/dist/index.js"]


