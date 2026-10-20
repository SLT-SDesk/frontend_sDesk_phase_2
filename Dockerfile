# Stage 1: Build the Vite React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy application source code
COPY . .

# Build production bundle with sourcemaps disabled
RUN npm run build && find dist -name "*.map" -delete

# Stage 2: Serve with hardened Nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration with Anti-Clickjacking and hardened CSP headers
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose standard HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
