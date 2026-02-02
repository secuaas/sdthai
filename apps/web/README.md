# SD Thai Food - Application Web

Application Next.js 14 avec App Router pour la plateforme SD Thai Food.

## Technologies

- **Next.js 14** avec App Router
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** pour les composants UI
- **Axios** pour les appels API
- **React Hook Form** pour la gestion des formulaires

## Structure du Projet

```
apps/web/
├── app/                      # Routes Next.js (App Router)
│   ├── (public)/            # Routes publiques
│   ├── (partner)/           # Routes partenaires (protégées)
│   ├── (admin)/             # Routes admin (protégées)
│   └── login/               # Page de connexion
├── components/              # Composants réutilisables
│   ├── ui/                  # Composants shadcn/ui
│   ├── layout/              # Header, Sidebar, Footer
│   └── auth/                # Composants d'authentification
├── lib/                     # Utilitaires et configuration
│   ├── api-client.ts        # Client API Axios
│   └── utils.ts             # Utilitaires divers
├── hooks/                   # Custom hooks React
└── providers/               # Context providers
```

## Installation

```bash
# Installer les dépendances
npm install

# Créer le fichier .env.local
cp .env.example .env.local

# Éditer .env.local avec les bonnes URLs
# NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Développement

```bash
# Lancer le serveur de développement
npm run dev

# L'application sera disponible sur http://localhost:3001
```

## Build et Production

```bash
# Build pour production (avec output standalone)
npm run build

# Lancer en production
npm start
```

## Configuration Kubernetes

Le projet est configuré avec `output: 'standalone'` dans `next.config.js` pour un déploiement Kubernetes optimisé.

Le build standalone génère un dossier `.next/standalone` qui contient:
- Tous les fichiers nécessaires pour faire tourner l'application
- Les dépendances minimales
- Un serveur HTTP intégré

## Routes

### Public
- `/` - Homepage
- `/produits` - Liste des produits
- `/produits/[slug]` - Détail produit
- `/login` - Page de connexion

### Partenaire (authentification requise)
- `/partner/dashboard` - Dashboard partenaire
- `/partner/commandes` - Liste des commandes
- `/partner/commandes/nouvelle` - Créer une commande

### Admin (authentification + rôle admin requis)
- `/admin/dashboard` - Dashboard admin
- `/admin/partenaires` - Gestion des partenaires
- `/admin/produits` - Gestion des produits
- `/admin/commandes` - Gestion des commandes

## Authentification

L'authentification utilise JWT stocké dans `localStorage`.

Le provider `AuthProvider` gère:
- La connexion/déconnexion
- La persistance de la session
- La vérification du rôle utilisateur
- Les redirections automatiques

## API Client

Le client API (`lib/api-client.ts`) configure automatiquement:
- L'URL du backend via `NEXT_PUBLIC_API_URL`
- L'ajout du token JWT dans les headers
- La gestion des erreurs 401 (redirection vers login)
- Les types TypeScript pour toutes les entités

## Composants UI

Les composants UI sont basés sur shadcn/ui avec Tailwind CSS:
- `Button`, `Input`, `Label`
- `Card`, `Table`, `Badge`
- Et d'autres composants au besoin

Tous les composants sont personnalisables via Tailwind classes.

## Dark Mode

Le projet est configuré pour supporter le dark mode via Tailwind CSS.
Les variables CSS sont définies dans `app/globals.css`.

## Sécurité

- Headers de sécurité configurés dans `next.config.js`
- Protection CSRF
- XSS protection
- Routes protégées par authentification et rôle

## Support

Pour toute question ou problème, consulter la documentation Next.js:
- https://nextjs.org/docs
