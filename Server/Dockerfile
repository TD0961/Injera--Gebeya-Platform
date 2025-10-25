# ===========================================
# BACKEND DOCKERFILE - GO FIBER APPLICATION
# ===========================================

# Stage 1: Build Stage
# What: This stage compiles the Go application
# Why: We need Go compiler and dependencies to build the binary
# Where: This runs in a temporary container during build
FROM golang:1.22-alpine AS builder

# Set working directory inside container
# What: Changes current directory to /app
# Why: All commands will run from this directory
# Where: Inside the container filesystem
WORKDIR /app

# Install build dependencies
# What: Installs git and ca-certificates
# Why: Git needed for go mod download, ca-certificates for HTTPS
# Where: Alpine package manager installs these
RUN apk add --no-cache git ca-certificates

# Copy go mod files first (for better caching)
# What: Copies go.mod and go.sum files
# Why: Docker can cache this layer if dependencies don't change
# Where: From host Server/ directory to container /app/
COPY go.mod go.sum ./

# Download dependencies
# What: Downloads all Go modules specified in go.mod
# Why: Dependencies are needed to compile the application
# Where: Downloads to container's module cache
RUN go mod download

# Copy source code
# What: Copies all Go source files
# Why: Source code is needed to compile the application
# Where: From host Server/ directory to container /app/
COPY . .

# Build the application
# What: Compiles Go code into a binary named 'injera-server'
# Why: Creates optimized binary for production
# Where: Outputs binary to /app/injera-server
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o injera-server main.go

# Stage 2: Runtime Stage
# What: This stage creates the final production image
# Why: Smaller image size, better security (no build tools)
# Where: This becomes the final container image
FROM alpine:3.20

# Install runtime dependencies
# What: Installs ca-certificates, timezone data, and curl for health checks
# Why: HTTPS connections, proper timezone handling, and health checks
# Where: Alpine package manager installs these
RUN apk --no-cache add ca-certificates tzdata curl

# Create non-root user for security
# What: Creates user 'appuser' with UID 1001
# Why: Security best practice - don't run as root
# Where: Creates user in container's /etc/passwd
RUN adduser -D -s /bin/sh -u 1001 appuser

# Set working directory
# What: Changes current directory to /app
# Why: Application will run from this directory
# Where: Inside the container filesystem
WORKDIR /app

# Copy binary from build stage
# What: Copies the compiled binary from builder stage
# Why: We need the compiled application in the final image
# Where: From builder stage /app/injera-server to current stage /app/
COPY --from=builder /app/injera-server .

# Change ownership to non-root user
# What: Changes file ownership to appuser
# Why: Security - application runs as non-root user
# Where: Changes ownership in container filesystem
RUN chown -R appuser:appuser /app

# Switch to non-root user
# What: Changes from root user to appuser
# Why: Security best practice - don't run as root
# Where: Changes user context for subsequent commands
USER appuser

# Expose port
# What: Documents that the application uses port 3000
# Why: Docker and orchestration tools need to know which port to expose
# Where: Metadata in container image
EXPOSE 3000

# Health check
# What: Defines how to check if the application is healthy
# Why: Container orchestration can restart unhealthy containers
# Where: Docker health check configuration
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Run the application
# What: Starts the Go application when container starts
# Why: This is the main process of the container
# Where: Executes in container as appuser
CMD ["./injera-server"]
