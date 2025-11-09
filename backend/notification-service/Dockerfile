# Build stage: compile Go application
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o notification-service .

# Final stage: minimal runtime image
FROM alpine:3.18

WORKDIR /root/

# Install runtime dependencies (ca-certificates for HTTPS)
RUN apk --no-cache add ca-certificates

# Copy binary from builder
COPY --from=builder /app/notification-service .

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD test -f /root/notification-service || exit 1

# Run the application
CMD ["./notification-service"]
