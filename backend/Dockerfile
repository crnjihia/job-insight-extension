# Use Node 20 LTS for building
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
COPY package.json tsconfig.json ./
RUN npm ci

# Copy source code
COPY src ./src
RUN npm run build

# Runtime image
FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm ci --omit=dev

# Copy compiled artefacts
COPY --from=builder /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/index.js"]
