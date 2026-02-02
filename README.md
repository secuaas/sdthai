# SD Thai Food Platform

Plateforme de gestion complète pour SD Thai Food Sàrl - Restaurant thaïlandais authentique à Lausanne.

## Description

Système de gestion intégré comprenant:
- Site web public multilingue (FR/DE/EN)
- Portail partenaires B2B
- Back-office administration
- Application mobile livreur (Flutter)
- Intégrations: Bexio, HP ePrint, OVH S3

## Documentation

Voir [ARCHITECTURE.md](./ARCHITECTURE.md) pour la spécification technique complète.

## Développement

**Note**: Ce projet est en cours de développement initial. L'architecture cible est documentée dans ARCHITECTURE.md.

### Stack Technique

- **Frontend Web**: Next.js 14 + shadcn/ui + Tailwind
- **Backend API**: NestJS 10 + Prisma
- **Base de données**: PostgreSQL 15+
- **Cache/Queue**: Redis + BullMQ
- **Mobile**: Flutter 3.x
- **Déploiement**: Kubernetes OVH via SecuOps

## Build et Déploiement

### Avec SecuOps

```bash
# Build
secuops build --app=sdthai

# Déployer en dev
secuops deploy --app=sdthai --env=k8s-dev

# Déployer en production
secuops deploy --app=sdthai --env=k8s-prod
```

## Support

Créé avec SecuOps v2.0 - https://github.com/secuaas/secuops
