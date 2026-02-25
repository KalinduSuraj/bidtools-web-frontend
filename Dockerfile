# Multi-stage Dockerfile for building and running the Next.js app (pnpm)
# Builder stage: installs dependencies and builds the app
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Enable corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package manifests first to leverage Docker layer caching
COPY package.json pnpm-lock.yaml ./
COPY .npmrc ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy rest of the sources and build
COPY . .
RUN pnpm build

# Production image: copy only what's needed to run
FROM node:20-alpine AS runner
WORKDIR /app

# Enable corepack and pnpm in the runtime image
RUN corepack enable && corepack prepare pnpm@latest --activate

ENV NODE_ENV=production

# Copy package files (so `pnpm start` can see them) and production node_modules
COPY package.json pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules

# Copy built Next.js output and public assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

# Expose default Next.js port
EXPOSE 3000

# Start the app
CMD ["pnpm", "start"]
