# Architecture de l'Application Web SD Thai Food

## Vue d'ensemble

Application Next.js 14 avec App Router utilisant le pattern de routes groupées pour séparer les différents espaces (public, partner, admin).

## Technologies

- **Framework**: Next.js 14.2.15 avec App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **HTTP Client**: Axios
- **State Management**: React Context (Auth)
- **Form Management**: React Hook Form + Zod

## Architecture des Routes

### Routes Publiques - `(public)/`
Routes accessibles sans authentification:
- `/` - Redirection vers `/produits`
- `/produits` - Liste des produits disponibles
- `/produits/[slug]` - Détail d'un produit
- `/login` - Page de connexion

### Routes Partenaires - `(partner)/`
Routes protégées nécessitant authentification + rôle PARTNER:
- `/partner/dashboard` - Dashboard avec statistiques
- `/partner/commandes` - Liste des commandes du partenaire
- `/partner/commandes/nouvelle` - Créer une nouvelle commande

### Routes Admin - `(admin)/`
Routes protégées nécessitant authentification + rôle ADMIN:
- `/admin/dashboard` - Dashboard admin avec statistiques globales
- `/admin/partenaires` - Gestion des partenaires
- `/admin/produits` - Gestion du catalogue produits
- `/admin/commandes` - Gestion de toutes les commandes

## Composants

### Layout Components
- **Header**: Navigation principale, affichage utilisateur, logout
- **Sidebar**: Navigation contextuelle selon le rôle (admin/partner)
- **Footer**: Footer simple avec copyright

### UI Components (shadcn/ui)
Tous les composants UI sont basés sur Radix UI + Tailwind:
- `Button` - Boutons avec variants
- `Input` - Champs de formulaire
- `Label` - Labels de formulaire
- `Card` - Cartes de contenu
- `Table` - Tableaux de données
- `Badge` - Badges de statut

### Auth Components
- **LoginForm**: Formulaire de connexion avec gestion d'erreurs
- **AuthProvider**: Context provider pour la gestion de l'authentification

## Gestion de l'État

### AuthContext
Gère l'état d'authentification de l'utilisateur:
- `user`: Données de l'utilisateur connecté
- `loading`: État de chargement
- `login()`: Fonction de connexion
- `logout()`: Fonction de déconnexion
- `isAuthenticated`: Booléen d'authentification
- `isAdmin`: Booléen pour vérifier le rôle admin
- `isPartner`: Booléen pour vérifier le rôle partner

Le token JWT est stocké dans `localStorage` et automatiquement ajouté aux requêtes API.

## API Client

### Configuration
Client Axios configuré avec:
- Base URL: `NEXT_PUBLIC_API_URL` (env var)
- Intercepteurs pour:
  - Ajout automatique du token JWT
  - Gestion des erreurs 401 (déconnexion automatique)
  - Redirection vers login si non authentifié

### API Routes
Toutes les routes API sont typées:
- `authApi`: login, register, me
- `productsApi`: list, get, create, update, delete
- `ordersApi`: list, get, create, update, delete, updateStatus
- `partnersApi`: list, get, create, update, delete

### Types
Types TypeScript pour toutes les entités:
- `User`, `Partner`, `Product`, `Order`, `OrderItem`
- `LoginDto`, `RegisterDto`, `AuthResponse`
- `PaginatedResponse<T>`, `ApiError`

## Protection des Routes

### Route Groups
Next.js App Router utilise les route groups pour organiser les routes:
- `(public)`: Routes publiques avec layout public
- `(partner)`: Routes protégées avec layout partner + sidebar
- `(admin)`: Routes protégées avec layout admin + sidebar

### Middleware de Protection
Les layouts `(partner)/layout.tsx` et `(admin)/layout.tsx` vérifient:
1. Si l'utilisateur est authentifié
2. Si l'utilisateur a le bon rôle
3. Redirection vers `/login` si conditions non remplies

## Styling

### Tailwind CSS
Configuration complète avec:
- Variables CSS pour les couleurs (light/dark mode)
- Classes utilitaires personnalisées
- Support du dark mode via `class` strategy

### Design System
Basé sur shadcn/ui avec:
- Palette de couleurs cohérente
- Spacing systématique
- Typography harmonieuse
- Composants accessibles (Radix UI)

## Build & Déploiement

### Standalone Output
Configuration critique pour K8s dans `next.config.js`:
```javascript
output: 'standalone'
```

Génère un build optimisé dans `.next/standalone` contenant:
- Serveur Node.js minimal
- Dépendances nécessaires uniquement
- Assets statiques optimisés

### Multi-stage Docker Build
Le Dockerfile utilise 3 stages:
1. **deps**: Installation des dépendances
2. **builder**: Build de l'application
3. **runner**: Image finale minimale (~150MB)

### Kubernetes
Déploiement avec:
- 2 replicas pour haute disponibilité
- Health checks (liveness + readiness)
- Resource limits (CPU/Memory)
- Ingress avec TLS (Let's Encrypt)
- Service ClusterIP

## Variables d'Environnement

### Build Time
- `NEXT_PUBLIC_API_URL`: URL du backend API (exposée au client)
- `NEXT_PUBLIC_APP_NAME`: Nom de l'application
- `NEXT_PUBLIC_APP_URL`: URL publique de l'application

### Runtime
Les variables `NEXT_PUBLIC_*` sont injectées lors du build et disponibles côté client.

## Sécurité

### Headers HTTP
Headers de sécurité configurés:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

### CORS
Géré par le backend NestJS.

### Authentication
- JWT stocké dans localStorage
- Token envoyé via Authorization header
- Déconnexion automatique sur 401
- Protection des routes sensibles

## Performance

### Optimisations
- Server Components par défaut
- Client Components uniquement quand nécessaire
- Code splitting automatique
- Image optimization (Next.js Image)
- Standalone output pour Docker minimal

### Caching
- Next.js cache automatique
- Static assets avec long TTL
- API responses non cachées (données temps réel)

## Développement

### Structure de Code
```
apps/web/
├── app/                  # Routes (App Router)
│   ├── (public)/        # Routes publiques
│   ├── (partner)/       # Routes partenaires
│   ├── (admin)/         # Routes admin
│   ├── login/           # Page de login
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home redirect
│   └── globals.css      # Styles globaux
├── components/          # Composants réutilisables
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Header, Sidebar, Footer
│   └── auth/           # LoginForm
├── lib/                # Utilitaires
│   ├── api-client.ts   # Client API Axios
│   └── utils.ts        # Helpers (cn, formatters)
├── hooks/              # Custom hooks
│   └── use-auth.ts     # Hook d'authentification
├── providers/          # Context providers
│   └── auth-provider.tsx
└── k8s/                # Manifests Kubernetes
```

### Bonnes Pratiques
1. Utiliser Server Components par défaut
2. Client Components avec directive `'use client'`
3. Types TypeScript stricts
4. Composants UI réutilisables
5. Gestion d'erreurs cohérente
6. Loading states partout
7. Responsive design mobile-first

## Tests

### À Implémenter
- Unit tests (Jest + React Testing Library)
- Integration tests (API calls)
- E2E tests (Playwright)

## Prochaines Étapes

### Features à Ajouter
1. Pagination complète
2. Filtres avancés
3. Export de données (CSV, PDF)
4. Notifications temps réel
5. Upload d'images produits
6. Historique des commandes
7. Dashboard avec graphiques

### Améliorations
1. Dark mode complet
2. i18n (multi-langue)
3. PWA support
4. Offline mode
5. Tests automatisés
6. Storybook pour UI
7. Analytics

## Support

Pour toute question:
- Documentation Next.js: https://nextjs.org/docs
- Documentation Tailwind: https://tailwindcss.com/docs
- Documentation shadcn/ui: https://ui.shadcn.com
