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

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --production

# Copy server code
COPY server/ ./server/

# Copy client build from previous stage
COPY --from=client-builder /app/client/dist ./client/dist

# Copy seed DB to separate location (will be copied to volume if empty)
COPY server/db-data/bible.db ./server/db-seed/bible.db

# Create entrypoint script
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'if [ ! -f /app/server/db-data/bible.db ]; then' >> /entrypoint.sh && \
    echo '  echo "Initializing database from seed..."' >> /entrypoint.sh && \
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
