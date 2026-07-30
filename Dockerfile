# --- Stage 1: Build the React frontend ---
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the frontend production bundle (writes to /app/dist)
RUN npm run build

# --- Stage 2: Create the lightweight production runner ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy dependency files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy compiled static files from builder stage
COPY --from=builder /app/dist ./dist

# Copy the server file
COPY server.js ./
COPY changelog.json ./

# Copy meals data for backend AI calculations
COPY src/data/meals.js ./src/data/meals.js

# Create the data directory for state persistence
RUN mkdir -p /app/data

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
