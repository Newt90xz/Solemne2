# Build stage
FROM node:20.19.0-alpine AS builder
WORKDIR /app/digitalvoid

# Copy package manifests for layer caching
COPY digitalvoid/package.json digitalvoid/pnpm-lock.yaml ./

# Enable corepack and install with pnpm, then build
RUN corepack enable \
    && corepack prepare pnpm@9.15.0 --activate \
    && pnpm install --frozen-lockfile

# Copy the app sources and build
COPY digitalvoid/ .
RUN pnpm build

# Production stage
FROM nginx:1.27-alpine
COPY --from=builder /app/digitalvoid/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]