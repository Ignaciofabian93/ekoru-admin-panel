# Build stage
FROM node:22-alpine AS builder

RUN apk upgrade --no-cache

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=true
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .

# NEXT_PUBLIC_* vars are inlined into the client bundle at build time.
# Pass the target environment so config/endpoints.ts resolves the correct API
# and CDN base URLs for the build (admin.ekoru.cl vs staging-admin.ekoru.cl).
ARG NEXT_PUBLIC_ENVIRONMENT
ENV NEXT_PUBLIC_ENVIRONMENT=$NEXT_PUBLIC_ENVIRONMENT

# Build the application
RUN pnpm run build

# Production stage
FROM node:22-alpine

RUN apk upgrade --no-cache

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# Copy built application from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
# next start reads next.config at runtime to resolve images.remotePatterns
COPY --from=builder /app/next.config.ts ./next.config.ts

CMD [ "pnpm", "start" ]

EXPOSE 3000
