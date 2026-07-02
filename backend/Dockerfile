FROM node:20.19.0-alpine
WORKDIR /app/backend

COPY backend/package.json backend/pnpm-lock.yaml ./

RUN corepack enable \
    && corepack prepare pnpm@9.15.0 --activate \
    && pnpm install --frozen-lockfile --prod

COPY backend/ .

EXPOSE 6139
CMD ["node", "server.js"]