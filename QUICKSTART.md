# SD Thai Food - Guide de Démarrage Rapide

Ce guide vous permet de démarrer le projet en **moins de 10 minutes**.

---

## Prérequis

- **Node.js**: 20+
- **pnpm**: 8.15.4+
- **Docker & Docker Compose**: Pour la base de données locale
- **Git**: Pour le versioning

---

## Installation

### 1. Cloner le projet

```bash
git clone git@github.com:secuaas/sdthai.git
cd sdthai
```

### 2. Installer les dépendances

```bash
# Installer pnpm si nécessaire
npm install -g pnpm@8.15.4

# Installer toutes les dépendances du monorepo
pnpm install
```

### 3. Configurer l'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer .env avec vos valeurs
# Les valeurs par défaut fonctionnent pour le dev local
```

### 4. Démarrer l'infrastructure (PostgreSQL + Redis)

```bash
cd infrastructure/docker
docker-compose up -d postgres redis

# Vérifier que les services sont running
docker-compose ps
```

### 5. Initialiser la base de données

```bash
# Retourner à la racine
cd ../..

# Générer le client Prisma
pnpm db:generate

# Lancer les migrations
cd packages/prisma
pnpm prisma migrate dev --name init

# (Optionnel) Seed avec des données de test
pnpm db:seed
```

### 6. Démarrer les applications

```bash
# Retourner à la racine
cd ../..

# Démarrer API + Web en parallèle
pnpm dev
```

**Accès:**
- **API**: http://localhost:3000
- **Web**: http://localhost:3001
- **API Health**: http://localhost:3000/api/health
- **API Docs**: http://localhost:3000/api/docs (si Swagger activé)

---

## Accès aux Outils de Développement

Avec docker-compose complet:

```bash
cd infrastructure/docker
docker-compose up -d
```

**Outils disponibles:**
- **Adminer** (PostgreSQL UI): http://localhost:8080
- **Redis Commander**: http://localhost:8081
- **Prisma Studio**: `cd packages/prisma && pnpm prisma studio` → http://localhost:5555

---

## Commandes Utiles

### Développement

```bash
# Démarrer en mode dev (hot reload)
pnpm dev

# Démarrer seulement l'API
cd apps/api && pnpm dev

# Démarrer seulement le Web
cd apps/web && pnpm dev

# Linter
pnpm lint

# Tests
pnpm test
```

### Base de Données

```bash
# Générer le client Prisma après modification du schema
pnpm db:generate

# Créer une nouvelle migration
cd packages/prisma
pnpm prisma migrate dev --name description_changement

# Appliquer les migrations en prod
pnpm prisma migrate deploy

# Ouvrir Prisma Studio
pnpm prisma studio

# Reset la DB (⚠️ Supprime toutes les données)
pnpm prisma migrate reset
```

### Build

```bash
# Build tout le projet
pnpm build

# Build seulement l'API
cd apps/api && pnpm build

# Build seulement le Web
cd apps/web && pnpm build
```

### Docker

```bash
# Build des images Docker
docker build -f apps/api/Dockerfile -t sdthai-api .
docker build -f apps/web/Dockerfile -t sdthai-web .

# Démarrer avec docker-compose (infra + apps)
cd infrastructure/docker
docker-compose up -d

# Voir les logs
docker-compose logs -f api
docker-compose logs -f web

# Arrêter
docker-compose down
```

---

## Vérification de l'Installation

### Test API

```bash
# Health check
curl http://localhost:3000/api/health

# Devrait retourner:
# {"status":"ok","timestamp":"..."}
```

### Test Frontend

```bash
# Homepage
curl http://localhost:3001

# Devrait retourner le HTML de la page
```

---

## Structure du Projet

```
sdthai/
├── apps/
│   ├── api/              # Backend NestJS
│   ├── web/              # Frontend Next.js
│   └── mobile/           # App Flutter (future)
├── packages/
│   ├── prisma/           # Schema DB et migrations
│   ├── shared/           # Types partagés
│   └── ui/               # Composants UI partagés
├── infrastructure/
│   ├── docker/           # Docker Compose dev
│   └── k8s/              # Manifests Kubernetes
├── .github/
│   └── workflows/        # CI/CD GitHub Actions
├── pnpm-workspace.yaml   # Configuration monorepo
├── turbo.json            # Configuration Turborepo
└── package.json          # Scripts racine
```

---

## Premiers Pas - Créer un Utilisateur Admin

### Via Prisma Studio

1. Ouvrir Prisma Studio: `cd packages/prisma && pnpm prisma studio`
2. Aller dans la table `User`
3. Créer un nouvel utilisateur:
   - email: admin@sdthai.ch
   - passwordHash: (généré avec bcrypt - voir section suivante)
   - role: SUPER_ADMIN
   - isActive: true

### Générer un Hash de Mot de Passe

```bash
# Installer bcrypt-cli
npm install -g bcrypt-cli

# Hasher un mot de passe
bcrypt-cli "MonMotDePasse123!" 10

# Copier le hash généré dans passwordHash
```

Ou avec Node.js:

```javascript
const bcrypt = require('bcrypt');
bcrypt.hash('MonMotDePasse123!', 10, (err, hash) => {
  console.log(hash);
});
```

---

## Login API

```bash
# POST /api/auth/login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sdthai.ch",
    "password": "MonMotDePasse123!"
  }'

# Réponse:
# {
#   "accessToken": "eyJhbGc...",
#   "refreshToken": "eyJhbGc...",
#   "user": { ... }
# }
```

---

## Prochaines Étapes

1. **Consulter l'architecture**: Lire `ARCHITECTURE.md` pour comprendre le système
2. **Consulter l'analyse technique**: Lire `ARCHITECTURE_ANALYSIS.md` pour les détails K8s
3. **Explorer l'API**: Tester les endpoints avec Postman ou curl
4. **Modifier le frontend**: Les pages sont dans `apps/web/app/`
5. **Ajouter des fonctionnalités**: Suivre la structure des modules existants

---

## Problèmes Courants

### Port déjà utilisé

```bash
# Vérifier les ports
lsof -i :3000
lsof -i :3001
lsof -i :5432

# Tuer le processus
kill -9 <PID>
```

### Erreur de connexion DB

```bash
# Vérifier que PostgreSQL tourne
docker-compose ps postgres

# Vérifier les logs
docker-compose logs postgres

# Redémarrer
docker-compose restart postgres
```

### Erreur Prisma Client

```bash
# Régénérer le client
pnpm db:generate

# Reconstruire
pnpm build
```

### Cache pnpm corrompu

```bash
# Nettoyer le cache
pnpm store prune

# Réinstaller
rm -rf node_modules
pnpm install
```

---

## Support

- **Documentation**: `ARCHITECTURE.md`, `ARCHITECTURE_ANALYSIS.md`
- **Issues GitHub**: https://github.com/secuaas/sdthai/issues
- **Logs**: `docker-compose logs -f`

---

Bon développement! 🚀
