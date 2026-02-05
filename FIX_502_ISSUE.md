# Fix 502 Bad Gateway Issue - SD Thai Food

## Problème

L'API retourne une erreur 502 Bad Gateway bien que l'application fonctionne correctement (visible dans les logs).

## Cause

Le service Kubernetes existant conserve l'ancienne configuration avec `targetPort: 8080` alors que l'application écoute sur le port 3000. La commande `kubectl apply` ne met pas à jour le targetPort d'un service existant.

## Vérification

```bash
# Vérifier les logs de l'application (fonctionne correctement)
secuops logs -a sdthai -e k8s-dev | tail -20

# Vous devriez voir:
# Application is running on: http://localhost:3000
# API is available at: http://localhost:3000/api
```

## Solution

### Étape 1: Supprimer le service existant

```bash
kubectl delete service sdthai -n sdthai
```

**Note**: Cela causera une interruption temporaire (environ 30 secondes).

### Étape 2: Redéployer pour recréer le service

```bash
secuops deploy -a sdthai -e k8s-dev
```

Le service sera recréé avec la bonne configuration (`targetPort: 3000`).

### Étape 3: Vérifier que l'API fonctionne

```bash
# Attendre 30 secondes que le déploiement soit prêt
sleep 30

# Tester l'API
curl https://sdthai.secuaas.dev/api/health
```

Vous devriez obtenir:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-02-05T..."
}
```

### Étape 4: Tester Swagger UI

Une fois l'API accessible, visitez:
- **Swagger UI**: https://sdthai.secuaas.dev/api/docs
- **OpenAPI JSON**: https://sdthai.secuaas.dev/api/docs-json

## Alternative (si kubectl n'est pas disponible)

Si vous n'avez pas accès à `kubectl`, contactez l'administrateur Kubernetes pour qu'il exécute:

```bash
kubectl delete service sdthai -n sdthai && \
kubectl apply -f /chemin/vers/deploy-k8s.yaml
```

## Prévention Future

Ce problème est maintenant résolu de manière permanente dans le manifest `deploy-k8s.yaml`. Tous les futurs déploiements propres (sans service existant) utiliseront automatiquement le bon port.

## Configuration Correcte

Le fichier `deploy-k8s.yaml` contient maintenant:

```yaml
# Deployment
ports:
- containerPort: 3000  ✅
env:
- name: PORT
  value: "3000"        ✅

# Service
ports:
- protocol: TCP
  port: 80
  targetPort: 3000     ✅
```

## État Actuel

- ✅ Application fonctionne correctement (port 3000)
- ✅ Manifest corrigé de manière permanente
- ✅ Swagger/OpenAPI intégré et prêt
- ⚠️  Service Kubernetes à recréer (action manuelle requise)

## Contact

Pour toute question, consultez:
- `VERSION.md` - Historique des versions
- `WORK_IN_PROGRESS.md` - État actuel du projet
- `SWAGGER.md` - Guide d'utilisation de l'API

---

**Version**: 0.4.2
**Date**: 2026-02-05
**Priorité**: Moyenne (l'application fonctionne, seul l'accès externe est bloqué)
