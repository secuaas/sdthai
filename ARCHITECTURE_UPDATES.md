# SD Thai Food - Ajustements Architecture (2026-02-05)

> **Modifications par rapport à ARCHITECTURE.md v2.0**

---

## 🔄 Changements Majeurs

### 1. Types de Partenaires Simplifiés

**AVANT**: 3 types (VENTE_DIRECTE, DEPOT_VENTE, AUTOMATE)

**MAINTENANT**: 2 types principaux
- **Partenaires avec livraison** (5 partenaires)
  - Paiement comptant au livreur
  - 1 ou 2 jours de livraison fixes par semaine
  - Interface téléphone ou ordinateur

- **Dépôts-vente et Automates**
  - Possibilité de passer commande via admin
  - Récupération info stock 2x/jour via API
  - Pas de livraison directe

### 2. Gestion des Produits

**Simplifications**:
- ❌ **PAS de catégorisation des produits** (retirer Category model)
- ❌ **PAS de gestion horaires de production** (retirer ProductionPlan)
- ⏳ **Gestion numéro de lot en attente** (ProductionBatch optionnel)
- ✅ **Activation/désactivation temporaire** depuis backoffice

### 3. Système de Commandes

**Nouvelles règles**:
- **Deadline**: 20h pour l'avant-veille
- **Deadline acceptée jusqu'à**: 5h du matin
- **Après 5h**: Demandes de dérogation (flag `requiresApproval`)
- **Validation admin** pour commandes hors délai

### 4. Nouveaux Modules

#### 4.1 Système POS Basique
```typescript
// Pour dépôts-vente et automates
interface POSTransaction {
  id: string;
  partnerId: string;
  items: POSItem[];
  total: number;
  paymentMethod: 'CASH' | 'CARD' | 'MOBILE';
  timestamp: Date;
  createdBy: string; // Admin user
}
```

#### 4.2 Gestion des Retours (Mobile App)
```typescript
interface Return {
  id: string;
  deliveryId: string;
  items: ReturnItem[];
  reason: 'DAMAGED' | 'WRONG_PRODUCT' | 'EXCESS' | 'OTHER';
  photos: string[]; // S3 URLs
  notes: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}
```

#### 4.3 Produits Démo/Personnel
```typescript
interface StockEntry {
  // ... existing fields
  purpose: 'SALE' | 'DEMO' | 'STAFF';
  assignedTo?: string; // User ID for DEMO/STAFF
}
```

#### 4.4 Livraison sur Place
```typescript
interface Order {
  // ... existing fields
  deliveryType: 'STANDARD' | 'ON_SITE';
  onSiteDeliveryTime?: Date;
  onSiteLocation?: string;
}
```

### 5. Authentification Partenaires

**Session persistante avec code unique**:
```typescript
interface PartnerSession {
  sessionCode: string;      // Code unique 6 caractères
  partnerId: string;
  deviceType: 'DESKTOP' | 'MOBILE';
  expiresAt: null;          // Session illimitée
  lastActivity: Date;
  ipAddress: string;
}
```

**Flow**:
1. Partenaire demande connexion
2. Système génère code unique (ex: `ABC123`)
3. Admin valide le code
4. Session créée sans expiration
5. Partenaire peut utiliser sur ordinateur indéfiniment

### 6. Validation Livraison (LIV-04)

**À valider**: Temps nécessaire pour le processus de livraison
- Envisager un PC dédié pour gérer les validations
- Option: Tablette fixe au lieu de mobile pour certains points

---

## 📊 Impact sur le Modèle de Données

### Modèles à RETIRER
```prisma
❌ model Category              // Pas de catégorisation
❌ model ProductionPlan        // Pas de planning horaires
⏳ model ProductionBatch       // Optionnel, en attente
```

### Modèles à AJOUTER
```prisma
✅ model POSTransaction
✅ model POSItem
✅ model Return
✅ model ReturnItem
✅ model PartnerSession
```

### Modèles à MODIFIER
```prisma
model Product {
  // ... existing
  isActive Boolean @default(true)  // Activation/désactivation temporaire
  // RETIRER: categoryId, category relation
}

model Order {
  // ... existing
  deadlineType String @default("STANDARD")  // "STANDARD" | "LATE" | "DEROGATION"
  requiresApproval Boolean @default(false)
  approvedBy String?
  approvedAt DateTime?
  deliveryType String @default("STANDARD")  // "STANDARD" | "ON_SITE"
  onSiteDeliveryTime DateTime?
  onSiteLocation String?
}

model StockEntry {
  // ... existing
  purpose String @default("SALE")  // "SALE" | "DEMO" | "STAFF"
  assignedTo String?
}

model Partner {
  // ... existing
  paymentMethod String @default("CASH_TO_DRIVER")
  fixedDeliveryDays Json  // [1, 4] = Lundi, Jeudi
  canOrderViaAdmin Boolean @default(false)  // Pour dépôts-vente
  stockSyncEnabled Boolean @default(false)
  stockSyncFrequency String?  // "TWICE_DAILY"
}
```

---

## 🔧 Modifications API

### Nouveaux Endpoints

```typescript
// POS System
POST   /api/pos/transactions
GET    /api/pos/transactions/:partnerId
GET    /api/pos/transactions/:id

// Returns Management
POST   /api/returns
GET    /api/returns
PUT    /api/returns/:id/status
POST   /api/returns/:id/photos

// Partner Sessions
POST   /api/auth/partner/request-session
POST   /api/auth/partner/validate-code
GET    /api/auth/partner/sessions
DELETE /api/auth/partner/sessions/:id

// Product Management
PATCH  /api/products/:id/toggle-active

// Derogation Orders
POST   /api/orders/with-derogation
PUT    /api/orders/:id/approve
```

### Endpoints à RETIRER
```typescript
❌ GET    /api/categories
❌ POST   /api/categories
❌ GET    /api/production/plans
❌ POST   /api/production/plans
```

---

## 📱 Modifications App Mobile

### Nouvelles Fonctionnalités

**Gestion des Retours**:
- Scan code-barres produit
- Photo du produit endommagé
- Sélection raison (liste déroulante)
- Notes libres
- Validation et synchronisation

**POS Mobile** (optionnel):
- Vente rapide pour automates
- Scan produits
- Calcul total
- Enregistrement transaction

---

## 🎨 Modifications Interface

### Backoffice Admin

**Nouveau**:
- Toggle activation/désactivation produits
- Validation codes session partenaires
- Approval commandes hors délai
- Gestion retours avec photos
- Interface POS pour ventes directes
- Gestion produits démo/personnel

**À retirer**:
- Gestion catégories
- Planning production horaires
- Gestion numéros de lot (temporairement)

### Portail Partenaire

**Nouveau**:
- Connexion avec code unique (session permanente)
- Indicateur "Commande hors délai - en attente validation"
- Option livraison sur place

**Modifié**:
- Deadline: afficher "Commande avant 20h pour livraison J+2"
- Afficher jours de livraison fixes

---

## ✅ Actions Immédiates

### Phase 1: Corrections Modèle (Priorité HAUTE)
1. Supprimer Category de schema.prisma
2. Supprimer ProductionPlan de schema.prisma
3. Ajouter champs à Product (isActive)
4. Ajouter champs à Order (deadlineType, requiresApproval, etc.)
5. Ajouter champs à Partner (paymentMethod, canOrderViaAdmin, etc.)
6. Créer models: POSTransaction, Return, PartnerSession

### Phase 2: Ajustements Backend (Priorité HAUTE)
1. Retirer CategoriesModule
2. Modifier OrdersService (nouvelle logique deadline)
3. Créer POSModule
4. Créer ReturnsModule
5. Modifier AuthModule (partner sessions)

### Phase 3: Ajustements Frontend (Priorité MOYENNE)
1. Retirer pages catégories
2. Ajouter toggle activation produits
3. Ajouter interface POS
4. Ajouter validation codes session
5. Ajouter approval commandes

### Phase 4: App Mobile (Priorité MOYENNE)
1. Ajouter module retours
2. Ajouter capture photos
3. Optionnel: POS mobile

---

## 📝 Notes Importantes

1. **Numéros de lot**: Fonctionnalité mise en attente, ne pas développer pour l'instant
2. **LIV-04**: À valider avec l'utilisateur avant implémentation finale
3. **Session partenaire**: Sécurité à renforcer (limitation IP, device fingerprint)
4. **POS**: Garder simple, pas de caisse enregistreuse complète
5. **API Stock dépôts-vente**: Définir format exact et endpoint

---

**Date**: 2026-02-05
**Version**: 2.1
**Status**: Ajustements validés - En cours d'implémentation
