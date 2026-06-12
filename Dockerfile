# ── Stage 1: install dependencies ────────────────────────────────────────────
FROM node:24-bookworm-slim AS deps

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev

# ── Stage 2: runtime with Playwright browsers ─────────────────────────────────
FROM mcr.microsoft.com/playwright:v1.50.0-noble

WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', r => process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
