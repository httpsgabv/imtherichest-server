FROM node:22-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm db:generate && pnpm build && pnpm prune --prod --ignore-scripts


FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json pnpm-workspace.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./

EXPOSE 3333

CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/src/infra/main.js"]
