# Stage 1: Development
FROM node:20-alpine AS development

WORKDIR /app

# Install dependencies for development
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Start development server
CMD ["npm", "run", "dev"]

# Stage 2: Production build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for production build
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build application
RUN npm run build

# Stage 3: Production runtime
FROM node:20-alpine AS production

WORKDIR /app

# Copy necessary files
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone ./

# Install production dependencies
RUN npm ci --production

# Set environment variables
ENV NODE_ENV production
ENV PORT 3000

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]