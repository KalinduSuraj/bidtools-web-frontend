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
# Allow passing an NPM token for private registries (example: @jsr scope)
ARG NPM_TOKEN=""
# Create .npmrc only if NPM_TOKEN is provided, install deps and remove .npmrc in the same layer
RUN if [ -n "$NPM_TOKEN" ]; then \
			printf "//npm.jsr.io/:_authToken=${NPM_TOKEN}\\n@jsr:registry=https://npm.jsr.io/\\n" > .npmrc; \
		fi && \
		pnpm install --frozen-lockfile && \
		rm -f .npmrc || true

FROM node:18-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Ensure pnpm is available in this stage via Corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

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
