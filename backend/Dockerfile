# Stage 1: Build with Go 1.22 to satisfy go.mod requirements
FROM golang:1.22-alpine AS builder
WORKDIR /app

# Only copy module files to leverage caching
COPY go.mod go.sum ./
RUN go mod download

# Copy and build your server code
COPY cmd/server ./cmd/server
COPY internal   ./internal
WORKDIR /app/cmd/server
RUN go build -o /app/server .

# Stage 2: Minimal Alpine runtime
FROM alpine:latest
WORKDIR /root/

# Copy the built binary and your .env
COPY --from=builder /app/server .
COPY cmd/server/.env .env

EXPOSE 8080
CMD ["./server"]
