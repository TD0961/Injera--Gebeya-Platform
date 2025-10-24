# ===========================================
# FRONTEND DOCKERFILE - REACT APPLICATION
# ===========================================

# Stage 1: Build Stage
# What: This stage builds the React application
# Why: We need Node.js to compile React into static files
# Where: This runs in a temporary container during build
FROM node:20-alpine AS builder

# Set working directory inside container
# What: Changes current directory to /app
# Why: All commands will run from this directory
# Where: Inside the container filesystem
WORKDIR /app

# Copy package files first (for better caching)
# What: Copies package.json and package-lock.json
# Why: Docker can cache this layer if dependencies don't change
# Where: From host Client/ directory to container /app/
COPY package*.json ./

# Install dependencies
# What: Downloads and installs all npm packages
# Why: Dependencies are needed to build the React application
# Where: Downloads to container's node_modules
RUN npm install

# Copy source code
# What: Copies all React source files
# Why: Source code is needed to build the application
# Where: From host Client/ directory to container /app/
COPY . .

# Build the React application
# What: Compiles React code into optimized static files
# Why: Creates production-ready static files for serving
# Where: Outputs built files to /app/dist/
RUN npm run build

# Stage 2: Production Stage
# What: This stage serves the built React application
# Why: Nginx is more efficient than Node.js for serving static files
# Where: This becomes the final container image
FROM nginx:1.25.3-alpine

# Copy custom Nginx configuration
# What: Copies our custom Nginx config
# Why: We need to configure Nginx for React SPA routing
# Where: From host to container's Nginx config directory
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built React application
# What: Copies the built static files from builder stage
# Why: Nginx needs the built files to serve them
# Where: From builder stage /app/dist/ to Nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Create non-root user for security
# What: Creates user 'nginx' with UID 101
# Why: Security best practice - don't run as root
# Where: Creates user in container's /etc/passwd
RUN adduser -D -s /bin/sh -u 101 nginx

# Set proper permissions
# What: Changes ownership of Nginx files to nginx user
# Why: Security - Nginx runs as non-root user
# Where: Changes ownership in container filesystem
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Create PID file directory
# What: Creates directory for Nginx PID file
# Why: Nginx needs a place to store its process ID
# Where: Creates directory in container filesystem
RUN mkdir -p /var/run/nginx && \
    chown -R nginx:nginx /var/run/nginx

# Switch to non-root user
# What: Changes from root user to nginx
# Why: Security best practice - don't run as root
# Where: Changes user context for subsequent commands
USER nginx

# Expose port
# What: Documents that the application uses port 80
# Why: Docker and orchestration tools need to know which port to expose
# Where: Metadata in container image
EXPOSE 80

# Health check
# What: Defines how to check if the application is healthy
# Why: Container orchestration can restart unhealthy containers
# Where: Docker health check configuration
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80 || exit 1

# Run Nginx
# What: Starts Nginx web server when container starts
# Why: This serves the React application
# Where: Executes in container as nginx user
CMD ["nginx", "-g", "daemon off;"]
