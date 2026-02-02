# Getting Started - SD Thai Food Platform

> **Pour développeurs** - Guide pratique pour commencer à travailler sur le projet

---

## 🎯 Objectif

Ce guide vous aide à configurer votre environnement de développement local et à comprendre le workflow du projet en **moins de 15 minutes**.

---

## ⚡ Installation Rapide

### Prérequis

Vérifiez que vous avez installé:

```bash
node --version    # v20.0.0 ou supérieur
pnpm --version    # v8.15.4 ou supérieur
docker --version  # v24.0.0 ou supérieur
git --version     # v2.40.0 ou supérieur
```

Si pnpm n'est pas installé:

```bash
npm install -g pnpm@8.15.4
```

### Étape 1: Cloner le Projet

```bash
git clone git@github.com:secuaas/sdthai.git
cd sdthai
```

### Étape 2: Installer les Dépendances

```bash
# Installer toutes les dépendances du monorepo
pnpm install
```

Cette commande installe les dépendances pour:
- `apps/api` (NestJS backend)
- `apps/web` (Next.js frontend)
- `packages/prisma` (Database schema)
- `packages/shared` (Types partagés)

### Étape 3: Configuration Environnement

```bash
# Copier le template d'environnement
cp .env.example .env

# Éditer si nécessaire (les valeurs par défaut fonctionnent pour le dev local)
nano .env
```

**Valeurs importantes** (déjà configurées dans .env.example):

```env
DATABASE_URL="postgresql://sdthai:password@localhost:5432/sdthai?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key-minimum-32-characters-required-change-me"
JWT_REFRESH_SECRET="your-refresh-secret-key-minimum-32-characters-required-change-me"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

### Étape 4: Démarrer l'Infrastructure

```bash
# Démarrer PostgreSQL et Redis avec Docker
cd infrastructure/docker
docker-compose up -d postgres redis

# Vérifier que les conteneurs tournent
docker-compose ps

# Retourner à la racine
cd ../..
```

**Attendez 5-10 secondes** que PostgreSQL soit prêt.

### Étape 5: Initialiser la Base de Données

```bash
# Générer le client Prisma
pnpm db:generate

# Créer et appliquer les migrations
cd packages/prisma
pnpm prisma migrate dev --name init

# Seed avec des données de test
pnpm db:seed

# Retourner à la racine
cd ../..
```

**Données créées**:
- 4 utilisateurs (admin, partner, driver, user)
- 6 partenaires (3 types différents)
- 4 catégories (FR/DE/EN)
- 8 produits (curries, soupes, desserts)

### Étape 6: Démarrer les Applications

```bash
# Démarrer API + Web en mode dev (hot reload)
pnpm dev
```

Cette commande démarre:
- **API NestJS**: http://localhost:3000
- **Web Next.js**: http://localhost:3001

---

## ✅ Vérification Installation

### Test API

Ouvrir dans le navigateur ou avec curl:

```bash
# Health check
curl http://localhost:3000/api/health

# Devrait retourner:
# {"status":"ok","timestamp":"2026-02-02T...","uptime":...}
```

### Test Frontend

Ouvrir dans le navigateur:

```
http://localhost:3001
```

Vous devriez voir la homepage avec le catalogue de produits.

### Test Login

```
URL: http://localhost:3001/login

Credentials:
- Email: admin@sdthai.ch
- Password: Admin123!
```

Après login, vous êtes redirigé vers le dashboard admin.

---

## 🗂️ Structure du Projet

```
sdthai/
├── apps/
│   ├── api/                    # Backend NestJS
│   │   ├── src/
│   │   │   ├── modules/        # 12 modules métier
│   │   │   │   ├── auth/       # JWT authentication
│   │   │   │   ├── users/      # Gestion utilisateurs
│   │   │   │   ├── partners/   # Gestion partenaires
│   │   │   │   ├── products/   # Catalogue produits
│   │   │   │   ├── orders/     # Commandes
│   │   │   │   ├── stock/      # Stock FIFO
│   │   │   │   └── ...
│   │   │   ├── common/         # Guards, decorators, filters
│   │   │   └── main.ts         # Point d'entrée
│   │   └── package.json
│   │
│   ├── web/                    # Frontend Next.js 14
│   │   ├── app/
│   │   │   ├── (public)/       # Pages publiques
│   │   │   ├── (partner)/      # Portail partenaire
│   │   │   ├── (admin)/        # Back-office admin
│   │   │   └── login/          # Authentification
│   │   ├── components/         # Composants React
│   │   ├── lib/                # API client, utils
│   │   └── package.json
│   │
│   └── mobile/                 # App Flutter (future)
│
├── packages/
│   ├── prisma/                 # Schema DB + migrations
│   │   ├── schema.prisma       # 17 modèles de données
│   │   ├── migrations/         # Historique migrations
│   │   └── seed.ts             # Données de test
│   │
│   ├── shared/                 # Types TypeScript partagés
│   └── ui/                     # Composants UI partagés
│
├── infrastructure/
│   ├── docker/                 # Docker Compose dev
│   │   └── docker-compose.yml
│   └── k8s/                    # Kubernetes manifests
│       ├── base/               # Ressources de base
│       └── overlays/           # dev + prod
│
├── .github/
│   └── workflows/              # CI/CD pipelines
│
├── .env.example                # Template variables d'environnement
├── .secuops.yaml               # Configuration SecuOps
├── pnpm-workspace.yaml         # Configuration monorepo
├── turbo.json                  # Configuration Turborepo
└── package.json                # Scripts racine
```

---

## 🛠️ Commandes de Développement

### Développement

```bash
# Démarrer tout (API + Web)
pnpm dev

# Démarrer seulement l'API
cd apps/api && pnpm dev

# Démarrer seulement le Web
cd apps/web && pnpm dev

# Linter
pnpm lint

# Build production
pnpm build
```

### Base de Données

```bash
# Générer le client Prisma (après modification schema)
pnpm db:generate

# Créer une nouvelle migration
cd packages/prisma
pnpm prisma migrate dev --name description_du_changement

# Appliquer migrations (production)
pnpm prisma migrate deploy

# Ouvrir Prisma Studio (UI database)
pnpm prisma studio
# Accès: http://localhost:5555

# Reset DB (⚠️ Supprime toutes les données)
pnpm prisma migrate reset

# Seed à nouveau
pnpm db:seed
```

### Docker

```bash
cd infrastructure/docker

# Démarrer tout (postgres, redis, adminer, redis-commander)
docker-compose up -d

# Voir les logs
docker-compose logs -f api
docker-compose logs -f web

# Arrêter tout
docker-compose down

# Supprimer volumes (⚠️ Supprime les données)
docker-compose down -v
```

### Tests

```bash
# Tests unitaires (à implémenter)
pnpm test

# Tests E2E (à implémenter)
pnpm test:e2e

# Coverage (à implémenter)
pnpm test:cov
```

---

## 🔍 Outils de Développement

### Prisma Studio

Interface UI pour explorer la base de données:

```bash
cd packages/prisma
pnpm prisma studio
```

Accès: http://localhost:5555

**Utilisation**:
- Explorer les tables (User, Partner, Product, Order, etc.)
- Modifier les données manuellement
- Voir les relations entre modèles

### Adminer

Interface web pour PostgreSQL (alternative à pgAdmin):

```bash
cd infrastructure/docker
docker-compose up -d adminer
```

Accès: http://localhost:8080

**Connexion**:
- System: PostgreSQL
- Server: postgres
- Username: sdthai
- Password: password
- Database: sdthai

### Redis Commander

Interface web pour Redis:

```bash
cd infrastructure/docker
docker-compose up -d redis-commander
```

Accès: http://localhost:8081

### API Documentation (Swagger)

Si activé dans le code (à configurer):

```
http://localhost:3000/api/docs
```

---

## 📝 Workflow de Développement

### 1. Créer une Nouvelle Branche

```bash
git checkout -b feature/nom-de-la-feature
```

### 2. Faire vos Modifications

Exemple: Ajouter un nouveau champ au modèle Product

```prisma
// packages/prisma/schema.prisma
model Product {
  // ... champs existants
  newField String? // Nouveau champ
}
```

### 3. Mettre à Jour la Base de Données

```bash
# Générer migration
cd packages/prisma
pnpm prisma migrate dev --name add_product_new_field

# Le client Prisma est automatiquement régénéré
```

### 4. Implémenter la Logique Métier

```typescript
// apps/api/src/modules/products/products.service.ts
async updateProduct(id: string, dto: UpdateProductDto) {
  return this.prisma.product.update({
    where: { id },
    data: {
      ...dto,
      newField: dto.newField, // Nouveau champ
    },
  });
}
```

### 5. Mettre à Jour le Frontend

```typescript
// apps/web/app/(admin)/admin/products/page.tsx
// Afficher le nouveau champ dans l'interface
```

### 6. Tester

```bash
# Redémarrer le dev server si nécessaire
pnpm dev

# Tester manuellement dans le navigateur
# Ou écrire des tests automatisés (recommandé)
```

### 7. Commit et Push

```bash
git add .
git commit -m "feat: Add newField to Product model

- Add newField to Prisma schema
- Update ProductService to handle new field
- Update admin UI to display new field"

git push origin feature/nom-de-la-feature
```

### 8. Créer une Pull Request

Sur GitHub: https://github.com/secuaas/sdthai/pulls

---

## 🎓 Concepts Clés

### Monorepo (pnpm Workspaces)

Le projet utilise un monorepo pour partager du code entre apps:

```json
// pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**Avantages**:
- Partage types TypeScript entre API et Web
- Gestion centralisée des dépendances
- Build cache avec Turborepo

### Turborepo

Optimise les builds en parallèle:

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    }
  }
}
```

### Prisma ORM

**Schema-first** approach:

1. Définir schema: `packages/prisma/schema.prisma`
2. Créer migration: `prisma migrate dev`
3. Client auto-généré avec types TypeScript complets

**Exemple query**:

```typescript
const orders = await this.prisma.order.findMany({
  where: { partnerId: 'xxx' },
  include: {
    items: { include: { product: true } },
    partner: true,
  },
  orderBy: { createdAt: 'desc' },
});
```

### NestJS Modules

Architecture modulaire:

```typescript
@Module({
  imports: [PrismaModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
```

### Next.js App Router

File-based routing avec layouts:

```
app/
├── (public)/
│   ├── layout.tsx      # Layout public
│   └── products/
│       └── page.tsx    # /products
├── (admin)/
│   ├── layout.tsx      # Layout admin (avec sidebar)
│   └── admin/
│       └── dashboard/
│           └── page.tsx # /admin/dashboard
└── layout.tsx          # Root layout
```

---

## 🐛 Problèmes Courants

### Port déjà utilisé

**Erreur**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:

```bash
# Trouver le processus
lsof -i :3000

# Tuer le processus
kill -9 <PID>
```

### Erreur de connexion PostgreSQL

**Erreur**: `Error: Can't reach database server`

**Solutions**:

```bash
# Vérifier que PostgreSQL tourne
docker-compose ps postgres

# Redémarrer PostgreSQL
docker-compose restart postgres

# Voir les logs
docker-compose logs postgres
```

### Prisma Client pas à jour

**Erreur**: `PrismaClient is unable to run in this browser environment`

**Solution**:

```bash
# Régénérer le client
pnpm db:generate

# Rebuild
pnpm build
```

### pnpm install échoue

**Erreur**: `ERR_PNPM_PEER_DEP_ISSUES`

**Solution**:

```bash
# Nettoyer le cache
pnpm store prune

# Supprimer node_modules
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules

# Réinstaller
pnpm install
```

### Hot reload ne fonctionne pas

**Solution**:

```bash
# Redémarrer le dev server
# Ctrl+C puis:
pnpm dev

# Ou nettoyer et rebuild:
pnpm clean
pnpm build
pnpm dev
```

---

## 📚 Ressources Utiles

### Documentation Projet

- [QUICKSTART.md](./QUICKSTART.md) - Guide 10 minutes
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Spécifications complètes
- [API_ENDPOINTS_REFERENCE.md](./API_ENDPOINTS_REFERENCE.md) - Référence API
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Guide déploiement

### Documentation Externe

**NestJS**:
- Docs: https://docs.nestjs.com
- Guards: https://docs.nestjs.com/guards
- Pipes: https://docs.nestjs.com/pipes

**Next.js**:
- Docs: https://nextjs.org/docs
- App Router: https://nextjs.org/docs/app
- Server Components: https://nextjs.org/docs/app/building-your-application/rendering/server-components

**Prisma**:
- Docs: https://www.prisma.io/docs
- Schema: https://www.prisma.io/docs/concepts/components/prisma-schema
- Migrations: https://www.prisma.io/docs/concepts/components/prisma-migrate

**shadcn/ui**:
- Docs: https://ui.shadcn.com
- Components: https://ui.shadcn.com/docs/components

---

## 🎯 Prochaines Tâches Suggérées

Pour contribuer au projet, voici les prochaines tâches prioritaires:

### 1. Tests (PRIORITÉ HAUTE)

```bash
# Implémenter tests unitaires
apps/api/src/modules/auth/auth.service.spec.ts
apps/api/src/modules/orders/orders.service.spec.ts
apps/api/src/modules/stock/stock.service.spec.ts

# Implémenter tests E2E
apps/web/e2e/login.spec.ts
apps/web/e2e/create-order.spec.ts
```

### 2. Améliorer l'UI

```bash
# Améliorer formulaires avec React Hook Form
apps/web/app/(partner)/partner/orders/new/page.tsx

# Ajouter loading states et error boundaries
apps/web/components/ui/loading.tsx
apps/web/components/error-boundary.tsx
```

### 3. Intégrations Externes

```bash
# Implémenter Bexio OAuth flow
apps/api/src/modules/invoices/bexio.service.ts

# Implémenter upload S3 réel
apps/api/src/modules/storage/storage.service.ts
```

---

## ✅ Checklist Développeur

Avant de commencer à développer:

- [ ] Projet cloné et dépendances installées
- [ ] PostgreSQL + Redis running
- [ ] Base de données migrée et seedée
- [ ] API accessible (http://localhost:3000/api/health)
- [ ] Web accessible (http://localhost:3001)
- [ ] Login admin fonctionne (admin@sdthai.ch)
- [ ] Prisma Studio exploré (http://localhost:5555)
- [ ] Documentation lue (ARCHITECTURE.md, API_ENDPOINTS_REFERENCE.md)
- [ ] IDE configuré (ESLint, Prettier)
- [ ] Git configuré (user.name, user.email)

---

## 🤝 Besoin d'Aide?

- **Issues GitHub**: https://github.com/secuaas/sdthai/issues
- **Documentation**: Consulter les fichiers .md à la racine
- **Logs**: `docker-compose logs -f` pour debug

---

**Bon développement!** 🚀

Si tout fonctionne, vous êtes prêt à commencer à développer sur SD Thai Food Platform.
