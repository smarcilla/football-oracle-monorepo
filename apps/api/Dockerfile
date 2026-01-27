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
COPY apps/api/src ./apps/api/src
COPY apps/api/tsconfig.json ./apps/api/
COPY packages/kafka ./packages/kafka
COPY packages/types ./packages/types

RUN pnpm --filter @football-oracle/kafka build
RUN pnpm --filter @football-oracle/api build

FROM node:25-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY --from=builder /app ./

USER node

EXPOSE 4000

CMD ["node", "apps/api/dist/index.js"]


