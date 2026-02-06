# CLAUDE.md — sdthai

> Configuration et spécificités pour ce projet SecuAAS
> Lire aussi le fichier centralisé `/home/ubuntu/projects/CLAUDE.md`

---

## 🤖 Configuration Claude

**Modèle recommandé pour ce projet:**
```bash
claude --model opus
```

**Pourquoi Opus?**
- Capacité de raisonnement supérieure pour tâches complexes
- Meilleure compréhension du contexte projet
- Performances optimales pour l'architecture et le code
- Recommandé pour tous les projets SecuAAS

---

## 📋 Informations Projet

**Nom:** sdthai
**Type:** À définir
**État:** À définir
**Version actuelle:** 0.6.0

**Description:**
Projet sdthai

**Repository GitHub:**
https://github.com/secuaas/sdthai

---

## 🛠️ Stack Technique

**Langages/Frameworks:**
- Node.js
- Docker

**Dépendances principales:**
- Voir `package.json` pour les dépendances complètes

**Structure du projet:**
```
sdthai/
├── [À documenter selon la structure réelle]
```

---

## 🚀 Développement Local

### Installation

```bash
cd /home/ubuntu/projects/sdthai
npm install
# ou
yarn install
```

### Compilation/Build

```bash
npm run build
# ou
yarn build
```

### Tests

```bash
npm test
# ou
yarn test
```

---

## 📦 Déploiement

**Environnements:**
- k8s-dev: Environnement de développement
- k8s-prod: Environnement de production (si applicable)

**Commandes secuops:**

```bash
# Build
secuops build --app=sdthai --env=k8s-dev

# Deploy
secuops deploy --app=sdthai --env=k8s-dev

# Status
secuops status --app=sdthai --env=k8s-dev

# Logs
secuops logs --app=sdthai --env=k8s-dev
```

---

## ⚠️ Pièges Spécifiques à ce Projet

[Liste des problèmes connus, bugs récurrents, configurations délicates, etc.]

---

## 📝 Notes Importantes

[Toute information critique spécifique à ce projet]

---

## 📚 Documentation

- README: [lien si existe]
- Documentation technique: [lien si existe]
- API Documentation: [lien si existe]

---

**Dernière mise à jour:** 2026-02-06
