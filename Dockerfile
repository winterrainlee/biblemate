# Build stage - Client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Build stage - Generate Bible DB
FROM node:20-alpine AS db-builder
WORKDIR /app

# Copy server for DB initialization
COPY server/package*.json ./server/
RUN cd server && npm ci

# Copy server code and scripts
COPY server/ ./server/
COPY scripts/ ./scripts/
COPY package.json ./

# Generate Bible DB
RUN node scripts/import-bible.js

# Production stage - Server
FROM node:20-alpine
WORKDIR /app

# Install server dependencies (production only)
COPY server/package*.json ./server/
RUN cd server && npm ci --production

# Copy server code
COPY server/ ./server/

# Copy client build from client-builder
COPY --from=client-builder /app/client/dist ./client/dist

# Copy generated DB to seed location
COPY --from=db-builder /app/server/db-data/bible.db ./server/db-seed/bible.db

# Create entrypoint script
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'if [ ! -f /app/server/db-data/bible.db ]; then' >> /entrypoint.sh && \
    echo '  echo "Initializing database from seed..."' >> /entrypoint.sh && \
    echo '  mkdir -p /app/server/db-data' >> /entrypoint.sh && \
    echo '  cp /app/server/db-seed/bible.db /app/server/db-data/bible.db' >> /entrypoint.sh && \
    echo 'fi' >> /entrypoint.sh && \
    echo 'exec node server/index.js' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Expose port
EXPOSE 3001

# Set environment
ENV NODE_ENV=production

# Start with entrypoint
CMD ["/entrypoint.sh"]
