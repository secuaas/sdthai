# Quick Start - SD Thai Food Web

Guide de démarrage rapide pour l'application web.

## Prérequis

- Node.js 20+ installé
- Backend NestJS en cours d'exécution sur `http://localhost:3000`

## Installation

```bash
# 1. Se placer dans le dossier web
cd /home/ubuntu/projects/sdthai/apps/web

# 2. Installer les dépendances
npm install

# 3. Créer le fichier de configuration
cp .env.example .env.local

# 4. (Optionnel) Éditer .env.local si besoin
# nano .env.local
```

## Développement

### Méthode 1: Script automatique
```bash
./scripts/dev.sh
```

### Méthode 2: Commande npm
```bash
npm run dev
```

L'application sera disponible sur: **http://localhost:3001**

## Build de Production

### Méthode 1: Script automatique
```bash
./scripts/build.sh
```

### Méthode 2: Commandes manuelles
```bash
# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Démarrer en production
npm start
```

## Comptes de Test

Pour tester l'application, utilisez les comptes créés par le backend:

### Admin
- Email: `admin@sdthai.com`
- Password: `Admin123!`

### Partenaire
- Email: `partner@restaurant.com`
- Password: `Partner123!`

## Structure de l'Application

### Pages Publiques
- `/` → Redirige vers `/produits`
- `/produits` → Liste des produits
- `/produits/[id]` → Détail d'un produit
- `/login` → Page de connexion

### Espace Partenaire (après connexion en tant que partenaire)
- `/partner/dashboard` → Dashboard avec statistiques
- `/partner/commandes` → Liste des commandes
- `/partner/commandes/nouvelle` → Créer une commande

### Espace Admin (après connexion en tant qu'admin)
- `/admin/dashboard` → Dashboard admin
- `/admin/partenaires` → Gestion des partenaires
- `/admin/produits` → Gestion des produits
- `/admin/commandes` → Gestion des commandes

## Technologies Utilisées

- **Next.js 14** avec App Router
- **TypeScript** pour le typage statique
- **Tailwind CSS** pour le styling
- **shadcn/ui** pour les composants UI
- **Axios** pour les appels API
- **React Context** pour l'authentification

## Déploiement Docker

### Build de l'image
```bash
make docker-build TAG=v1.0.0
```

### Push vers le registre
```bash
make docker-push TAG=v1.0.0
```

### Run localement
```bash
make docker-run
```

## Déploiement Kubernetes

### Déployer sur K8s
```bash
# IMPORTANT: Utiliser secuops pour toute opération K8s
secuops apply -f k8s/
```

### Vérifier le déploiement
```bash
secuops get pods,svc,ingress -n sdthai
```

### Voir les logs
```bash
make k8s-logs
```

### Redémarrer le déploiement
```bash
make k8s-restart
```

## Configuration

### Variables d'Environnement

#### Développement (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="SD Thai Food"
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

#### Production (Kubernetes ConfigMap)
```env
NEXT_PUBLIC_API_URL=http://sdthai-api:3000
NEXT_PUBLIC_APP_NAME="SD Thai Food"
NEXT_PUBLIC_APP_URL=https://sdthai.secuaas.com
```

## Troubleshooting

### L'API ne répond pas
Vérifier que le backend est bien lancé:
```bash
curl http://localhost:3000/api/health
```

### Erreur de compilation TypeScript
```bash
# Nettoyer et réinstaller
rm -rf node_modules .next
npm install
npm run build
```

### Erreur 401 lors de l'authentification
Vérifier que:
1. Le backend est accessible
2. Les credentials sont corrects
3. Le CORS est configuré sur le backend

### Port 3001 déjà utilisé
Changer le port dans package.json:
```json
"dev": "next dev -p 3002"
```

## Commandes Utiles

```bash
# Développement
npm run dev              # Lancer le dev server
npm run build           # Build de production
npm start               # Lancer en production
npm run lint            # Linter le code
npm run type-check      # Vérifier les types

# Docker
make docker-build       # Build l'image Docker
make docker-push        # Push l'image
make docker-run         # Run localement

# Kubernetes
make k8s-deploy        # Déployer
make k8s-logs          # Voir les logs
make k8s-status        # Voir le status
make k8s-restart       # Redémarrer
```

## Architecture

Voir [ARCHITECTURE.md](./ARCHITECTURE.md) pour plus de détails sur:
- Structure des routes
- Gestion de l'authentification
- API Client
- Composants UI
- Déploiement K8s

## Support

En cas de problème:
1. Vérifier les logs du backend
2. Vérifier la console navigateur
3. Vérifier les variables d'environnement
4. Consulter ARCHITECTURE.md

## Next Steps

Une fois l'application lancée:
1. Se connecter avec un compte test
2. Explorer les différentes pages
3. Tester la création d'une commande
4. Vérifier le dashboard admin

Bon développement! 🚀
