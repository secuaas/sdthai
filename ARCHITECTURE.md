# SD Thai Food - Guide de Développement Complet

> **Document de référence pour Claude Code**
> Version: 2.0 | Date: Février 2026 | Statut: Prêt pour développement

---

## Table des Matières

1. [Contexte et Objectifs](#1-contexte-et-objectifs)
2. [Architecture Technique](#2-architecture-technique)
3. [Structure du Projet](#3-structure-du-projet)
4. [Modèle de Données Complet](#4-modèle-de-données-complet)
5. [API Endpoints](#5-api-endpoints)
6. [Authentification et Autorisation](#6-authentification-et-autorisation)
7. [Règles Métier](#7-règles-métier)
8. [Frontend - Pages et Composants](#8-frontend)
9. [Application Mobile Flutter](#9-application-mobile-flutter)
10. [Services Externes](#10-services-externes)
11. [Tests](#11-tests)
12. [Déploiement](#12-déploiement)
13. [Checklist de Développement](#13-checklist)

---

## 1. Contexte et Objectifs

### 1.1 Présentation

**SD Thai Food** est une entreprise suisse (Lausanne) de préparation et distribution de plats thaïlandais authentiques sous-vide. Chef Dumrong (Daer) Kongsunton a été noté 12/20 au Gault & Millau pendant 20 ans.

### 1.2 Modules à Développer

| Module | Description | Priorité |
|--------|-------------|----------|
| Site Web Public | Vitrine multilingue FR/DE/EN, carte des points de vente | P1 |
| Portail Partenaires | Commandes B2B, historique, factures | P1 |
| Back-Office Admin | Gestion articles, production, stock, livraisons | P1 |
| App Mobile Livreur | Android - scan, itinéraire, validation | P1 |
| Intégration Bexio | Sync contacts, articles, factures | P1 |

### 1.3 Constantes Métier

```typescript
const BUSINESS_CONSTANTS = {
  DEFAULT_SHELF_LIFE_DAYS: 17,        // DLC produits sous-vide
  MIN_ORDER_AMOUNT_CHF: 40,           // Minimum commande
  DEFAULT_ORDER_DEADLINE_TIME: '18:00',
  DEFAULT_ORDER_DEADLINE_DAYS: 1,
  PRODUCTION_HOURS: { start: 8, end: 16 },
  VAT_RATE: 0.081,                    // TVA Suisse 8.1%
};
```

---

## 2. Architecture Technique

### 2.1 Stack Technologique

| Couche | Technologie | Version |
|--------|-------------|---------|
| Frontend Web | Next.js | 14.x |
| UI Components | shadcn/ui + Tailwind | latest |
| Backend API | NestJS | 10.x |
| ORM | Prisma | 5.x |
| Base de données | PostgreSQL | 15+ |
| Cache/Queue | Redis + BullMQ | 7.x / 5.x |
| Mobile | Flutter | 3.x |
| Conteneurs | Docker | 24.x |
| Orchestration | Kubernetes OVH | 1.28+ |
| Stockage S3 | OVH Object Storage Zurich | - |
| Emails | Resend | - |
| Impression | HP ePrint (Email-to-Print) | - |

### 2.2 Diagramme d'Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│  │ Site Web │ │Backoffice│ │ Portail  │ │   App    │               │
│  │ (Public) │ │ (Admin)  │ │Partenaire│ │ Mobile   │               │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘               │
└───────┼────────────┼────────────┼────────────┼──────────────────────┘
        └────────────┴─────┬──────┴────────────┘
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                    KUBERNETES CLUSTER (OVH)                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐        │
│  │ API Gateway│ │   Auth     │ │  Orders    │ │ Products   │        │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘        │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐        │
│  │ Production │ │   Stock    │ │ Delivery   │ │   Print    │        │
│  └────────────┘ └────────────┘ └────────────┘ └─────┬──────┘        │
│  ┌────────────┐ ┌────────────┐                      │               │
│  │ Bexio Sync │ │Notification│                      │               │
│  └────────────┘ └────────────┘                      │               │
└────────────────────────┬────────────────────────────┼───────────────┘
                         │                            │
         ┌───────────────┼───────────────┐            │
         ▼               ▼               ▼            ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ PostgreSQL  │  │    Redis    │  │  OVH S3 CH  │  │  HP ePrint  │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

---

## 3. Structure du Projet

### 3.1 Monorepo Structure

```
sdthai/
├── apps/
│   ├── web/                      # Next.js
│   │   ├── app/
│   │   │   ├── (public)/         # Site vitrine
│   │   │   ├── (partner)/        # Portail partenaires
│   │   │   ├── (admin)/          # Backoffice admin
│   │   │   └── api/              # API Routes (BFF)
│   │   ├── components/
│   │   ├── lib/
│   │   └── hooks/
│   │
│   ├── api/                      # NestJS Backend
│   │   └── src/
│   │       ├── common/           # Guards, decorators, pipes
│   │       ├── modules/          # Feature modules
│   │       │   ├── auth/
│   │       │   ├── users/
│   │       │   ├── partners/
│   │       │   ├── products/
│   │       │   ├── orders/
│   │       │   ├── production/
│   │       │   ├── stock/
│   │       │   ├── deliveries/
│   │       │   ├── print/
│   │       │   ├── bexio/
│   │       │   └── storage/
│   │       └── config/
│   │
│   └── mobile/                   # Flutter App
│       └── lib/
│           ├── features/
│           │   ├── auth/
│           │   ├── deliveries/
│           │   ├── scanner/
│           │   └── navigation/
│           └── core/
│
├── packages/
│   ├── shared/                   # Types et utils partagés
│   ├── prisma/                   # Schema et migrations
│   └── ui/                       # Composants UI partagés
│
├── infrastructure/
│   ├── docker/
│   ├── k8s/
│   └── scripts/
│
├── pnpm-workspace.yaml
└── turbo.json
```

### 3.2 Configuration Turborepo

```json
// turbo.json
{
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": ["dist/**", ".next/**"] },
    "dev": { "cache": false, "persistent": true },
    "lint": {},
    "test": { "dependsOn": ["build"] },
    "db:generate": { "cache": false }
  }
}
```

---

## 4. Modèle de Données Complet

### 4.1 Enums

```prisma
enum PartnerType {
  DEPOT_VENTE     // Produits en consignation, facturation périodique
  VENTE_DIRECTE   // Achat ferme, facturation à livraison
  AUTOMATE        // Distributeurs gérés par SD Thai
}

enum UserRole {
  SUPER_ADMIN     // Admin SD Thai (accès total)
  PARTNER_ADMIN   // Admin partenaire (utilisateurs + commandes)
  PARTNER_USER    // Utilisateur partenaire (commandes)
  DRIVER          // Livreur (app mobile)
}

enum OrderStatus {
  DRAFT, PENDING, CONFIRMED, IN_PRODUCTION,
  READY, IN_DELIVERY, DELIVERED, CANCELLED
}

enum BatchStatus {
  PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
}

enum DeliveryStatus {
  PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, FAILED
}

enum InvoiceStatus {
  DRAFT, SENT, PAID, OVERDUE, CANCELLED
}

enum StockMovementType {
  IN_PRODUCTION, OUT_DELIVERY, OUT_RETURN, ADJUSTMENT
}
```

### 4.2 Entités Principales

```prisma
model User {
  id              String    @id @default(uuid())
  email           String    @unique
  passwordHash    String
  firstName       String
  lastName        String
  phone           String?
  role            UserRole
  partnerId       String?
  partner         Partner?  @relation(fields: [partnerId], references: [id])
  isActive        Boolean   @default(true)
  emailVerified   Boolean   @default(false)
  lastLoginAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  refreshTokens   RefreshToken[]
  orders          Order[]
  deliveries      Delivery[]  @relation("DriverDeliveries")
  auditLogs       AuditLog[]
}

model Partner {
  id                String       @id @default(uuid())
  type              PartnerType
  name              String
  legalName         String?
  vatNumber         String?
  address           String
  postalCode        String
  city              String
  canton            String?
  country           String       @default("CH")
  latitude          Decimal      @db.Decimal(10, 8)
  longitude         Decimal      @db.Decimal(11, 8)
  contactName       String?
  phone             String?
  email             String?

  // Config livraison
  deliveryDays      Json         @default("[\"MONDAY\", \"THURSDAY\"]")
  orderDeadlineTime String       @default("18:00")
  orderDeadlineDays Int          @default(1)

  // Config facturation (Dépôt-vente)
  billingPeriod     String?      @default("MONTHLY")
  billingDay        Int?         @default(1)

  // Intégrations
  bexioContactId    Int?
  googlePlaceId     String?

  isActive          Boolean      @default(true)
  isPublic          Boolean      @default(true)

  users             User[]
  orders            Order[]
  deliveries        Delivery[]
  invoices          Invoice[]

  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
}

model Product {
  id              String    @id @default(uuid())
  sku             String    @unique
  barcode         String    @unique
  nameFr          String
  nameDe          String?
  nameEn          String?
  descriptionFr   String?   @db.Text
  priceB2b        Decimal   @db.Decimal(10, 2)
  priceB2c        Decimal   @db.Decimal(10, 2)
  shelfLifeDays   Int       @default(17)
  weight          Int?
  allergens       String[]
  isVegetarian    Boolean   @default(false)
  spicyLevel      Int?      @default(0)
  categoryId      String
  category        Category  @relation(fields: [categoryId], references: [id])
  bexioArticleId  Int?
  minStockAlert   Int       @default(10)
  isActive        Boolean   @default(true)

  images          ProductImage[]
  stockEntries    StockEntry[]
  orderItems      OrderItem[]
  batchItems      BatchItem[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model Order {
  id              String      @id @default(uuid())
  orderNumber     String      @unique  // ORD-YYYYMMDD-XXXX
  partnerId       String
  partner         Partner     @relation(fields: [partnerId], references: [id])
  userId          String
  user            User        @relation(fields: [userId], references: [id])
  status          OrderStatus @default(DRAFT)
  orderDate       DateTime    @default(now())
  requestedDate   DateTime    @db.Date
  isUrgent        Boolean     @default(false)
  urgentReason    String?
  urgentApproved  Boolean?
  subtotal        Decimal     @db.Decimal(10, 2)
  vatAmount       Decimal     @db.Decimal(10, 2)
  total           Decimal     @db.Decimal(10, 2)
  notes           String?

  items           OrderItem[]
  delivery        Delivery?
  invoice         Invoice?

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model ProductionBatch {
  id              String      @id @default(uuid())
  batchNumber     String      @unique  // YYYYMMDD-XXX
  productionDate  DateTime    @db.Date
  expiryDate      DateTime    @db.Date
  status          BatchStatus @default(PLANNED)
  startedAt       DateTime?
  completedAt     DateTime?

  items           BatchItem[]
  stockEntries    StockEntry[]

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model StockEntry {
  id              String          @id @default(uuid())
  productId       String
  product         Product         @relation(fields: [productId], references: [id])
  batchId         String
  batch           ProductionBatch @relation(fields: [batchId], references: [id])
  initialQuantity Int
  quantity        Int             // Quantité restante (FIFO)
  reservedQuantity Int            @default(0)

  movements       StockMovement[]

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([productId, batchId])
}

model Delivery {
  id              String         @id @default(uuid())
  orderId         String         @unique
  order           Order          @relation(fields: [orderId], references: [id])
  partnerId       String
  partner         Partner        @relation(fields: [partnerId], references: [id])
  driverId        String?
  driver          User?          @relation("DriverDeliveries", fields: [driverId], references: [id])
  scheduledDate   DateTime       @db.Date
  routeOrder      Int?
  status          DeliveryStatus @default(PENDING)
  completedAt     DateTime?
  signatureKey    String?
  receivedBy      String?

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}
```

---

## 5. API Endpoints

### 5.1 Auth
```
POST   /api/auth/login           → { accessToken, refreshToken, user }
POST   /api/auth/refresh         → { accessToken, refreshToken }
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/me              → { user }
```

### 5.2 Users (Admin)
```
GET    /api/users                → { users[], meta }
GET    /api/users/:id            → { user }
POST   /api/users                → { user }
PATCH  /api/users/:id            → { user }
DELETE /api/users/:id
```

### 5.3 Partners
```
GET    /api/partners             → { partners[], meta }
GET    /api/partners/public      → { partners[] }  // Pour carte site web
GET    /api/partners/:id         → { partner }
POST   /api/partners             → { partner }
PATCH  /api/partners/:id         → { partner }
DELETE /api/partners/:id
```

### 5.4 Products
```
GET    /api/products             → { products[], meta }
GET    /api/products/public      → { products[] }
GET    /api/products/:id         → { product }
GET    /api/products/barcode/:barcode  → { product }
POST   /api/products             → { product }
PATCH  /api/products/:id         → { product }
DELETE /api/products/:id
POST   /api/products/:id/images  → { image }
```

### 5.5 Orders
```
GET    /api/orders               → { orders[], meta }
GET    /api/orders/:id           → { order }
GET    /api/orders/partner/me    → { orders[], meta }
POST   /api/orders               → { order }
PATCH  /api/orders/:id           → { order }
PATCH  /api/orders/:id/approve-urgent → { order }
DELETE /api/orders/:id
```

### 5.6 Production
```
GET    /api/production/batches   → { batches[], meta }
GET    /api/production/batches/:id → { batch }
GET    /api/production/planning?date=YYYY-MM-DD → { aggregatedItems[] }
POST   /api/production/batches   → { batch }
POST   /api/production/batches/:id/start → { batch }
POST   /api/production/batches/:id/complete → { batch }
POST   /api/production/batches/:id/print → { printJob }
```

### 5.7 Stock
```
GET    /api/stock                → { stockEntries[], meta }
GET    /api/stock/summary        → { products[] }
GET    /api/stock/alerts         → { lowStock[], expiringSoon[] }
POST   /api/stock/adjustment     → { stockEntry, movement }
```

### 5.8 Deliveries
```
GET    /api/deliveries           → { deliveries[], meta }
GET    /api/deliveries/today     → { deliveries[] }
GET    /api/deliveries/:id       → { delivery }
PATCH  /api/deliveries/:id/assign → { delivery }
POST   /api/deliveries/:id/start → { delivery }
POST   /api/deliveries/:id/complete → { delivery, invoice? }
POST   /api/deliveries/:id/fail  → { delivery }
```

### 5.9 Invoices
```
GET    /api/invoices             → { invoices[], meta }
GET    /api/invoices/:id         → { invoice }
GET    /api/invoices/:id/pdf     → PDF file
POST   /api/invoices/:id/send    → { invoice }
PATCH  /api/invoices/:id/mark-paid → { invoice }
```

### 5.10 Print
```
POST   /api/print/production/:batchId → { printJob }
POST   /api/print/delivery/:deliveryId → { printJob }
GET    /api/print/jobs           → { printJobs[], meta }
```

---

## 6. Authentification et Autorisation

### 6.1 JWT Strategy

```typescript
// JwtPayload
interface JwtPayload {
  sub: string;        // User ID
  email: string;
  role: UserRole;
  partnerId?: string;
  iat: number;
  exp: number;
}
```

### 6.2 Guards

```typescript
// RolesGuard - Vérifie le rôle utilisateur
@Roles(UserRole.SUPER_ADMIN, UserRole.PARTNER_ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)

// PartnerTypeGuard - Vérifie le type de partenaire
@PartnerTypes(PartnerType.VENTE_DIRECTE)
@UseGuards(JwtAuthGuard, PartnerTypeGuard)
```

### 6.3 Decorators

```typescript
@Public()                    // Route publique (pas d'auth)
@Roles(...roles)             // Rôles autorisés
@PartnerTypes(...types)      // Types de partenaires autorisés
@CurrentUser()               // Injecte l'utilisateur courant
```

### 6.4 Matrice des Permissions

| Action | SUPER_ADMIN | PARTNER_ADMIN | PARTNER_USER | DRIVER |
|--------|:-----------:|:-------------:|:------------:|:------:|
| Voir tous les partenaires | ✅ | ❌ | ❌ | ❌ |
| Créer commande | ✅ | ✅* | ✅* | ❌ |
| Approuver urgent | ✅ | ❌ | ❌ | ❌ |
| Gérer production | ✅ | ❌ | ❌ | ❌ |
| Voir livraisons | ✅ | ❌ | ❌ | ✅ |
| Valider livraison | ✅ | ❌ | ❌ | ✅ |

*Seulement si type partenaire = VENTE_DIRECTE

---

## 7. Règles Métier

### 7.1 Types de Partenaires - Comportements

```typescript
interface PartnerBehavior {
  canOrder: boolean;
  hasPortalAccess: boolean;
  portalFeatures: string[];
  billingType: 'ON_DELIVERY' | 'PERIODIC' | 'NONE';
  stockManagedBy: 'PARTNER' | 'SDTHAI';
  allowReturns: boolean;
  displayAs24h: boolean;
}

const PARTNER_BEHAVIORS = {
  VENTE_DIRECTE: {
    canOrder: true,
    hasPortalAccess: true,
    portalFeatures: ['dashboard', 'orders', 'history', 'invoices'],
    billingType: 'ON_DELIVERY',
    stockManagedBy: 'PARTNER',
    allowReturns: false,
    displayAs24h: false,
  },
  DEPOT_VENTE: {
    canOrder: false,  // ❌ Ne peut PAS commander
    hasPortalAccess: true,
    portalFeatures: ['dashboard', 'history', 'invoices'], // Pas 'orders'
    billingType: 'PERIODIC',
    stockManagedBy: 'SDTHAI',
    allowReturns: true,
    displayAs24h: false,
  },
  AUTOMATE: {
    canOrder: false,
    hasPortalAccess: false,  // ❌ Pas d'accès portail
    portalFeatures: [],
    billingType: 'NONE',
    stockManagedBy: 'SDTHAI',
    allowReturns: false,
    displayAs24h: true,  // ✅ Affiché 24h/24 sur carte
  },
};
```

### 7.2 Validation des Commandes

```typescript
async createOrder(dto, user) {
  const partner = await getPartner(dto.partnerId);
  const behavior = PARTNER_BEHAVIORS[partner.type];

  // 1. Vérifier que le type peut commander
  if (!behavior.canOrder) {
    throw new ForbiddenException(
      `Les partenaires ${partner.type} ne peuvent pas commander`
    );
  }

  // 2. Vérifier la deadline (sauf urgente)
  if (!dto.isUrgent) {
    const deadline = calculateDeadline(partner, dto.requestedDate);
    if (new Date() > deadline) {
      throw new BadRequestException('Date limite dépassée');
    }
  }

  // 3. Vérifier montant minimum (40 CHF)
  const total = calculateTotal(dto.items);
  if (total < 40) {
    throw new BadRequestException('Minimum 40 CHF');
  }

  // 4. Créer avec status approprié
  return createOrder({
    ...dto,
    status: dto.isUrgent ? 'PENDING' : 'CONFIRMED',
  });
}
```

### 7.3 Stock FIFO

```typescript
async reserveStock(productId: string, quantity: number) {
  // Récupérer entrées triées FIFO (plus ancien d'abord)
  const entries = await prisma.stockEntry.findMany({
    where: { productId, quantity: { gt: 0 } },
    orderBy: [
      { batch: { productionDate: 'asc' } },  // FIFO
      { createdAt: 'asc' },
    ],
    include: { batch: true },
  });

  let remaining = quantity;
  const reservations = [];

  for (const entry of entries) {
    if (remaining <= 0) break;

    const available = entry.quantity - entry.reservedQuantity;
    const toReserve = Math.min(available, remaining);

    reservations.push({
      stockEntryId: entry.id,
      batchNumber: entry.batch.batchNumber,
      quantity: toReserve,
      expiryDate: entry.batch.expiryDate,
    });

    remaining -= toReserve;
  }

  if (remaining > 0) {
    throw new InsufficientStockException();
  }

  return reservations;
}
```

### 7.4 Flux de Production

```
1. AGGREGATION
   Commandes confirmées → Planning de production

2. BATCH CREATION
   Admin crée batch avec produits et quantités
   Status: PLANNED

3. PRINT
   Feuille de production → HP ePrint (Email-to-Print)
   Latence: 30-60 secondes

4. PRODUCTION
   Chef démarre → Status: IN_PROGRESS
   Chef termine → Status: COMPLETED

5. STOCK
   Batch COMPLETED → Création StockEntry
   DLC = productionDate + shelfLifeDays (17j)
```

### 7.5 Flux de Livraison

```
1. ORDER READY
   Production terminée → Status: READY

2. DELIVERY CREATED
   Livraison créée, assignée au livreur
   Status: ASSIGNED

3. MOBILE APP
   Livreur démarre tournée → Status: IN_PROGRESS

4. VALIDATION
   - Scanner code-barres produits
   - Collecter signature
   - Prendre photo (optionnel)
   Status: COMPLETED

5. POST-DELIVERY
   - Stock décrémenté (FIFO)
   - Facture créée dans Bexio (VENTE_DIRECTE)
   - OrderItem.batchId renseigné (traçabilité)
```

---

## 8. Frontend - Structure des Pages

### 8.1 Site Public
```
(public)/
├── page.tsx                  # Homepage
├── produits/page.tsx         # Liste produits
├── produits/[slug]/page.tsx  # Détail produit
├── points-de-vente/page.tsx  # Carte interactive
├── a-propos/page.tsx
└── contact/page.tsx
```

### 8.2 Portail Partenaire
```
(partner)/
├── dashboard/page.tsx        # Vue d'ensemble
├── commandes/
│   ├── page.tsx              # Liste commandes
│   ├── nouvelle/page.tsx     # Nouvelle commande
│   └── [id]/page.tsx         # Détail
├── historique/page.tsx
└── factures/page.tsx         # PARTNER_ADMIN only
```

### 8.3 Backoffice Admin
```
(admin)/
├── dashboard/page.tsx
├── partenaires/
├── produits/
├── commandes/
├── production/
│   ├── page.tsx              # Planning
│   ├── batches/page.tsx      # Liste batches
│   └── ecran/page.tsx        # Écran cuisine fullscreen
├── stock/
│   ├── page.tsx
│   └── alertes/page.tsx
├── livraisons/
├── factures/
├── utilisateurs/
└── parametres/
```

---

## 9. Application Mobile Flutter

### 9.1 Structure
```
lib/
├── features/
│   ├── auth/
│   │   └── screens/login_screen.dart
│   ├── deliveries/
│   │   ├── screens/
│   │   │   ├── delivery_list_screen.dart
│   │   │   ├── delivery_detail_screen.dart
│   │   │   └── delivery_validation_screen.dart
│   │   └── providers/deliveries_provider.dart
│   ├── scanner/
│   │   └── screens/scanner_screen.dart
│   └── navigation/
│       └── screens/navigation_screen.dart
└── core/
    ├── api/api_client.dart
    └── models/
```

### 9.2 Fonctionnalités Clés

1. **Liste des livraisons du jour** - Groupées par statut
2. **Détail livraison** - Adresse, produits, contact
3. **Navigation GPS** - Google Maps / Waze
4. **Scanner code-barres** - mobile_scanner package
5. **Signature** - Pad de signature tactile
6. **Validation** - Avec photo optionnelle

---

## 10. Services Externes

### 10.1 Email-to-Print (HP ePrint)

```typescript
// print.service.ts
async printProductionSheet(batchId: string) {
  const batch = await getBatch(batchId);
  const pdfBuffer = await generateProductionPdf(batch);

  await resend.emails.send({
    from: 'print@sdthai.ch',
    to: process.env.PRINTER_EMAIL,  // abc123@hpeprint.com
    subject: `Production ${batch.batchNumber}`,
    attachments: [{
      filename: `prod-${batch.batchNumber}.pdf`,
      content: pdfBuffer.toString('base64'),
    }],
  });
}
```

**Configuration HP ePrint:**
- Activer services Web sur imprimante
- Créer compte hp.com/go/eprintcenter
- Whitelist: print@sdthai.ch
- Format: PDF uniquement
- Latence: 30-60 secondes

### 10.2 Stockage S3 (OVH Zurich)

```typescript
// storage.service.ts
const s3Client = new S3Client({
  endpoint: 'https://s3.gra.perf.cloud.ovh.net',
  region: 'gra',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: true,
});

// Buckets
// sdthai-prod-media/products/{id}/main.webp
// sdthai-prod-media/invoices/
// sdthai-prod-backups/database/
```

### 10.3 Intégration Bexio

```typescript
// Sync contacts
POST https://api.bexio.com/2.0/contact

// Créer facture QR
POST https://api.bexio.com/2.0/kb_invoice
{
  contact_id: partner.bexioContactId,
  positions: [...],
  qr_code_payment: true  // QR-facture suisse
}

// Émettre facture
POST https://api.bexio.com/2.0/kb_invoice/{id}/issue
```

---

## 11. Tests

### 11.1 Tests Unitaires (Jest)

```typescript
// orders.service.spec.ts
describe('OrdersService', () => {
  it('should throw for DEPOT_VENTE partner', async () => {
    const partner = { type: PartnerType.DEPOT_VENTE };
    await expect(service.createOrder(dto, user))
      .rejects.toThrow('ne peuvent pas commander');
  });

  it('should throw when minimum not met', async () => {
    const dto = { items: [{ quantity: 1, unitPrice: 10 }] }; // 10 < 40
    await expect(service.createOrder(dto, user))
      .rejects.toThrow('minimum de commande');
  });

  it('should validate deadline correctly', async () => {
    const result = await service.validateOrderDeadline(partnerId, futureDate);
    expect(result.valid).toBe(true);
  });
});
```

### 11.2 Tests E2E

```typescript
// orders.e2e-spec.ts
describe('POST /orders', () => {
  it('should create order successfully', async () => {
    const response = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send(validOrderDto);

    expect(response.status).toBe(201);
    expect(response.body.orderNumber).toMatch(/^ORD-\d{8}-\d{4}$/);
  });
});
```

---

## 12. Déploiement

### 12.1 CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
jobs:
  lint-and-test:
    - pnpm install
    - pnpm db:generate
    - pnpm lint
    - pnpm test
    - pnpm build

  build-docker:
    - Build sdthai/api:${{ github.sha }}
    - Build sdthai/web:${{ github.sha }}
    - Push to registry

  deploy:
    - kubectl apply -k infrastructure/k8s/overlays/production
    - kubectl rollout status deployment/sdthai-api
```

### 12.2 Kubernetes

```yaml
# Secrets requis
- DATABASE_URL
- REDIS_URL
- S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY
- RESEND_API_KEY
- PRINTER_EMAIL
- BEXIO_CLIENT_ID, BEXIO_CLIENT_SECRET
- JWT_SECRET
```

---

## 13. Checklist de Développement

### Phase 1 - Infrastructure (Semaines 1-2)
- [ ] Monorepo pnpm + Turborepo
- [ ] Prisma schema complet + seed
- [ ] OVH S3 Zurich configuré
- [ ] Resend configuré
- [ ] Docker multi-stage
- [ ] CI/CD GitHub Actions
- [ ] K8s staging déployé

### Phase 2 - Auth & API Core (Semaines 3-4)
- [ ] Module Auth (JWT, refresh, guards)
- [ ] CRUD Users, Partners, Products, Categories
- [ ] Validation DTOs
- [ ] OpenAPI documentation
- [ ] Tests >80% coverage

### Phase 3 - Portail Partenaires (Semaines 5-6)
- [ ] Next.js App Router setup
- [ ] Auth pages
- [ ] Dashboard partenaire
- [ ] Formulaire commande (VENTE_DIRECTE only)
- [ ] Liste/historique commandes
- [ ] Tests E2E

### Phase 4 - Production & Stock (Semaines 7-8)
- [ ] Planning production
- [ ] Gestion batches
- [ ] Écran cuisine
- [ ] Email-to-Print HP ePrint
- [ ] Stock FIFO
- [ ] Alertes DLC/stock bas

### Phase 5 - Livraisons & Mobile (Semaines 9-10)
- [ ] API Deliveries
- [ ] Flutter app
- [ ] Scanner code-barres
- [ ] Navigation GPS
- [ ] Validation avec signature

### Phase 6 - Site Web (Semaines 11-12)
- [ ] Homepage
- [ ] Pages produits
- [ ] Carte points de vente (3 types)
- [ ] i18n FR (DE/EN préparés)
- [ ] SEO

### Phase 7 - Intégrations (Semaines 13-14)
- [ ] OAuth Bexio
- [ ] Sync contacts/articles
- [ ] Factures QR
- [ ] Google Maps/Places

### Phase 8 - Finalisation (Semaines 15-16)
- [ ] Backoffice complet
- [ ] Documentation
- [ ] Tests de charge
- [ ] Formation
- [ ] Déploiement production

---

## ⚠️ Points d'Attention Critiques

1. **FIFO Obligatoire** - Toujours sortir les lots les plus anciens en premier

2. **Deadline Commandes** - Strictement appliquée sauf urgences approuvées

3. **3 Types de Partenaires**:
   - `VENTE_DIRECTE`: Commande ✅, Facture à livraison
   - `DEPOT_VENTE`: Commande ❌, Facture périodique
   - `AUTOMATE`: Pas d'accès portail, 24h/24 sur carte

4. **S3 Suisse** - Toujours OVH Zurich (conformité nLPD)

5. **Email-to-Print**:
   - Whitelist: print@sdthai.ch
   - Latence: 30-60s
   - Format: PDF only

6. **Traçabilité** - Chaque produit livré lié à son batch

7. **Montant Minimum** - 40 CHF par commande

8. **DLC** - productionDate + 17 jours

---

## 📞 Client

| | |
|---|---|
| **Entreprise** | SD Thai Food Sàrl |
| **Site** | https://sdthai.ch/ |
| **Adresse** | Av. des Figuiers 39, 1007 Lausanne |
| **Email** | info@sdthai.ch |
| **Téléphone** | 021 539 17 16 |
| **Chef** | Dumrong (Daer) Kongsunton (12/20 Gault & Millau) |

---

## 🔧 Commandes

```bash
pnpm install              # Installation
pnpm dev                  # Développement
pnpm build                # Build
pnpm test                 # Tests
pnpm db:generate          # Prisma generate
pnpm db:migrate           # Migration
pnpm db:seed              # Seed data
```

---

## 📁 Variables d'Environnement

```bash
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
JWT_SECRET="min-32-chars"

S3_ENDPOINT="https://s3.gra.perf.cloud.ovh.net"
S3_ACCESS_KEY="..."
S3_SECRET_KEY="..."
S3_BUCKET="sdthai-prod-media"

RESEND_API_KEY="re_..."
PRINTER_EMAIL="abc123@hpeprint.com"

BEXIO_CLIENT_ID="..."
BEXIO_CLIENT_SECRET="..."

GOOGLE_MAPS_API_KEY="..."
```

---

*Document v2.0 - Février 2026 - Prêt pour Claude Code*
