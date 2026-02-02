# SD Thai Food - Kubernetes Infrastructure

Infrastructure Kubernetes complète pour SD Thai Food utilisant Kustomize pour la gestion multi-environnements.

## Structure

```
infrastructure/k8s/
├── base/                          # Configuration de base
│   ├── namespace.yaml             # Namespace par défaut
│   ├── api/                       # Backend API
│   │   ├── deployment.yaml        # Déploiement API
│   │   ├── service.yaml           # Service API
│   │   ├── configmap.yaml         # Configuration API
│   │   └── kustomization.yaml     # Kustomize API
│   ├── web/                       # Frontend Web
│   │   ├── deployment.yaml        # Déploiement Web
│   │   ├── service.yaml           # Service Web
│   │   ├── configmap.yaml         # Configuration Web
│   │   └── kustomization.yaml     # Kustomize Web
│   ├── ingress.yaml               # Ingress Traefik
│   └── kustomization.yaml         # Kustomize base
└── overlays/                      # Configurations par environnement
    ├── dev/                       # Environnement développement
    │   ├── kustomization.yaml     # Config dev
    │   ├── api-patch.yaml         # Patch API dev
    │   ├── web-patch.yaml         # Patch Web dev
    │   └── ingress-patch.yaml     # Patch Ingress dev
    └── prod/                      # Environnement production
        ├── kustomization.yaml     # Config prod
        ├── api-patch.yaml         # Patch API prod (avec HPA)
        ├── web-patch.yaml         # Patch Web prod (avec HPA)
        └── ingress-patch.yaml     # Patch Ingress prod
```

## Environnements

### Développement (dev)

- **Namespace**: `sdthai-dev`
- **Domaines**:
  - Frontend: `sdthai-dev.secuaas.dev`
  - API: `api-sdthai-dev.secuaas.dev`
- **Réplicas**:
  - API: 1
  - Web: 1
- **Image Tag**: `dev`
- **Logs**: Debug level

### Production (prod)

- **Namespace**: `sdthai-prod`
- **Domaines**:
  - Frontend: `sdthai.ch`, `www.sdthai.ch`
  - API: `api.sdthai.ch`
- **Réplicas**:
  - API: 3 (min) - 10 (max) avec HPA
  - Web: 2 (min) - 5 (max) avec HPA
- **Image Tag**: `latest`
- **Logs**: Info level
- **Features**:
  - HPA (Horizontal Pod Autoscaler)
  - Pod Anti-Affinity
  - Prometheus metrics
  - Security middlewares

## Déploiement

### Prérequis

1. Cluster Kubernetes configuré
2. `kubectl` installé et configuré
3. `kustomize` installé (ou utiliser `kubectl apply -k`)
4. Cert-manager installé pour les certificats TLS
5. Traefik Ingress Controller installé

### Commandes de déploiement

#### Développement

```bash
# Aperçu des manifestes
kubectl kustomize infrastructure/k8s/overlays/dev

# Déploiement
kubectl apply -k infrastructure/k8s/overlays/dev

# Vérification
kubectl get all -n sdthai-dev
kubectl get ingress -n sdthai-dev
```

#### Production

```bash
# Aperçu des manifestes
kubectl kustomize infrastructure/k8s/overlays/prod

# Déploiement
kubectl apply -k infrastructure/k8s/overlays/prod

# Vérification
kubectl get all -n sdthai-prod
kubectl get ingress -n sdthai-prod
kubectl get hpa -n sdthai-prod
```

### Avec SecuOps (OBLIGATOIRE pour k8s-dev/k8s-prod)

```bash
# Développement
secuops deploy -f infrastructure/k8s/overlays/dev -n sdthai-dev

# Production
secuops deploy -f infrastructure/k8s/overlays/prod -n sdthai-prod
```

## Configuration

### Secrets requis

Les secrets suivants doivent être créés manuellement avant le déploiement:

#### Développement

```bash
kubectl create secret generic sdthai-api-secrets \
  --from-literal=JWT_SECRET=your-dev-jwt-secret \
  --from-literal=JWT_REFRESH_SECRET=your-dev-refresh-secret \
  -n sdthai-dev
```

#### Production

```bash
kubectl create secret generic sdthai-api-secrets \
  --from-literal=JWT_SECRET=your-prod-jwt-secret \
  --from-literal=JWT_REFRESH_SECRET=your-prod-refresh-secret \
  -n sdthai-prod
```

### ConfigMaps

Les ConfigMaps sont générés automatiquement par Kustomize. Pour modifier les valeurs:

1. **Base**: Modifier `base/api/configmap.yaml` ou `base/web/configmap.yaml`
2. **Overlays**: Les valeurs sont surchargées dans `overlays/{env}/kustomization.yaml`

## Ressources

### API (Backend)

- **Image**: `registry/sdthai-api:latest` (ou `dev`)
- **Port**: 3000
- **Health Check**: `/api/health`
- **Resources**:
  - Requests: 256Mi RAM, 200m CPU
  - Limits: 512Mi RAM, 500m CPU

### Web (Frontend)

- **Image**: `registry/sdthai-web:latest` (ou `dev`)
- **Port**: 3000
- **Health Check**: `/`
- **Resources**:
  - Requests: 256Mi RAM, 200m CPU
  - Limits: 512Mi RAM, 500m CPU

## HPA (Production uniquement)

### API HPA

- **Min replicas**: 3
- **Max replicas**: 10
- **Métriques**:
  - CPU: 70%
  - Memory: 80%

### Web HPA

- **Min replicas**: 2
- **Max replicas**: 5
- **Métriques**:
  - CPU: 70%
  - Memory: 80%

## Ingress

### Annotations Traefik

- Redirection HTTPS automatique
- Certificats TLS via cert-manager (Let's Encrypt)
- Compression (prod)
- Security headers (prod)

### Certificats TLS

Les certificats sont gérés automatiquement par cert-manager avec l'annotation:
```yaml
cert-manager.io/cluster-issuer: "letsencrypt-prod"
```

## Monitoring

En production, les pods exposent des métriques Prometheus sur le port 3000:
- **API**: `/metrics`
- **Web**: Page d'accueil

## Commandes utiles

```bash
# Logs
kubectl logs -f deployment/sdthai-api -n sdthai-dev
kubectl logs -f deployment/sdthai-web -n sdthai-prod

# Scale manuel
kubectl scale deployment sdthai-api --replicas=5 -n sdthai-prod

# Port-forward (dev local)
kubectl port-forward svc/sdthai-api 3000:3000 -n sdthai-dev
kubectl port-forward svc/sdthai-web 3001:3000 -n sdthai-dev

# Describe
kubectl describe ingress sdthai-ingress -n sdthai-prod
kubectl describe hpa sdthai-api-hpa -n sdthai-prod

# Events
kubectl get events -n sdthai-prod --sort-by='.lastTimestamp'
```

## Rollback

```bash
# Voir l'historique
kubectl rollout history deployment/sdthai-api -n sdthai-prod

# Rollback
kubectl rollout undo deployment/sdthai-api -n sdthai-prod
kubectl rollout undo deployment/sdthai-web -n sdthai-prod
```

## Mise à jour

```bash
# Modifier les fichiers nécessaires
# Puis appliquer les changements

# Dev
kubectl apply -k infrastructure/k8s/overlays/dev

# Prod
kubectl apply -k infrastructure/k8s/overlays/prod

# Suivre le déploiement
kubectl rollout status deployment/sdthai-api -n sdthai-prod
```

## Troubleshooting

### Pods ne démarrent pas

```bash
kubectl describe pod <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace>
```

### Ingress ne fonctionne pas

```bash
kubectl describe ingress sdthai-ingress -n <namespace>
kubectl get certificate -n <namespace>
```

### HPA ne scale pas

```bash
kubectl describe hpa sdthai-api-hpa -n sdthai-prod
kubectl top pods -n sdthai-prod
```

## Sécurité

1. Les secrets doivent être créés manuellement (jamais versionnés)
2. DATABASE_URL doit être mis à jour avec les vraies credentials
3. Les certificats TLS sont auto-renouvelés par cert-manager
4. En production, utiliser des middlewares Traefik pour la sécurité

## Notes

- Les fichiers de base sont partagés entre dev et prod
- Les overlays surchargent uniquement les différences
- Les ConfigMaps sont générés avec des hash pour forcer les redéploiements
- Les HPA sont activés uniquement en production
- Pod Anti-Affinity assure la distribution sur différents nodes (prod)
