# Build stage - Client
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Production stage - Server
FROM node:20-alpine
WORKDIR /app

# Install server dependencies (production only)
COPY server/package*.json ./server/
RUN cd server && npm ci --production

# Copy server code
COPY server/ ./server/

# Move bible.db to seed location (volume mounts /app/server/data at runtime)
# so we store the seed DB separately and copy it on first startup
RUN mkdir -p /app/server/db-seed && \
    mv /app/server/data/bible.db /app/server/db-seed/bible.db

# Copy client build from client-builder
COPY --from=client-builder /app/client/dist ./client/dist

# Create entrypoint script
# At runtime, /app/server/data is a Fly.io volume (empty on first deploy).
# If bible.db doesn't exist in the volume yet, copy from seed.
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'mkdir -p /app/server/data' >> /entrypoint.sh && \
    echo 'if [ ! -f /app/server/data/bible.db ]; then' >> /entrypoint.sh && \
    echo '  echo "Initializing database from seed..."' >> /entrypoint.sh && \
    echo '  cp /app/server/db-seed/bible.db /app/server/data/bible.db' >> /entrypoint.sh && \
    echo 'fi' >> /entrypoint.sh && \
    echo 'exec node server/index.js' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Expose port
EXPOSE 3001

# Set environment
ENV NODE_ENV=production

# Start with entrypoint
CMD ["/entrypoint.sh"]
