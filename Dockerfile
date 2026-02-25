# Multi-stage Dockerfile for Next.js using pnpm (Corepack)
# - deps: installs dependencies (cached by copying lockfiles)
# - builder: builds the Next.js app
# - runner: lightweight runtime image with only build outputs

FROM node:18-alpine AS deps
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install build tools some native packages may need
RUN apk add --no-cache python3 make g++ git

# Use Corepack to provide pnpm in a reproducible way
RUN corepack enable && corepack prepare pnpm@latest --activate

# Cache deps by copying package manifests first
COPY package.json pnpm-lock.yaml ./
# If you require private registries, COPY .npmrc here (handle secrets carefully)
RUN pnpm install --frozen-lockfile

FROM node:18-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Reuse installed node_modules to speed up the build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the app (Next.js build)
RUN pnpm build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# tiny init to forward signals correctly
RUN apk add --no-cache tini

# Copy only runtime artifacts
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Default port for Next.js
EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["pnpm", "start"]
