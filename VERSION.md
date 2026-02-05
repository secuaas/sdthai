# Historique des Versions - SD Thai Food

## Version Actuelle
**0.2.0** - 2026-02-05

---

## Versions

### 0.2.0 - 2026-02-05
**Commit:** `fb495e6`
**Type:** Minor - Infrastructure PostgreSQL complète + Données de test

**Changements:**
- ✅ Déploiement PostgreSQL 15-alpine sur k8s-dev
- ✅ Configuration complète Kubernetes (PVC, ConfigMap, Secret, Deployment, Service)
- ✅ Jobs de migration et seed Prisma
- ✅ Correction service Orders pour calcul automatique des prix
- ✅ Mise à jour DTOs Products pour schéma MVP
- ✅ Création données de test:
  - 5 utilisateurs (SUPER_ADMIN, ADMIN, 2 PARTNER, 1 DRIVER)
  - 6 partenaires (4 WITH_DELIVERY, 2 DEPOT_AUTOMATE)
  - 9 produits (currys, soupes, wok, salades, démo)
  - 2 commandes
- ✅ Documentation complète (SESSION, WORK_IN_PROGRESS, DATABASE_SEED_STATUS)

**Commits inclus:**
- `fb495e6` - docs: Add database seed status documentation
- `3d64a64` - docs: Update WORK_IN_PROGRESS with complete session status
- `2690baf` - fix: Correct Orders service to match MVP schema
- `116c999` - docs: Add development session summary 2026-02-05
- `bef0d11` - fix: Update product DTOs and seed script for MVP schema
- `2d36b6c` - docs: Update deployment status with PostgreSQL configuration
- `ffe75e7` - feat: Add PostgreSQL deployment configuration for k8s-dev

**Tests effectués:**
- ✅ Authentification JWT fonctionnelle
- ✅ CRUD Users complet
- ✅ CRUD Partners complet
- ✅ CRUD Products complet
- ✅ CRUD Orders complet avec calcul automatique
- ✅ Validation jours de livraison
- ✅ Génération numéros de commande
- ✅ Health check opérationnel
- ✅ PostgreSQL persistent storage
- ✅ Déploiement k8s-dev (https://sdthai.secuaas.dev)

**Infrastructure:**
- PostgreSQL: postgres-service.sdthai:5432
- Database: sdthai (7 tables)
- Namespace: sdthai (k8s-dev)
- LoadBalancer: 51.161.81.168
- TLS: cert-manager automatique

---

### 0.1.0 - 2026-02-05
**Commit:** `a3bb5b7`
**Type:** Minor - Version initiale déployable

**Changements:**
- Architecture de base NestJS + Next.js + Prisma
- Schéma MVP simplifié (7 models au lieu de 17)
- Modules backend: Auth, Users, Partners, Products, Orders, Health
- Frontend Next.js 14 avec App Router
- Configuration Docker multi-stage
- Déploiement Kubernetes avec SecuOps
- Configuration fullstack type
- Ingress avec TLS
- Prisma 5.x avec binary targets Alpine

**Tests effectués:**
- ✅ Build backend sans erreurs TypeScript
- ✅ Build frontend Next.js
- ✅ Docker image multi-stage
- ✅ Déploiement k8s-dev réussi
- ✅ Ingress HTTPS fonctionnel

**Commits inclus:**
- `a3bb5b7` - docs: Add deployment status and work in progress documentation
- `1279a7d` - fix: Add linux-musl-openssl-3.0.x binary target for Prisma
- `487d13f` - fix: Install openssl in Docker image for Prisma engine
- `2befc92` - fix: Remove deprecated enableShutdownHooks for Prisma 5.x
- Multiples corrections TypeScript et configuration

---

## Règles de Versioning

### Format: MAJOR.MINOR.PATCH

- **MAJOR (1.x.x):** Mise en production (actuellement 0.x.x)
- **MINOR (x.2.x):** Fonction implémentée et fonctionnelle
- **PATCH (x.x.5):** Demande/modification (commit)

### Quand incrémenter:

**PATCH (0.2.0 → 0.2.1):**
- Correction de bug
- Modification mineure
- Amélioration de code existant
- Documentation

**MINOR (0.2.1 → 0.3.0):**
- Nouvelle fonctionnalité complète et testée
- Module complet ajouté
- Infrastructure majeure ajoutée
- Réinitialiser PATCH à 0

**MAJOR (0.x.x → 1.0.0):**
- Mise en production
- Nécessite validation explicite

---

## Prochaine Version Prévue

### 0.3.0 - À venir
**Fonctionnalités planifiées:**
- [ ] Codes de session partenaires
- [ ] Système POS pour DEPOT_AUTOMATE
- [ ] Gestion des retours via mobile
- [ ] Validation deadline 20h pour J+2
- [ ] Option livraison sur place
- [ ] Tests unitaires et E2E

---

## Notes

- Chaque commit doit incrémenter PATCH
- Chaque fonction complète doit incrémenter MINOR
- Toujours documenter les tests effectués
- Inclure les commits avec hash Git
- Documenter l'infrastructure et la configuration
