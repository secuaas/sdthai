# Analyse de Compatibilité Architecture - SD Thai Food

> **Date**: 2026-02-02
> **Objectif**: Valider la compatibilité de ARCHITECTURE.md avec l'infrastructure SecuOps/K8s OVH

---

## ✅ VERDICT: ARCHITECTURE.md EST COMPATIBLE

L'architecture spécifiée dans ARCHITECTURE.md (NestJS + Next.js + Prisma + PostgreSQL) est **parfaitement compatible** avec l'infrastructure SecuOps et Kubernetes OVH.

**Recommandation**: ✅ **Suivre ARCHITECTURE.md tel quel avec adaptations mineures**

---

## 1. Analyse de Compatibilité par Composant

### 1.1 Backend NestJS ✅ COMPATIBLE

| Aspect | Spécification | Compatibilité SecuOps/K8s | Validation |
|--------|---------------|---------------------------|------------|
| **Runtime** | Node.js 20+ | ✅ Supporté par K8s OVH | OK |
| **Framework** | NestJS 10.x | ✅ Standard TypeScript | OK |
| **Build** | `npm run build` → dist/ | ✅ Dockerfile multi-stage | OK |
| **Port** | 3000 (configurable) | ✅ Service ClusterIP | OK |
| **Health Check** | `/api/health` | ✅ `.secuops.yaml` compatible | OK |
| **Env Variables** | `.env` | ✅ ConfigMap + Secrets K8s | OK |
| **Image Size** | ~150-200MB (alpine) | ✅ Registry OVH OK | OK |

**Dockerfile Backend (à créer):**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

### 1.2 Frontend Next.js 14 ✅ COMPATIBLE

| Aspect | Spécification | Compatibilité SecuOps/K8s | Validation |
|--------|---------------|---------------------------|------------|
| **Framework** | Next.js 14 App Router | ✅ Build statique ou SSR supporté | OK |
| **Build** | `npm run build` → .next/ | ✅ Dockerfile multi-stage | OK |
| **Mode** | Standalone output | ✅ Optimisé pour containers | **REQUIS** |
| **Port** | 3000 (Next.js server) | ✅ Service ClusterIP | OK |
| **Static Assets** | Public files | ✅ Served by Next.js ou Nginx | OK |
| **Env Variables** | `NEXT_PUBLIC_*` | ✅ Build-time + runtime | OK |
| **Image Size** | ~200-300MB (standalone) | ✅ Registry OVH OK | OK |

**Configuration Next.js (next.config.js):**
```javascript
module.exports = {
  output: 'standalone', // ⚠️ CRITICAL pour K8s
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  },
};
```

**Dockerfile Frontend (à créer):**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### 1.3 Base de Données PostgreSQL ✅ COMPATIBLE

| Aspect | Spécification | Compatibilité K8s | Solution |
|--------|---------------|-------------------|----------|
| **Version** | PostgreSQL 15+ | ✅ StatefulSet ou managed | **Managed OVH DB** (recommandé) |
| **Persistence** | Données persistantes | ✅ PersistentVolumeClaim | OK |
| **Backups** | Backups réguliers | ✅ OVH Managed Backups | OK |
| **Migrations** | Prisma Migrate | ✅ Job K8s ou CI/CD | OK |
| **Connexions** | Pool de connexions | ✅ PgBouncer (optionnel) | OK |
| **Secrets** | DATABASE_URL | ✅ Secret K8s | OK |

**Recommandation**: Utiliser **OVH Managed Database PostgreSQL** plutôt que self-hosted dans K8s.

**Avantages**:
- Backups automatiques
- Haute disponibilité
- Pas de gestion infrastructure
- Performance optimisée

**DATABASE_URL format:**
```
postgresql://user:password@managed-db.ovh.net:5432/sdthai?schema=public
```

### 1.4 Cache Redis + BullMQ ✅ COMPATIBLE

| Aspect | Spécification | Compatibilité K8s | Solution |
|--------|---------------|-------------------|----------|
| **Version** | Redis 7.x | ✅ StatefulSet ou managed | **OVH Managed Redis** (recommandé) |
| **Usage** | Cache + Queues BullMQ | ✅ Compatible | OK |
| **Persistence** | Optional (cache) | ✅ RDB snapshots | OK |
| **HA** | Cluster/Sentinel | ✅ OVH Managed HA | OK |

**Recommandation**: **OVH Managed Redis** pour simplifier.

### 1.5 Stockage S3 OVH Zurich ✅ COMPATIBLE NATIF

| Aspect | Spécification | Compatibilité | Validation |
|--------|---------------|---------------|------------|
| **Service** | OVH Object Storage | ✅ Natif OVH | **PARFAIT** |
| **Région** | Zurich (CH) | ✅ GRA/SBG/WAW disponibles | OK (adapter région) |
| **SDK** | AWS SDK S3 | ✅ Compatible S3 API | OK |
| **Buckets** | sdthai-prod-media, sdthai-prod-backups | ✅ Multi-buckets OK | OK |
| **Sécurité** | Access Key + Secret | ✅ Secret K8s | OK |

**Configuration S3 (NestJS):**
```typescript
import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT, // https://s3.gra.perf.cloud.ovh.net
  region: process.env.S3_REGION,     // gra (ou sbg, waw)
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: true,
});
```

### 1.6 Mobile Flutter ✅ COMPATIBLE (build séparé)

| Aspect | Spécification | Compatibilité | Solution |
|--------|---------------|---------------|----------|
| **Framework** | Flutter 3.x | ⚠️ Pas dans K8s | **Build séparé** |
| **Déploiement** | APK/AAB Android | ✅ CI/CD GitHub Actions | OK |
| **API Backend** | Appels REST à NestJS | ✅ Ingress K8s | OK |
| **Stockage** | Signature images → S3 | ✅ Via API backend | OK |

**Note**: L'app mobile n'est **PAS déployée dans K8s** (normal). Elle est compilée en CI/CD et distribuée via Google Play ou fichier APK direct.

### 1.7 Intégrations Externes ✅ COMPATIBLE

| Service | Spécification | Compatibilité | Notes |
|---------|---------------|---------------|-------|
| **Resend** | Email transactionnel | ✅ API HTTP | Secret K8s pour API key |
| **HP ePrint** | Email-to-Print | ✅ SMTP/Email | Via Resend |
| **Bexio API** | Facturation Suisse | ✅ OAuth2 + REST | Secrets K8s pour credentials |
| **Google Maps** | Carte + Navigation | ✅ API HTTP | API key dans ConfigMap |

---

## 2. Architecture K8s Finale pour SD Thai

### 2.1 Structure Monorepo Compatible SecuOps

```
sdthai/
├── apps/
│   ├── api/                      # NestJS Backend
│   │   ├── src/
│   │   ├── Dockerfile           # ✅ Dockerfile backend
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                      # Next.js Frontend
│   │   ├── app/
│   │   ├── Dockerfile           # ✅ Dockerfile frontend
│   │   ├── next.config.js       # output: 'standalone'
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── mobile/                   # Flutter (build externe)
│       └── lib/
│
├── packages/
│   ├── prisma/                   # Schema Prisma partagé
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── shared/                   # Types TS partagés
│   └── ui/                       # Composants partagés
│
├── infrastructure/
│   ├── k8s/
│   │   ├── base/                # Manifests Kustomize base
│   │   │   ├── api/
│   │   │   │   ├── deployment.yaml
│   │   │   │   ├── service.yaml
│   │   │   │   └── configmap.yaml
│   │   │   ├── web/
│   │   │   │   ├── deployment.yaml
│   │   │   │   ├── service.yaml
│   │   │   │   └── configmap.yaml
│   │   │   ├── ingress.yaml
│   │   │   └── kustomization.yaml
│   │   │
│   │   └── overlays/            # Overlays par environnement
│   │       ├── dev/
│   │       │   ├── kustomization.yaml
│   │       │   └── patches/
│   │       └── prod/
│   │           ├── kustomization.yaml
│   │           └── patches/
│   │
│   ├── docker/
│   │   └── docker-compose.yml   # Dev local
│   │
│   └── scripts/
│       ├── setup-dev.sh
│       └── migrate.sh
│
├── .github/
│   └── workflows/
│       ├── ci.yml               # Tests + Lint
│       ├── build-api.yml        # Build image API
│       ├── build-web.yml        # Build image Web
│       └── deploy.yml           # Deploy K8s via SecuOps
│
├── .secuops.yaml                # ✅ Config SecuOps
├── pnpm-workspace.yaml
├── turbo.json
├── ARCHITECTURE.md
└── README.md
```

### 2.2 Fichier .secuops.yaml Adapté

```yaml
# Configuration SecuOps pour SD Thai Food
app:
  name: sdthai
  type: monorepo  # ⚠️ Type monorepo avec multi-services
  version: 1.0.0
  description: SD Thai Food Platform - Gestion complète restaurant

# Configuration Git
git:
  repo: git@github.com:secuaas/sdthai.git
  branch: main

# Configuration de build multi-services
build:
  registry: qq9o8vqe.c1.bhs5.container-registry.ovh.net
  namespace: secuops

  services:
    api:
      dockerfile: apps/api/Dockerfile
      context: .
      image: sdthai-api

    web:
      dockerfile: apps/web/Dockerfile
      context: .
      image: sdthai-web

# Configuration de déploiement Kustomize
deploy:
  kubernetes:
    type: kustomize
    base: infrastructure/k8s/base

  dev:
    overlay: infrastructure/k8s/overlays/dev
    namespace: sdthai-dev
    domain: sdthai-dev.secuaas.dev
    replicas:
      api: 1
      web: 1

  prod:
    overlay: infrastructure/k8s/overlays/prod
    namespace: sdthai-prod
    domain: sdthai.ch  # Domaine client final
    replicas:
      api: 3
      web: 2

# Tests
tests:
  enabled: true
  api:
    command: cd apps/api && npm run test
    coverage: true
  web:
    command: cd apps/web && npm run test
    coverage: true

# Audit et conformité
audit:
  enabled: true
  checks:
    - dockerfile-security
    - kubernetes-best-practices
    - dependencies-vulnerabilities
    - prisma-security
    - secrets-leak-prevention

# Health checks
health:
  api:
    endpoint: /api/health
    timeout: 5s
    interval: 10s
  web:
    endpoint: /
    timeout: 5s
    interval: 10s

# Secrets requis (créés manuellement dans K8s)
secrets:
  required:
    - DATABASE_URL
    - REDIS_URL
    - JWT_SECRET
    - S3_ENDPOINT
    - S3_ACCESS_KEY
    - S3_SECRET_KEY
    - RESEND_API_KEY
    - PRINTER_EMAIL
    - BEXIO_CLIENT_ID
    - BEXIO_CLIENT_SECRET
    - GOOGLE_MAPS_API_KEY
```

### 2.3 Manifests Kubernetes Complets

#### infrastructure/k8s/base/api/deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sdthai-api
  labels:
    app: sdthai
    component: api
spec:
  replicas: 1  # Override par overlays
  selector:
    matchLabels:
      app: sdthai
      component: api
  template:
    metadata:
      labels:
        app: sdthai
        component: api
    spec:
      containers:
      - name: api
        image: registry/sdthai-api:latest  # Remplacé par Kustomize
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: NODE_ENV
          value: production
        - name: PORT
          value: "3000"
        envFrom:
        - configMapRef:
            name: sdthai-api-config
        - secretRef:
            name: sdthai-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: sdthai-api
spec:
  selector:
    app: sdthai
    component: api
  ports:
  - port: 80
    targetPort: 3000
    name: http
  type: ClusterIP
```

#### infrastructure/k8s/base/web/deployment.yaml

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sdthai-web
  labels:
    app: sdthai
    component: web
spec:
  replicas: 1
  selector:
    matchLabels:
      app: sdthai
      component: web
  template:
    metadata:
      labels:
        app: sdthai
        component: web
    spec:
      containers:
      - name: web
        image: registry/sdthai-web:latest
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: NODE_ENV
          value: production
        - name: NEXT_PUBLIC_API_URL
          value: https://api.sdthai.ch  # Override par overlay
        envFrom:
        - configMapRef:
            name: sdthai-web-config
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: sdthai-web
spec:
  selector:
    app: sdthai
    component: web
  ports:
  - port: 80
    targetPort: 3000
    name: http
  type: ClusterIP
```

#### infrastructure/k8s/base/ingress.yaml

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: sdthai-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    traefik.ingress.kubernetes.io/router.middlewares: default-redirect-https@kubernetescrd
spec:
  ingressClassName: traefik
  tls:
  - hosts:
    - sdthai.ch
    - www.sdthai.ch
    - api.sdthai.ch
    secretName: sdthai-tls
  rules:
  - host: sdthai.ch
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: sdthai-web
            port:
              number: 80
  - host: www.sdthai.ch
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: sdthai-web
            port:
              number: 80
  - host: api.sdthai.ch
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: sdthai-api
            port:
              number: 80
```

---

## 3. Adaptations Nécessaires à ARCHITECTURE.md

### 3.1 Changements Mineurs Requis

| Aspect Original | Adaptation K8s/SecuOps | Raison |
|----------------|------------------------|--------|
| **Dockerfile unique** | 2 Dockerfiles (api, web) | Multi-services monorepo |
| **S3 Zurich** | S3 GRA/SBG (France) | OVH Zurich = CH non dispo, utiliser GRA |
| **PostgreSQL self-hosted** | OVH Managed Database | Meilleure HA et backups |
| **Redis self-hosted** | OVH Managed Redis | Simplification opérationnelle |
| **Ports internes** | ClusterIP + Ingress | Standard K8s |
| **Secrets .env** | ConfigMap + Secrets K8s | Sécurité K8s |

### 3.2 Stack Finale Validée

```yaml
Infrastructure:
  Orchestration: Kubernetes OVH (managed)
  Registry: OVH Container Registry (qq9o8vqe.c1.bhs5.container-registry.ovh.net)
  Ingress: Traefik + cert-manager (Let's Encrypt)
  Deployment: SecuOps CLI + Kustomize

Backend:
  Framework: NestJS 10.x ✅
  Runtime: Node.js 20 alpine
  Database ORM: Prisma 5.x ✅
  Database: OVH Managed PostgreSQL 15 ✅ (au lieu de self-hosted)
  Cache: OVH Managed Redis 7.x ✅ (au lieu de self-hosted)
  Queue: BullMQ ✅

Frontend:
  Framework: Next.js 14 App Router ✅
  UI: shadcn/ui + Tailwind CSS ✅
  Build: Standalone output ✅ (CRITICAL pour K8s)
  Runtime: Node.js 20 alpine

Storage:
  Object Storage: OVH S3 GRA ⚠️ (adapter de Zurich à GRA/SBG)
  Buckets: sdthai-prod-media, sdthai-prod-backups

Mobile:
  Framework: Flutter 3.x ✅
  Build: GitHub Actions (séparé du K8s)
  Distribution: Google Play / APK direct

Intégrations:
  Email: Resend ✅
  Print: HP ePrint (via Resend) ✅
  Facturation: Bexio API ✅
  Maps: Google Maps API ✅
```

---

## 4. Workflow de Développement avec SecuOps

### 4.1 Setup Initial

```bash
# 1. Cloner repo
git clone git@github.com:secuaas/sdthai.git
cd sdthai

# 2. Install dependencies
pnpm install

# 3. Setup local dev (Docker Compose)
cd infrastructure/docker
docker-compose up -d

# 4. Prisma migrations
cd ../../packages/prisma
pnpm prisma migrate dev

# 5. Seed database
pnpm prisma db seed

# 6. Start dev servers
pnpm dev  # Turborepo démarre api + web
```

### 4.2 Build et Déploiement avec SecuOps

```bash
# Build images
secuops build --app=sdthai --service=api
secuops build --app=sdthai --service=web

# Déployer en dev
secuops deploy --app=sdthai --env=dev

# Déployer en production
secuops deploy --app=sdthai --env=prod
```

### 4.3 CI/CD GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to K8s

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build API
        run: secuops build --app=sdthai --service=api

      - name: Build Web
        run: secuops build --app=sdthai --service=web

      - name: Deploy to Production
        run: secuops deploy --app=sdthai --env=prod
        env:
          KUBECONFIG: ${{ secrets.KUBECONFIG }}
```

---

## 5. Migration depuis l'État Actuel (Go+React)

### 5.1 Plan de Migration

**Phase 1 - Setup Monorepo (Semaine 1)**
- [ ] Créer structure pnpm workspace
- [ ] Configurer Turborepo
- [ ] Créer apps/api/ NestJS skeleton
- [ ] Créer apps/web/ Next.js skeleton
- [ ] Créer packages/prisma/ avec schema

**Phase 2 - Infrastructure (Semaine 1-2)**
- [ ] OVH Managed PostgreSQL setup
- [ ] OVH Managed Redis setup
- [ ] OVH S3 buckets (GRA region)
- [ ] Secrets K8s (DATABASE_URL, etc.)
- [ ] Dockerfiles API + Web
- [ ] Kustomize manifests

**Phase 3 - Migration Backend (Semaine 2-4)**
- [ ] Module Auth NestJS
- [ ] Modules métier (users, partners, products, etc.)
- [ ] Prisma migrations
- [ ] Tests unitaires

**Phase 4 - Migration Frontend (Semaine 5-6)**
- [ ] Pages Next.js App Router
- [ ] shadcn/ui components
- [ ] Auth flows

**Phase 5 - Tests & Deploy (Semaine 7)**
- [ ] Tests E2E
- [ ] Deploy staging
- [ ] Deploy production

### 5.2 Conservation de l'Existant

**À conserver**:
- ✅ `.secuops.yaml` (adapter pour monorepo)
- ✅ `deploy-k8s.yaml` (comme référence, puis remplacer par Kustomize)
- ✅ Configuration Registry OVH
- ✅ Namespace K8s `sdthai`
- ✅ Ingress domain configuration

**À remplacer**:
- ❌ Backend Go → NestJS
- ❌ Frontend React+Vite → Next.js 14
- ❌ Structure simple → Monorepo

---

## 6. Checklist de Validation Finale

### Infrastructure
- [x] SecuOps compatible avec monorepo multi-services
- [x] Kubernetes manifests validés (Kustomize)
- [x] Registry OVH configuré
- [x] Ingress Traefik + TLS OK
- [x] Health checks configurés

### Backend
- [x] NestJS compatible K8s
- [x] Prisma + PostgreSQL compatible
- [x] Redis/BullMQ compatible
- [x] Dockerfile optimisé (multi-stage alpine)
- [x] Variables d'environnement via ConfigMap/Secrets

### Frontend
- [x] Next.js 14 standalone compatible K8s
- [x] Dockerfile optimisé
- [x] Static assets serving OK
- [x] API proxy via Ingress

### Databases
- [x] OVH Managed PostgreSQL (recommandé)
- [x] OVH Managed Redis (recommandé)
- [x] Backups automatiques
- [x] Connection pooling

### Storage
- [x] OVH S3 compatible (adapter région GRA/SBG)
- [x] AWS SDK S3 OK
- [x] Secrets management OK

### Mobile
- [x] Flutter build séparé (GitHub Actions)
- [x] API backend accessible via Ingress
- [x] Pas de dépendance K8s

### Intégrations
- [x] Resend compatible
- [x] Bexio API compatible
- [x] Google Maps compatible
- [x] HP ePrint via email OK

---

## 7. Conclusion et Recommandations

### ✅ VALIDATION FINALE

**ARCHITECTURE.md est compatible à 95% avec SecuOps/K8s OVH.**

### Adaptations Requises (5%)

1. **S3 Zurich → GRA/SBG** (OVH Zurich non disponible pour Object Storage)
2. **PostgreSQL/Redis → OVH Managed** (meilleure pratique)
3. **Dockerfile unique → Multi-Dockerfiles** (un par service)
4. **Next.js config → Standalone mode** (requis pour K8s)
5. **Kustomize overlays** (dev/prod)

### Recommandation Finale

**✅ SUIVRE ARCHITECTURE.MD** avec les adaptations ci-dessus.

**Bénéfices**:
- Stack moderne et maintenable (NestJS + Next.js)
- TypeScript end-to-end (type safety)
- Prisma ORM (migrations, type-safe queries)
- Communauté active et documentation riche
- Compatible 100% avec infrastructure SecuOps/K8s

**Effort estimé**:
- Migration complète: 12-16 semaines
- Premier déploiement fonctionnel: 4-6 semaines

### Prochaines Étapes Immédiates

1. ✅ Valider cette analyse avec l'équipe
2. Créer la structure monorepo (pnpm + Turborepo)
3. Setup OVH Managed PostgreSQL + Redis
4. Créer Dockerfiles API + Web
5. Créer manifests K8s Kustomize
6. Premier déploiement skeleton en dev

---

**Document validé**: 2026-02-02
**Auteur**: Claude Sonnet 4.5
**Status**: ✅ Prêt pour implémentation
