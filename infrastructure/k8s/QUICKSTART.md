# Guide de Démarrage Rapide - SD Thai Food Kubernetes

Ce guide vous permet de déployer rapidement l'application SD Thai Food sur Kubernetes.

## Prérequis

- Cluster Kubernetes configuré et accessible
- `kubectl` installé et configuré
- Cert-manager installé sur le cluster
- Traefik Ingress Controller installé sur le cluster
- Accès en écriture au cluster

## Déploiement en 5 minutes

### 1. Créer les secrets (2 min)

```bash
cd /home/ubuntu/projects/sdthai/infrastructure/k8s

# Pour dev
./create-secrets.sh dev

# Pour prod
./create-secrets.sh prod
```

Choisissez l'option 1 (génération automatique) pour aller vite.

### 2. Prévisualiser les manifestes (30s)

```bash
# Dev
./deploy.sh dev preview | less

# Prod
./deploy.sh prod preview | less
```

Vérifiez que les ressources sont correctes.

### 3. Déployer en dev (1 min)

```bash
./deploy.sh dev apply
```

Le script va:
- Vérifier les secrets
- Appliquer les manifestes
- Suivre le déploiement
- Afficher le status

### 4. Vérifier le déploiement (1 min)

```bash
# Status complet
./deploy.sh dev status

# Logs API
kubectl logs -f -n sdthai-dev -l app=sdthai-api

# Logs Web
kubectl logs -f -n sdthai-dev -l app=sdthai-web
```

### 5. Accéder à l'application (30s)

**Dev:**
- Frontend: https://sdthai-dev.secuaas.dev
- API: https://api-sdthai-dev.secuaas.dev

**Prod:**
- Frontend: https://sdthai.ch ou https://www.sdthai.ch
- API: https://api.sdthai.ch

## Commandes essentielles

### Déploiement

```bash
# Dev
./deploy.sh dev apply

# Prod
./deploy.sh prod apply
```

### Status

```bash
# Dev
./deploy.sh dev status

# Prod
./deploy.sh prod status
```

### Logs

```bash
# API
kubectl logs -f -n sdthai-dev -l app=sdthai-api

# Web
kubectl logs -f -n sdthai-prod -l app=sdthai-web

# Tous les pods
kubectl logs -n sdthai-prod --all-containers --tail=100
```

### Mise à jour

```bash
# Modifier les fichiers nécessaires
# Puis appliquer

./deploy.sh <env> apply
```

### Rollback

```bash
kubectl rollout undo deployment/prod-sdthai-api -n sdthai-prod
kubectl rollout undo deployment/prod-sdthai-web -n sdthai-prod
```

### Suppression

```bash
# Dev
./deploy.sh dev delete

# Prod
./deploy.sh prod delete
```

## Commandes kubectl directes

Si vous préférez utiliser kubectl directement:

### Déploiement

```bash
# Dev
kubectl apply -k infrastructure/k8s/overlays/dev

# Prod
kubectl apply -k infrastructure/k8s/overlays/prod
```

### Status

```bash
# Tout voir
kubectl get all -n sdthai-dev

# Pods
kubectl get pods -n sdthai-dev

# Deployments
kubectl get deployments -n sdthai-dev

# Services
kubectl get services -n sdthai-dev

# Ingress
kubectl get ingress -n sdthai-dev

# HPA (prod uniquement)
kubectl get hpa -n sdthai-prod
```

### Logs

```bash
kubectl logs -f deployment/dev-sdthai-api -n sdthai-dev
kubectl logs -f deployment/dev-sdthai-web -n sdthai-dev
```

### Describe

```bash
kubectl describe deployment/dev-sdthai-api -n sdthai-dev
kubectl describe ingress/dev-sdthai-ingress -n sdthai-dev
```

### Scale manuel

```bash
kubectl scale deployment/prod-sdthai-api --replicas=5 -n sdthai-prod
```

### Port-forward (dev local)

```bash
# API
kubectl port-forward svc/dev-sdthai-api 3000:3000 -n sdthai-dev

# Web
kubectl port-forward svc/dev-sdthai-web 3001:3000 -n sdthai-dev
```

## Résolution de problèmes rapide

### Les pods ne démarrent pas

```bash
# Voir les événements
kubectl get events -n sdthai-dev --sort-by='.lastTimestamp'

# Describe le pod
kubectl describe pod <pod-name> -n sdthai-dev

# Voir les logs
kubectl logs <pod-name> -n sdthai-dev
```

### L'ingress ne fonctionne pas

```bash
# Vérifier l'ingress
kubectl describe ingress -n sdthai-dev

# Vérifier le certificat
kubectl get certificate -n sdthai-dev

# Logs cert-manager
kubectl logs -n cert-manager -l app=cert-manager
```

### Les secrets sont manquants

```bash
# Vérifier
kubectl get secrets -n sdthai-dev

# Recréer
./create-secrets.sh dev
```

### HPA ne scale pas (prod)

```bash
# Vérifier HPA
kubectl describe hpa -n sdthai-prod

# Vérifier métriques
kubectl top pods -n sdthai-prod
kubectl top nodes

# Vérifier metrics-server
kubectl get deployment metrics-server -n kube-system
```

## Configuration des images Docker

Avant le déploiement, mettez à jour l'URL du registry dans les kustomization.yaml:

**Dev:**
```yaml
# infrastructure/k8s/overlays/dev/kustomization.yaml
images:
- name: registry/sdthai-api
  newName: votre-registry.com/sdthai-api  # Modifier ici
  newTag: dev
- name: registry/sdthai-web
  newName: votre-registry.com/sdthai-web  # Modifier ici
  newTag: dev
```

**Prod:**
```yaml
# infrastructure/k8s/overlays/prod/kustomization.yaml
images:
- name: registry/sdthai-api
  newName: votre-registry.com/sdthai-api  # Modifier ici
  newTag: latest
- name: registry/sdthai-web
  newName: votre-registry.com/sdthai-web  # Modifier ici
  newTag: latest
```

## Configuration de la base de données

Mettez à jour les URLs de connexion dans les kustomization.yaml:

**Dev:**
```yaml
# infrastructure/k8s/overlays/dev/kustomization.yaml
configMapGenerator:
- name: sdthai-api-config
  behavior: merge
  literals:
  - DATABASE_URL=postgresql://user:password@host:5432/sdthai_dev  # Modifier ici
  - REDIS_URL=redis://redis-host:6379/1  # Modifier ici
```

**Prod:**
```yaml
# infrastructure/k8s/overlays/prod/kustomization.yaml
configMapGenerator:
- name: sdthai-api-config
  behavior: merge
  literals:
  - DATABASE_URL=postgresql://user:password@host:5432/sdthai_prod  # Modifier ici
  - REDIS_URL=redis://redis-host:6379/0  # Modifier ici
```

## Workflow complet de déploiement

1. **Configuration initiale:**
   ```bash
   # Mettre à jour les images et DB URLs dans les kustomization.yaml
   # Voir sections ci-dessus
   ```

2. **Créer les secrets:**
   ```bash
   ./create-secrets.sh dev
   ./create-secrets.sh prod
   ```

3. **Prévisualiser:**
   ```bash
   ./deploy.sh dev preview
   ./deploy.sh prod preview
   ```

4. **Déployer en dev:**
   ```bash
   ./deploy.sh dev apply
   ```

5. **Tester en dev:**
   ```bash
   curl https://api-sdthai-dev.secuaas.dev/api/health
   curl https://sdthai-dev.secuaas.dev
   ```

6. **Vérifier les logs:**
   ```bash
   ./deploy.sh dev status
   kubectl logs -f -n sdthai-dev -l app=sdthai-api
   ```

7. **Déployer en prod (après validation):**
   ```bash
   ./deploy.sh prod apply
   ```

8. **Vérifier le scaling (prod):**
   ```bash
   kubectl get hpa -n sdthai-prod
   kubectl top pods -n sdthai-prod
   ```

## Ressources créées

### Dev (sdthai-dev)
- 1 Namespace
- 2 ConfigMaps (API + Web)
- 1 Secret (API)
- 2 Deployments (API + Web, 1 replica chacun)
- 2 Services (API + Web)
- 1 Ingress

**Total: 9 ressources**

### Prod (sdthai-prod)
- 1 Namespace
- 2 ConfigMaps (API + Web)
- 1 Secret (API)
- 2 Deployments (API 3+ replicas + Web 2+ replicas)
- 2 Services (API + Web)
- 2 HPA (API + Web)
- 1 Ingress

**Total: 11 ressources**

## Checklist avant déploiement

- [ ] Cluster Kubernetes accessible
- [ ] kubectl configuré
- [ ] Cert-manager installé
- [ ] Traefik Ingress installé
- [ ] URLs des images Docker configurées
- [ ] URLs de base de données configurées
- [ ] Secrets créés
- [ ] Manifestes prévisualisés
- [ ] DNS configurés (pour prod)

## Support

Pour plus d'informations:
- README.md - Documentation complète
- STRUCTURE.md - Architecture détaillée
- Scripts: deploy.sh, create-secrets.sh

## Prochaines étapes

Après le déploiement:
1. Configurer le monitoring (Prometheus/Grafana)
2. Configurer les alertes
3. Mettre en place les backups
4. Configurer le CI/CD
5. Implémenter les Network Policies
6. Configurer les PodDisruptionBudgets
