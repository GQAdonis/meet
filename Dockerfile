# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM node:20-slim AS runner

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@latest

# Copy necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Run the application
CMD ["node", "server.js"]
