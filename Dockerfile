# Multi-stage Dockerfile pour Fullstack App (React + Go)

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copier les fichiers de dépendances
COPY frontend/package*.json ./
RUN npm ci

# Copier le code source
COPY frontend/ ./

# Builder l'application React
RUN npm run build

# Stage 2: Build Backend
FROM golang:1.21-alpine AS backend-builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY backend/go.mod backend/go.sum ./
RUN go mod download

# Copier le code source
COPY backend/ ./

# Builder l'application
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/bin/server ./cmd/server

# Stage 3: Image finale
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copier le binaire backend
COPY --from=backend-builder /app/bin/server .

# Copier les fichiers frontend buildés
COPY --from=frontend-builder /app/frontend/dist ./public

# Exposer le port
EXPOSE 8080

# Commande de démarrage
CMD ["./server"]
