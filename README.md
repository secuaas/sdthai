# sdthai

Application Fullstack générée par SecuOps v2.0

## Description

SDThai Platform

## Architecture

Cette application fullstack comprend:
- **Frontend**: React + Vite
- **Backend**: Go API (Gin framework)

## Développement

### Prérequis

- Go 1.21+
- Node.js 18+
- Docker
- kubectl (pour déploiement K8s)

### Installation locale

#### Backend

```bash
cd backend
go mod download
go run cmd/server/main.go
```

Le backend sera accessible sur http://localhost:8080

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

Le frontend sera accessible sur http://localhost:5173

### Endpoints API

- `GET /api/health` - Health check
- `GET /api/v1/` - Point d'entrée API

## Build et Déploiement

### Build local

```bash
# Builder l'image Docker
secuops build --app=sdthai
```

### Déployer en dev

```bash
secuops deploy --app=sdthai --env=k8s-dev
```

### Déployer en production

```bash
secuops deploy --app=sdthai --env=k8s-prod
```

## Tests

```bash
# Tests backend
secuops test --app=sdthai --component=backend

# Tests frontend
secuops test --app=sdthai --component=frontend
```

## Audit de conformité

```bash
# Vérifier la conformité du projet
secuops audit --app=sdthai
```

## Architecture du projet

```
sdthai/
├── backend/
│   ├── cmd/
│   │   └── server/
│   │       └── main.go          # Point d'entrée backend
│   ├── internal/
│   │   ├── handlers/            # HTTP handlers
│   │   ├── models/              # Data models
│   │   └── config/              # Configuration
│   ├── go.mod                   # Dépendances Go
│   └── go.sum
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Composant principal
│   │   ├── main.tsx             # Point d'entrée
│   │   └── components/          # Composants React
│   ├── package.json             # Dépendances NPM
│   ├── vite.config.ts           # Configuration Vite
│   └── tsconfig.json            # Configuration TypeScript
├── deploy/
│   └── k8s/
│       └── deployment.yaml      # Kubernetes manifests
├── Dockerfile                   # Image Docker multi-stage
└── README.md                    # Documentation
```

## Configuration

### Backend

Variables d'environnement:

- `PORT` - Port du serveur (défaut: 8080)
- `ENV` - Environnement (development/production)
- `CORS_ORIGINS` - Origines CORS autorisées

### Frontend

Variables d'environnement (.env):

- `VITE_API_URL` - URL de l'API backend

## Support

Créé avec SecuOps v2.0 - https://github.com/secuaas/secuops
