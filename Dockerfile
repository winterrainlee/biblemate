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

# Copy server code (includes server/data/bible.db)
COPY server/ ./server/

# Copy client build from client-builder
COPY --from=client-builder /app/client/dist ./client/dist

# Create entrypoint script
# bible.db is already at /app/server/data/bible.db via COPY server/
# The entrypoint just starts the server
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'exec node server/index.js' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Expose port
EXPOSE 3001

# Set environment
ENV NODE_ENV=production

# Start with entrypoint
CMD ["/entrypoint.sh"]
