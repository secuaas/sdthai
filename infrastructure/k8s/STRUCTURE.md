# Structure Kubernetes - SD Thai Food

## Vue d'ensemble

Cette documentation décrit la structure complète de l'infrastructure Kubernetes pour SD Thai Food.

## Arborescence des fichiers

```
infrastructure/k8s/
├── README.md                       # Documentation principale
├── STRUCTURE.md                    # Ce fichier
├── .gitignore                      # Fichiers à ignorer par Git
├── deploy.sh                       # Script de déploiement automatisé
├── create-secrets.sh               # Script de création des secrets
│
├── base/                           # Configuration de base (partagée)
│   ├── kustomization.yaml          # Kustomize principal base
│   ├── namespace.yaml              # Namespace par défaut
│   ├── ingress.yaml                # Configuration Ingress Traefik
│   │
│   ├── api/                        # Backend API
│   │   ├── kustomization.yaml      # Kustomize API
│   │   ├── deployment.yaml         # Déploiement API
│   │   ├── service.yaml            # Service ClusterIP API
│   │   └── configmap.yaml          # Configuration API (base)
│   │
│   └── web/                        # Frontend Web
│       ├── kustomization.yaml      # Kustomize Web
│       ├── deployment.yaml         # Déploiement Web
│       ├── service.yaml            # Service ClusterIP Web
│       └── configmap.yaml          # Configuration Web (base)
│
└── overlays/                       # Configurations spécifiques par environnement
    │
    ├── dev/                        # Environnement développement
    │   ├── kustomization.yaml      # Config Kustomize dev
    │   ├── api-patch.yaml          # Patch API pour dev
    │   ├── web-patch.yaml          # Patch Web pour dev
    │   └── ingress-patch.yaml      # Patch Ingress pour dev
    │
    └── prod/                       # Environnement production
        ├── kustomization.yaml      # Config Kustomize prod
        ├── api-patch.yaml          # Patch API pour prod
        ├── api-hpa.yaml            # HPA API (auto-scaling)
        ├── web-patch.yaml          # Patch Web pour prod
        ├── web-hpa.yaml            # HPA Web (auto-scaling)
        └── ingress-patch.yaml      # Patch Ingress pour prod
```

## Ressources Kubernetes créées

### Environnement Dev (sdthai-dev)

| Type | Nom | Namespace | Description |
|------|-----|-----------|-------------|
| Namespace | sdthai-dev | - | Namespace dev |
| ConfigMap | dev-sdthai-api-config | sdthai-dev | Configuration API dev |
| ConfigMap | dev-sdthai-web-config | sdthai-dev | Configuration Web dev |
| Secret | sdthai-api-secrets | sdthai-dev | Secrets API (JWT) |
| Deployment | dev-sdthai-api | sdthai-dev | API Backend (1 replica) |
| Deployment | dev-sdthai-web | sdthai-dev | Web Frontend (1 replica) |
| Service | dev-sdthai-api | sdthai-dev | Service API ClusterIP |
| Service | dev-sdthai-web | sdthai-dev | Service Web ClusterIP |
| Ingress | dev-sdthai-ingress | sdthai-dev | Ingress Traefik dev |

### Environnement Prod (sdthai-prod)

| Type | Nom | Namespace | Description |
|------|-----|-----------|-------------|
| Namespace | sdthai-prod | - | Namespace prod |
| ConfigMap | prod-sdthai-api-config | sdthai-prod | Configuration API prod |
| ConfigMap | prod-sdthai-web-config | sdthai-prod | Configuration Web prod |
| Secret | sdthai-api-secrets | sdthai-prod | Secrets API (JWT) |
| Deployment | prod-sdthai-api | sdthai-prod | API Backend (3+ replicas) |
| Deployment | prod-sdthai-web | sdthai-prod | Web Frontend (2+ replicas) |
| Service | prod-sdthai-api | sdthai-prod | Service API ClusterIP |
| Service | prod-sdthai-web | sdthai-prod | Service Web ClusterIP |
| Ingress | prod-sdthai-ingress | sdthai-prod | Ingress Traefik prod |
| HPA | prod-sdthai-api-hpa | sdthai-prod | Auto-scaling API (3-10) |
| HPA | prod-sdthai-web-hpa | sdthai-prod | Auto-scaling Web (2-5) |

## Configuration par composant

### Base API (base/api/)

**Deployment:**
- Image: `registry/sdthai-api:latest` (modifiable par overlay)
- Port: 3000
- Replicas: 1 (modifiable par overlay)
- Health checks: `/api/health` (liveness et readiness)
- Resources:
  - Requests: 256Mi RAM, 200m CPU
  - Limits: 512Mi RAM, 500m CPU
- Variables d'environnement:
  - `PORT=3000`
  - `NODE_ENV=production` (modifiable par overlay)
  - ConfigMap: `sdthai-api-config`
  - Secret: `sdthai-api-secrets`

**Service:**
- Type: ClusterIP
- Port: 3000

**ConfigMap (base):**
- `DATABASE_URL`: postgresql://user:password@postgres:5432/sdthai
- `REDIS_URL`: redis://redis:6379
- `CORS_ORIGIN`: http://localhost:3001

### Base Web (base/web/)

**Deployment:**
- Image: `registry/sdthai-web:latest` (modifiable par overlay)
- Port: 3000
- Replicas: 1 (modifiable par overlay)
- Health checks: `/` (liveness et readiness)
- Resources:
  - Requests: 256Mi RAM, 200m CPU
  - Limits: 512Mi RAM, 500m CPU
- Variables d'environnement:
  - `PORT=3000`
  - `NODE_ENV=production` (modifiable par overlay)
  - ConfigMap: `sdthai-web-config`

**Service:**
- Type: ClusterIP
- Port: 3000

**ConfigMap (base):**
- `NEXT_PUBLIC_API_URL`: http://localhost:3000

### Ingress (base/ingress.yaml)

**Configuration de base:**
- IngressClass: traefik
- Annotations:
  - `cert-manager.io/cluster-issuer: letsencrypt-prod`
  - Redirection HTTPS automatique
  - TLS activé
- Hosts (modifiables par overlay):
  - sdthai.ch → web
  - www.sdthai.ch → web
  - api.sdthai.ch → api
- TLS: Certificat Let's Encrypt via cert-manager

## Overlays - Différences par environnement

### Dev Overlay (overlays/dev/)

**Configuration:**
- Namespace: `sdthai-dev`
- Prefix: `dev-`
- Image tag: `dev`
- Labels: `environment: development`

**ConfigMap API (merge):**
- `DATABASE_URL`: postgresql://user:password@postgres:5432/sdthai_dev
- `REDIS_URL`: redis://redis:6379/1
- `CORS_ORIGIN`: https://sdthai-dev.secuaas.dev

**ConfigMap Web (merge):**
- `NEXT_PUBLIC_API_URL`: https://api-sdthai-dev.secuaas.dev

**API Patch:**
- Replicas: 1
- `NODE_ENV=development`
- `LOG_LEVEL=debug`

**Web Patch:**
- Replicas: 1
- `NODE_ENV=development`

**Ingress Patch:**
- Hosts:
  - sdthai-dev.secuaas.dev → web
  - api-sdthai-dev.secuaas.dev → api
- TLS secret: `sdthai-dev-tls`

### Prod Overlay (overlays/prod/)

**Configuration:**
- Namespace: `sdthai-prod`
- Prefix: `prod-`
- Image tag: `latest`
- Labels: `environment: production`

**ConfigMap API (merge):**
- `DATABASE_URL`: postgresql://user:password@postgres:5432/sdthai_prod
- `REDIS_URL`: redis://redis:6379/0
- `CORS_ORIGIN`: https://sdthai.ch,https://www.sdthai.ch

**ConfigMap Web (merge):**
- `NEXT_PUBLIC_API_URL`: https://api.sdthai.ch

**API Patch:**
- Replicas: 3
- `NODE_ENV=production`
- `LOG_LEVEL=info`
- Strategy: RollingUpdate (maxSurge: 1, maxUnavailable: 0)
- Annotations Prometheus:
  - `prometheus.io/scrape: "true"`
  - `prometheus.io/port: "3000"`
  - `prometheus.io/path: "/metrics"`
- Pod Anti-Affinity: distribution sur différents nodes

**API HPA (api-hpa.yaml):**
- Min replicas: 3
- Max replicas: 10
- Métriques:
  - CPU: 70%
  - Memory: 80%
- Comportement:
  - ScaleUp: rapide (100% en 30s)
  - ScaleDown: progressif (50% en 60s avec stabilisation 300s)

**Web Patch:**
- Replicas: 2
- `NODE_ENV=production`
- Strategy: RollingUpdate (maxSurge: 1, maxUnavailable: 0)
- Annotations Prometheus:
  - `prometheus.io/scrape: "true"`
  - `prometheus.io/port: "3000"`
- Pod Anti-Affinity: distribution sur différents nodes

**Web HPA (web-hpa.yaml):**
- Min replicas: 2
- Max replicas: 5
- Métriques:
  - CPU: 70%
  - Memory: 80%
- Comportement similaire à l'API HPA

**Ingress Patch:**
- Hosts:
  - sdthai.ch → web
  - www.sdthai.ch → web
  - api.sdthai.ch → api
- TLS secret: `sdthai-prod-tls`
- Middlewares supplémentaires:
  - compression
  - security headers

## Scripts utilitaires

### deploy.sh

Script de déploiement automatisé avec les actions suivantes:

**Commandes:**
```bash
./deploy.sh dev preview   # Prévisualise les manifestes dev
./deploy.sh dev apply     # Déploie en dev
./deploy.sh dev status    # Affiche le status dev
./deploy.sh dev delete    # Supprime les ressources dev

./deploy.sh prod preview  # Prévisualise les manifestes prod
./deploy.sh prod apply    # Déploie en prod
./deploy.sh prod status   # Affiche le status prod
./deploy.sh prod delete   # Supprime les ressources prod
```

**Fonctionnalités:**
- Validation de l'environnement
- Vérification des secrets requis
- Application des manifestes Kustomize
- Suivi du rollout
- Affichage du status complet
- Gestion de la suppression sécurisée

### create-secrets.sh

Script de création des secrets Kubernetes:

**Commandes:**
```bash
./create-secrets.sh dev   # Crée les secrets dev
./create-secrets.sh prod  # Crée les secrets prod
```

**Fonctionnalités:**
- Génération automatique de secrets sécurisés
- Saisie manuelle optionnelle
- Vérification de l'existence des secrets
- Sauvegarde optionnelle dans un fichier local
- Protection du fichier (chmod 600)

**Secrets créés:**
- `JWT_SECRET`: Secret pour la signature JWT
- `JWT_REFRESH_SECRET`: Secret pour les refresh tokens

## Workflow de déploiement

### Premier déploiement

1. **Créer les secrets:**
   ```bash
   ./create-secrets.sh dev
   ./create-secrets.sh prod
   ```

2. **Prévisualiser les manifestes:**
   ```bash
   ./deploy.sh dev preview
   ./deploy.sh prod preview
   ```

3. **Déployer en dev:**
   ```bash
   ./deploy.sh dev apply
   ```

4. **Vérifier le déploiement:**
   ```bash
   ./deploy.sh dev status
   kubectl logs -f -n sdthai-dev -l app=sdthai-api
   ```

5. **Tester l'application:**
   - Frontend: https://sdthai-dev.secuaas.dev
   - API: https://api-sdthai-dev.secuaas.dev

6. **Déployer en prod (après validation):**
   ```bash
   ./deploy.sh prod apply
   ```

### Mise à jour

1. **Modifier les fichiers Kustomize nécessaires**

2. **Prévisualiser les changements:**
   ```bash
   ./deploy.sh <env> preview
   ```

3. **Appliquer les changements:**
   ```bash
   ./deploy.sh <env> apply
   ```

4. **Suivre le rollout:**
   ```bash
   kubectl rollout status deployment/prod-sdthai-api -n sdthai-prod
   ```

### Rollback

```bash
# Voir l'historique
kubectl rollout history deployment/prod-sdthai-api -n sdthai-prod

# Rollback
kubectl rollout undo deployment/prod-sdthai-api -n sdthai-prod
kubectl rollout undo deployment/prod-sdthai-web -n sdthai-prod
```

## Sécurité

### Secrets

- **NE JAMAIS** committer les fichiers de secrets
- Utiliser `create-secrets.sh` pour générer des secrets forts
- Sauvegarder les secrets dans un gestionnaire de secrets (Vault, AWS Secrets Manager, etc.)
- Changer les secrets régulièrement en production

### Configuration

- Les ConfigMaps contiennent des placeholders (ex: DATABASE_URL)
- Mettre à jour les vraies credentials avant le déploiement
- Utiliser des secrets Kubernetes pour les données sensibles

### TLS

- Certificats gérés automatiquement par cert-manager
- Let's Encrypt en production
- Renouvellement automatique

### Network Policies (TODO)

Implémenter des Network Policies pour:
- Restreindre le trafic entre pods
- Limiter l'accès aux bases de données
- Isoler les namespaces

## Monitoring et Observabilité

### Prometheus (Production)

Les pods en production exposent des métriques:
- **API**: `/metrics` sur le port 3000
- **Web**: Métriques disponibles sur le port 3000

Annotations configurées:
```yaml
prometheus.io/scrape: "true"
prometheus.io/port: "3000"
prometheus.io/path: "/metrics"  # API uniquement
```

### Logs

```bash
# Logs API
kubectl logs -f -n <namespace> -l app=sdthai-api

# Logs Web
kubectl logs -f -n <namespace> -l app=sdthai-web

# Logs récents de tous les pods
kubectl logs -n <namespace> --all-containers --tail=100
```

### Health Checks

- **API**: `/api/health` (liveness et readiness)
- **Web**: `/` (liveness et readiness)
- Délai initial: 30s (liveness), 10s (readiness)
- Vérification toutes les 10s (liveness), 5s (readiness)

## Auto-scaling (Production uniquement)

### HPA Configuration

**API:**
- Min: 3 replicas
- Max: 10 replicas
- CPU target: 70%
- Memory target: 80%

**Web:**
- Min: 2 replicas
- Max: 5 replicas
- CPU target: 70%
- Memory target: 80%

### Comportement de scaling

**Scale Up (augmentation):**
- Très rapide: 100% en 30 secondes
- Maximum 2 pods en 30s
- Pas de stabilisation (0s)

**Scale Down (diminution):**
- Progressif: 50% en 60 secondes
- Stabilisation de 5 minutes
- Évite les fluctuations

## High Availability (Production)

### Pod Anti-Affinity

Les pods sont distribués sur différents nodes pour la haute disponibilité:
```yaml
podAntiAffinity:
  preferredDuringSchedulingIgnoredDuringExecution:
  - weight: 100
    podAffinityTerm:
      topologyKey: kubernetes.io/hostname
```

### Rolling Update Strategy

Déploiement sans interruption:
- `maxSurge: 1` - Un pod supplémentaire pendant le déploiement
- `maxUnavailable: 0` - Aucun pod indisponible pendant le déploiement

## Troubleshooting

### Pods ne démarrent pas

```bash
kubectl describe pod <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace>
kubectl get events -n <namespace> --sort-by='.lastTimestamp'
```

### Ingress ne fonctionne pas

```bash
kubectl describe ingress -n <namespace>
kubectl get certificate -n <namespace>
kubectl logs -n cert-manager -l app=cert-manager
```

### HPA ne scale pas

```bash
kubectl describe hpa -n <namespace>
kubectl top pods -n <namespace>
kubectl top nodes
```

### Secrets manquants

```bash
kubectl get secrets -n <namespace>
./create-secrets.sh <env>
```

## Améliorations futures

### À implémenter

- [ ] Network Policies pour isolation réseau
- [ ] PodDisruptionBudget pour maintenance
- [ ] ResourceQuotas au niveau namespace
- [ ] ServiceMonitor pour Prometheus Operator
- [ ] Liveness/Readiness probes plus avancées
- [ ] Init containers pour migrations DB
- [ ] Sidecar containers pour logging
- [ ] Backup automatique des secrets
- [ ] GitOps avec ArgoCD/FluxCD
- [ ] Helm charts comme alternative à Kustomize

### Optimisations

- [ ] Cache Redis partagé entre pods
- [ ] CDN pour le frontend
- [ ] Database connection pooling
- [ ] Image optimization (multi-stage builds)
- [ ] Persistent volumes pour uploads
- [ ] Session affinity pour WebSockets

## Références

- [Kustomize Documentation](https://kustomize.io/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Traefik Ingress](https://doc.traefik.io/traefik/providers/kubernetes-ingress/)
- [Cert-Manager](https://cert-manager.io/)
- [HPA Documentation](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
