FROM node:25-alpine AS builder

RUN npm install -g pnpm --ignore-scripts

WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY services/engine/package.json ./services/engine/
COPY services/journalist/package.json ./services/journalist/
COPY packages/kafka/package.json ./packages/kafka/
COPY packages/types/package.json ./packages/types/

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY tsconfig.base.json ./
COPY tsconfig.json ./
COPY services/journalist/src ./services/journalist/src
COPY services/journalist/tsconfig.json ./services/journalist/
COPY packages/kafka ./packages/kafka
COPY packages/types ./packages/types

RUN pnpm --filter @football-oracle/kafka build
RUN pnpm --filter @football-oracle/journalist build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app ./

USER node

CMD ["node", "services/journalist/dist/index.js"]


