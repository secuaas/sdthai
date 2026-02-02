# SD Thai Food - API Endpoints Reference

Date: 2026-02-02

## Table des matières

1. [Authentication](#authentication)
2. [Users](#users)
3. [Partners](#partners)
4. [Categories](#categories)
5. [Products](#products)
6. [Orders](#orders)
7. [Production](#production)
8. [Stock](#stock)
9. [Deliveries](#deliveries)
10. [Health](#health)

---

## Authentication

Base URL: `/api/auth`

### POST `/auth/register`
Inscription d'un nouvel utilisateur
- **Body**: `{ email, password, firstName, lastName, phone?, role, partnerId? }`
- **Auth**: Non requis
- **Response**: `{ user, access_token, refresh_token }`

### POST `/auth/login`
Connexion
- **Body**: `{ email, password }`
- **Auth**: Non requis
- **Response**: `{ user, access_token, refresh_token }`

### POST `/auth/refresh`
Rafraîchir le token
- **Body**: `{ refresh_token }`
- **Auth**: Non requis
- **Response**: `{ access_token, refresh_token }`

### POST `/auth/logout`
Déconnexion
- **Auth**: Bearer token
- **Response**: `{ message }`

---

## Users

Base URL: `/api/users`

### GET `/users`
Liste tous les utilisateurs
- **Auth**: SUPER_ADMIN
- **Response**: `User[]`

### GET `/users/:id`
Récupère un utilisateur
- **Auth**: SUPER_ADMIN ou utilisateur lui-même
- **Response**: `User`

### GET `/users/me`
Profil de l'utilisateur connecté
- **Auth**: Bearer token
- **Response**: `User`

### PATCH `/users/:id`
Met à jour un utilisateur
- **Auth**: SUPER_ADMIN
- **Body**: `{ email?, firstName?, lastName?, phone?, role?, isActive? }`
- **Response**: `User`

### DELETE `/users/:id`
Supprime un utilisateur
- **Auth**: SUPER_ADMIN
- **Response**: `{ message }`

---

## Partners

Base URL: `/api/partners`

### POST `/partners`
Créer un partenaire
- **Auth**: SUPER_ADMIN
- **Body**: `CreatePartnerDto`
- **Response**: `Partner`

### GET `/partners`
Liste tous les partenaires
- **Auth**: Bearer token
- **Response**: `Partner[]`

### GET `/partners/:id`
Récupère un partenaire
- **Auth**: Bearer token
- **Response**: `Partner`

### PATCH `/partners/:id`
Met à jour un partenaire
- **Auth**: SUPER_ADMIN
- **Body**: `UpdatePartnerDto`
- **Response**: `Partner`

### DELETE `/partners/:id`
Supprime un partenaire
- **Auth**: SUPER_ADMIN
- **Response**: `{ message }`

---

## Categories

Base URL: `/api/categories`

### POST `/categories`
Créer une catégorie
- **Auth**: SUPER_ADMIN
- **Body**: `{ nameFr, nameDe?, nameEn?, slug, description?, imageUrl?, sortOrder?, isActive? }`
- **Response**: `Category`

### GET `/categories`
Liste toutes les catégories
- **Auth**: Bearer token
- **Response**: `Category[]` (triées par sortOrder)

### GET `/categories/:id`
Récupère une catégorie avec ses produits
- **Auth**: Bearer token
- **Response**: `Category & { products, _count }`

### PATCH `/categories/:id`
Met à jour une catégorie
- **Auth**: SUPER_ADMIN
- **Body**: `UpdateCategoryDto`
- **Response**: `Category`

### DELETE `/categories/:id`
Supprime une catégorie (si pas de produits)
- **Auth**: SUPER_ADMIN
- **Response**: `{ message }`

---

## Products

Base URL: `/api/products`

### POST `/products`
Créer un produit
- **Auth**: SUPER_ADMIN
- **Body**: `CreateProductDto`
- **Response**: `Product`

### GET `/products`
Liste tous les produits
- **Auth**: Bearer token
- **Response**: `Product[]`

### GET `/products/barcode/:barcode`
Recherche par code-barres
- **Auth**: Bearer token
- **Response**: `Product`

### GET `/products/:id`
Récupère un produit
- **Auth**: Bearer token
- **Response**: `Product`

### PATCH `/products/:id`
Met à jour un produit
- **Auth**: SUPER_ADMIN
- **Body**: `UpdateProductDto`
- **Response**: `Product`

### DELETE `/products/:id`
Supprime un produit
- **Auth**: SUPER_ADMIN
- **Response**: `{ message }`

---

## Orders

Base URL: `/api/orders`

### POST `/orders`
Créer une commande
- **Auth**: Bearer token
- **Body**: `CreateOrderDto`
- **Response**: `Order`

### GET `/orders`
Liste toutes les commandes
- **Auth**: Bearer token
- **Response**: `Order[]`

### GET `/orders/:id`
Récupère une commande
- **Auth**: Bearer token
- **Response**: `Order`

### PATCH `/orders/:id`
Met à jour une commande
- **Auth**: SUPER_ADMIN ou PARTNER_ADMIN
- **Body**: `UpdateOrderDto`
- **Response**: `Order`

### DELETE `/orders/:id`
Annule une commande
- **Auth**: SUPER_ADMIN ou PARTNER_ADMIN
- **Response**: `{ message }`

---

## Production

Base URL: `/api/production`

### POST `/production/batches`
Créer un batch de production
- **Auth**: SUPER_ADMIN
- **Body**: `{ productionDate, items: [{ productId, plannedQuantity, notes? }], notes? }`
- **Response**: `ProductionBatch`
- **Note**: Génère automatiquement le batchNumber (YYYYMMDD-XXX)

### GET `/production/batches`
Liste tous les batches
- **Auth**: SUPER_ADMIN
- **Query**: `status?: BatchStatus`
- **Response**: `ProductionBatch[]`

### GET `/production/batches/:id`
Récupère un batch
- **Auth**: SUPER_ADMIN
- **Response**: `ProductionBatch`

### GET `/production/planning`
Planning de production
- **Auth**: SUPER_ADMIN
- **Query**: `date?: YYYY-MM-DD` (défaut: aujourd'hui)
- **Response**: `{ date, orderCount, products: [{ product, totalQuantity, orders }] }`
- **Note**: Agrège les commandes confirmées par date

### POST `/production/batches/:id/start`
Démarrer un batch
- **Auth**: SUPER_ADMIN
- **Response**: `ProductionBatch`
- **Note**: Change le statut à IN_PROGRESS

### POST `/production/batches/:id/complete`
Terminer un batch
- **Auth**: SUPER_ADMIN
- **Body**: `{ items?: [{ productId, actualQuantity }], notes? }`
- **Response**: `ProductionBatch`
- **Note**: Crée automatiquement les StockEntry et StockMovement

### POST `/production/batches/:id/cancel`
Annuler un batch
- **Auth**: SUPER_ADMIN
- **Response**: `ProductionBatch`

---

## Stock

Base URL: `/api/stock`

### GET `/stock`
Liste toutes les entrées de stock
- **Auth**: SUPER_ADMIN
- **Response**: `StockEntry[]` (triées FIFO)

### GET `/stock/summary`
Vue agrégée par produit
- **Auth**: SUPER_ADMIN
- **Response**: `{ product, totalQuantity, totalReserved, availableQuantity, oldestExpiry, entryCount }[]`

### GET `/stock/alerts`
Alertes de stock
- **Auth**: SUPER_ADMIN
- **Response**: `{ lowStock: [], expiringSoon: [] }`
- **Note**:
  - lowStock: availableQuantity < minStockAlert
  - expiringSoon: expiryDate < 7 jours

### POST `/stock/adjustment`
Ajustement manuel de stock
- **Auth**: SUPER_ADMIN
- **Body**: `{ stockEntryId, quantity, notes? }`
- **Response**: `StockEntry`
- **Note**: Crée un StockMovement de type ADJUSTMENT

### POST `/stock/reserve`
Réserver du stock pour une commande
- **Auth**: SUPER_ADMIN
- **Body**: `{ orderId }`
- **Response**: `{ orderId, reservations, message }`
- **Note**: Utilise l'algorithme FIFO, rollback si insuffisant

### POST `/stock/release`
Libérer une réservation
- **Auth**: SUPER_ADMIN
- **Body**: `{ orderId }`
- **Response**: `{ orderId, message }`

---

## Deliveries

Base URL: `/api/deliveries`

### POST `/deliveries`
Créer une livraison
- **Auth**: SUPER_ADMIN
- **Body**: `{ orderId, scheduledDate, routeOrder?, notes? }`
- **Response**: `Delivery`
- **Note**: L'Order doit être au statut READY

### GET `/deliveries`
Liste toutes les livraisons
- **Auth**: SUPER_ADMIN, DRIVER
- **Response**: `Delivery[]`

### GET `/deliveries/today`
Livraisons du jour
- **Auth**: SUPER_ADMIN, DRIVER
- **Response**: `Delivery[]` (triées par routeOrder)

### GET `/deliveries/:id`
Récupère une livraison
- **Auth**: SUPER_ADMIN, DRIVER
- **Response**: `Delivery`

### PATCH `/deliveries/:id/assign`
Assigner un livreur
- **Auth**: SUPER_ADMIN
- **Body**: `{ driverId }`
- **Response**: `Delivery`

### POST `/deliveries/:id/start`
Démarrer une livraison
- **Auth**: SUPER_ADMIN, DRIVER
- **Response**: `Delivery`
- **Note**: Change Order.status à IN_DELIVERY

### POST `/deliveries/:id/complete`
Terminer une livraison
- **Auth**: SUPER_ADMIN, DRIVER
- **Body**: `{ signedBy, signatureKey?, photoKeys?, notes? }`
- **Response**: `Delivery`
- **Note**:
  - Décrémente le stock FIFO
  - Met à jour OrderItem.batchId pour traçabilité
  - Change Order.status à DELIVERED

### POST `/deliveries/:id/fail`
Marquer comme échec
- **Auth**: SUPER_ADMIN, DRIVER
- **Body**: `{ reason }`
- **Response**: `Delivery`
- **Note**: Remet Order.status à READY

---

## Health

Base URL: `/api/health`

### GET `/health`
Health check
- **Auth**: Non requis
- **Response**: `{ status: 'ok', timestamp, database: 'ok' }`

---

## Codes d'erreur HTTP

| Code | Description |
|------|-------------|
| 200 | OK - Succès |
| 201 | Created - Ressource créée |
| 400 | Bad Request - Données invalides |
| 401 | Unauthorized - Non authentifié |
| 403 | Forbidden - Non autorisé (rôle insuffisant) |
| 404 | Not Found - Ressource non trouvée |
| 409 | Conflict - Conflit (duplicate, etc.) |
| 500 | Internal Server Error - Erreur serveur |

---

## Authentification

Tous les endpoints (sauf `/auth/*` et `/health`) requièrent un JWT Bearer token.

### Headers requis
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Rôles disponibles
- `SUPER_ADMIN` - Administrateur SD Thai (accès complet)
- `PARTNER_ADMIN` - Admin partenaire (gestion utilisateurs + commandes)
- `PARTNER_USER` - Utilisateur partenaire (commandes uniquement)
- `DRIVER` - Livreur (app mobile)

---

## Workflows métier

### 1. Workflow Commande
```
DRAFT → PENDING → CONFIRMED → IN_PRODUCTION → READY → IN_DELIVERY → DELIVERED
                                                      ↘ CANCELLED
```

### 2. Workflow Production
```
PLANNED → IN_PROGRESS → COMPLETED
                      ↘ CANCELLED
```

### 3. Workflow Livraison
```
PENDING → ASSIGNED → IN_PROGRESS → COMPLETED
                                  ↘ FAILED
```

### 4. Workflow Stock (FIFO)
```
Production (IN) → Réservation → Livraison (OUT) → Traçabilité batch
```

---

## Notes d'implémentation

### Validation automatique
Tous les DTOs sont validés avec `class-validator`. Les erreurs retournent un 400 avec détails.

### Pagination
Actuellement non implémentée. À ajouter pour les endpoints de liste si volumes importants.

### Filtres
- Production: filtrable par `status`
- Stock: algorithme FIFO automatique
- Deliveries: filtrable par date (today)

### Timestamps
Tous les modèles ont `createdAt` et `updatedAt` automatiques.

### Soft Delete
Non implémenté. Les suppressions sont définitives (sauf Orders → status CANCELLED).

---

## Variables d'environnement

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development|production
```

---

## Pour tester l'API

### Avec curl
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sdthai.ch","password":"admin123"}'

# Utiliser le token
curl http://localhost:3000/api/products \
  -H "Authorization: Bearer <access_token>"
```

### Avec Postman/Insomnia
1. Importer la collection (à créer)
2. Configurer l'environnement avec `baseUrl` et `token`
3. Tester les endpoints

---

## Support

Pour toute question sur l'API, consulter:
- `/ARCHITECTURE.md` - Architecture complète
- `/BACKEND_MODULES_IMPLEMENTATION.md` - Détails techniques
- `/packages/prisma/schema.prisma` - Schéma de base de données
