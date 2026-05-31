FROM node:22-alpine

# Install pandoc and texlive for PDF conversion (minimal)
RUN apk add --no-cache \
    pandoc \
    texlive-full \
    ghostscript

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install production dependencies only with caching
RUN npm ci --production --omit=dev --legacy-peer-deps

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Set environment variables for production
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=512"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start application
CMD ["node", "server.js"]
