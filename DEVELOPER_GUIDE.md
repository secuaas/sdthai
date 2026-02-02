# SD Thai Food - Developer Guide

## Guide de Démarrage pour les Développeurs

Date: 2026-02-02

---

## Nouveaux Modules Backend Disponibles

Ce guide couvre les 5 nouveaux modules backend créés pour SD Thai Food.

---

## 1. Comment utiliser le module Production

### Import du module
```typescript
import { ProductionModule } from './modules/production/production.module';
import { ProductionService } from './modules/production/production.service';
```

### Créer un batch de production
```typescript
// Dans votre service/controller
const batch = await productionService.create({
  productionDate: '2026-02-02',
  items: [
    { productId: 'prod-123', plannedQuantity: 50, notes: 'Commande urgente' },
    { productId: 'prod-456', plannedQuantity: 30 }
  ],
  notes: 'Batch du samedi'
});

// Response:
{
  id: 'batch-xxx',
  batchNumber: '20260202-001',
  productionDate: '2026-02-02',
  expiryDate: '2026-02-19', // Auto-calculé (min shelfLifeDays)
  status: 'PLANNED',
  items: [...],
  ...
}
```

### Consulter le planning de production
```typescript
const planning = await productionService.getPlanning('2026-02-05');

// Response:
{
  date: '2026-02-05',
  orderCount: 12,
  products: [
    {
      product: { id: 'prod-123', nameFr: 'Pad Thai', ... },
      totalQuantity: 85,
      orders: [
        { orderId: 'order-1', partnerName: 'Restaurant A', quantity: 50 },
        { orderId: 'order-2', partnerName: 'Restaurant B', quantity: 35 }
      ]
    },
    ...
  ]
}
```

### Workflow complet
```typescript
// 1. Créer le batch
const batch = await productionService.create({ ... });

// 2. Démarrer la production
await productionService.start(batch.id);
// Status: PLANNED → IN_PROGRESS

// 3. Terminer la production
await productionService.complete(batch.id, {
  items: [
    { productId: 'prod-123', actualQuantity: 48 }, // Ajustement si nécessaire
    { productId: 'prod-456', actualQuantity: 30 }
  ]
});
// Status: IN_PROGRESS → COMPLETED
// StockEntry créés automatiquement
```

---

## 2. Comment utiliser le module Stock

### Import du module
```typescript
import { StockModule } from './modules/stock/stock.module';
import { StockService } from './modules/stock/stock.service';
```

### Consulter le stock disponible
```typescript
// Vue détaillée (par lot)
const stockEntries = await stockService.findAll();

// Vue agrégée (par produit)
const summary = await stockService.getSummary();

// Response:
[
  {
    product: { id: 'prod-123', nameFr: 'Pad Thai', minStockAlert: 10 },
    totalQuantity: 100,
    totalReserved: 20,
    availableQuantity: 80,
    oldestExpiry: '2026-02-15',
    entryCount: 3
  },
  ...
]
```

### Consulter les alertes
```typescript
const alerts = await stockService.getAlerts();

// Response:
{
  lowStock: [
    // Produits avec available < minStockAlert
    { product: {...}, availableQuantity: 5, minStockAlert: 10 }
  ],
  expiringSoon: [
    // Produits expirant dans < 7 jours
    { product: {...}, oldestExpiry: '2026-02-05' }
  ]
}
```

### Réserver du stock (FIFO)
```typescript
// Pour une commande
const reservation = await stockService.reserve('order-id');

// Response:
{
  orderId: 'order-id',
  reservations: [
    {
      stockEntryId: 'stock-1',
      batchNumber: '20260201-001',
      productId: 'prod-123',
      productName: 'Pad Thai',
      quantity: 30
    },
    {
      stockEntryId: 'stock-2',
      batchNumber: '20260202-001',
      productId: 'prod-123',
      productName: 'Pad Thai',
      quantity: 20 // Complément depuis un lot plus récent
    }
  ],
  message: 'Stock reserved successfully'
}

// Si stock insuffisant:
// BadRequestException: "Insufficient stock for product Pad Thai. Missing: 15 units"
```

### Libérer une réservation
```typescript
// Si commande annulée
await stockService.release('order-id');
// Décrémente reservedQuantity sur les lots concernés
```

### Ajustement manuel
```typescript
await stockService.adjustment({
  stockEntryId: 'stock-1',
  quantity: -5, // Peut être négatif (perte)
  notes: 'Produit endommagé lors de la manipulation'
});
// Crée un StockMovement de type ADJUSTMENT
```

---

## 3. Comment utiliser le module Deliveries

### Import du module
```typescript
import { DeliveriesModule } from './modules/deliveries/deliveries.module';
import { DeliveriesService } from './modules/deliveries/deliveries.service';
```

### Créer une livraison
```typescript
// Automatique quand Order.status = READY, ou manuel:
const delivery = await deliveriesService.create({
  orderId: 'order-123',
  scheduledDate: '2026-02-05',
  routeOrder: 1,
  notes: 'Livraison matinale'
});
```

### Assigner un livreur
```typescript
await deliveriesService.assign('delivery-id', 'driver-user-id');
// Vérifie que l'utilisateur a le rôle DRIVER
// Status: PENDING → ASSIGNED
```

### Workflow livreur (app mobile)
```typescript
// 1. Récupérer les livraisons du jour
const todayDeliveries = await deliveriesService.findToday();

// 2. Démarrer une livraison
await deliveriesService.start('delivery-id');
// Status: ASSIGNED → IN_PROGRESS
// Order.status: READY → IN_DELIVERY

// 3. Compléter la livraison
await deliveriesService.complete('delivery-id', {
  signedBy: 'Jean Dupont',
  signatureKey: 'base64-signature-data',
  photoKeys: ['base64-photo-1', 'base64-photo-2'],
  notes: 'Livré en main propre'
});
// Status: IN_PROGRESS → COMPLETED
// Order.status: IN_DELIVERY → DELIVERED
// Stock décrémenté FIFO
// OrderItem.batchId renseigné pour traçabilité

// 3bis. Si échec
await deliveriesService.fail('delivery-id', 'Client absent');
// Status: IN_PROGRESS → FAILED
// Order.status: IN_DELIVERY → READY (réessai possible)
```

---

## 4. Comment utiliser le module Categories

### Import du module
```typescript
import { CategoriesModule } from './modules/categories/categories.module';
import { CategoriesService } from './modules/categories/categories.service';
```

### CRUD simple
```typescript
// Créer
const category = await categoriesService.create({
  nameFr: 'Plats principaux',
  nameDe: 'Hauptgerichte',
  nameEn: 'Main dishes',
  slug: 'main-dishes',
  description: 'Nos plats principaux thaïlandais',
  imageUrl: 'https://...',
  sortOrder: 1,
  isActive: true
});

// Lister (triées par sortOrder)
const categories = await categoriesService.findAll();

// Récupérer avec produits
const category = await categoriesService.findOne('cat-id');
// Retourne la catégorie + liste des produits actifs

// Mettre à jour
await categoriesService.update('cat-id', {
  sortOrder: 2
});

// Supprimer (impossible si produits associés)
await categoriesService.remove('cat-id');
```

---

## 5. Comment utiliser le module Storage

### Import du module
```typescript
import { StorageModule } from './modules/storage/storage.module';
import { StorageService } from './modules/storage/storage.service';
```

### Upload de fichiers
```typescript
// Upload générique
const url = await storageService.uploadFile(buffer, 'path/to/file.jpg');

// Upload signature
const signatureUrl = await storageService.uploadSignature(
  'data:image/png;base64,iVBORw0...',
  'delivery-id'
);

// Upload photo de livraison
const photoUrl = await storageService.uploadDeliveryPhoto(
  'data:image/jpeg;base64,/9j/4AAQ...',
  'delivery-id',
  0 // index
);

// Upload image de catégorie
const categoryImageUrl = await storageService.uploadCategoryImage(
  buffer,
  'category-id'
);

// Upload image de produit
const productImageUrl = await storageService.uploadProductImage(
  buffer,
  'product-id',
  0 // index
);
```

### Récupérer une URL signée
```typescript
const signedUrl = await storageService.getSignedUrl(
  'signatures/delivery-123.png',
  3600 // expire dans 1h
);
```

### Note importante
Le module Storage est actuellement en mode **simulation**. Les méthodes retournent des URLs fictives et loggent dans la console. Pour activer S3 réel, installer `@aws-sdk/client-s3` et implémenter les appels S3.

---

## Intégration Inter-Modules

### Exemple: Workflow Order → Delivery → Stock

```typescript
// 1. Order créée et confirmée
const order = await ordersService.create({
  partnerId: 'partner-123',
  items: [{ productId: 'prod-123', quantity: 50 }],
  requestedDate: '2026-02-05'
});

// 2. Order passe à READY (après production)
await ordersService.update(order.id, { status: 'READY' });

// 3. Delivery créée automatiquement (ou manuellement)
const delivery = await deliveriesService.create({
  orderId: order.id,
  scheduledDate: '2026-02-05'
});

// 4. Stock réservé
await stockService.reserve(order.id);

// 5. Livreur assigné et démarre
await deliveriesService.assign(delivery.id, 'driver-id');
await deliveriesService.start(delivery.id);

// 6. Livraison complétée
await deliveriesService.complete(delivery.id, {
  signedBy: 'Client',
  signatureKey: '...',
  photoKeys: ['...']
});
// Décrémente automatiquement le stock FIFO
// Met à jour OrderItem.batchId pour traçabilité
```

---

## Gestion d'Erreurs

### Exceptions courantes

```typescript
try {
  await productionService.start(batchId);
} catch (error) {
  if (error instanceof NotFoundException) {
    // Batch non trouvé
  }
  if (error instanceof BadRequestException) {
    // Ex: "Batch must be in PLANNED status to start"
  }
}

try {
  await stockService.reserve(orderId);
} catch (error) {
  if (error instanceof BadRequestException) {
    // Ex: "Insufficient stock for product X. Missing: 15 units"
    // → Proposer au client de réduire la quantité ou attendre
  }
}

try {
  await categoriesService.remove(categoryId);
} catch (error) {
  if (error instanceof ConflictException) {
    // Ex: "Cannot delete category with associated products"
  }
}
```

---

## Bonnes Pratiques

### 1. Toujours vérifier le statut avant les transitions
```typescript
// BAD
await productionService.complete(batchId, {...});

// GOOD
const batch = await productionService.findOne(batchId);
if (batch.status !== 'IN_PROGRESS') {
  throw new BadRequestException('Cannot complete batch');
}
await productionService.complete(batchId, {...});
```

### 2. Utiliser les transactions Prisma pour les opérations critiques
```typescript
// Dans un service
await this.prismaService.$transaction(async (tx) => {
  // Décrémente stock
  await tx.stockEntry.update({...});

  // Crée movement
  await tx.stockMovement.create({...});

  // Met à jour order
  await tx.order.update({...});
});
```

### 3. Gérer les cas edge
```typescript
// Vérifier stock avant de créer une commande
const summary = await stockService.getSummary();
const productStock = summary.find(s => s.product.id === productId);

if (productStock.availableQuantity < requestedQuantity) {
  throw new BadRequestException('Insufficient stock');
}
```

### 4. Logger les opérations importantes
```typescript
// Dans les services
this.logger.log(`Batch ${batchNumber} completed, created ${entries.length} stock entries`);
this.logger.warn(`Low stock alert for product ${product.nameFr}`);
this.logger.error(`Failed to upload signature: ${error.message}`);
```

---

## Tests

### Exemple de test unitaire (production.service.spec.ts)
```typescript
describe('ProductionService', () => {
  let service: ProductionService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductionService,
        {
          provide: PrismaService,
          useValue: mockPrismaService
        }
      ]
    }).compile();

    service = module.get<ProductionService>(ProductionService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('generateBatchNumber', () => {
    it('should generate correct format YYYYMMDD-XXX', async () => {
      const date = new Date('2026-02-02');
      const batchNumber = await service['generateBatchNumber'](date);
      expect(batchNumber).toMatch(/^20260202-\d{3}$/);
    });
  });

  describe('complete', () => {
    it('should create stock entries when batch completed', async () => {
      // Mock data
      const batch = { id: 'batch-1', status: 'IN_PROGRESS', items: [...] };

      // Mock Prisma calls
      prisma.productionBatch.findUnique = jest.fn().mockResolvedValue(batch);
      prisma.productionBatch.update = jest.fn().mockResolvedValue({...});

      await service.complete('batch-1', {...});

      expect(prisma.stockEntry.create).toHaveBeenCalledTimes(batch.items.length);
    });
  });
});
```

---

## Debugging

### Activer les logs Prisma
```env
# .env
DATABASE_URL=postgresql://...
LOG_LEVEL=debug
```

### Vérifier les queries Prisma
```typescript
// Dans main.ts ou app.module.ts
const prismaService = app.get(PrismaService);
prismaService.$on('query', (e) => {
  console.log('Query: ' + e.query);
  console.log('Params: ' + e.params);
  console.log('Duration: ' + e.duration + 'ms');
});
```

### Debugger le FIFO
```typescript
// Dans stock.service.ts
const stockEntries = await this.prismaService.stockEntry.findMany({
  where: { productId },
  include: { batch: true },
  orderBy: [
    { batch: { expiryDate: 'asc' } },
    { batch: { productionDate: 'asc' } }
  ]
});

console.log('FIFO order:', stockEntries.map(e => ({
  batchNumber: e.batch.batchNumber,
  expiryDate: e.batch.expiryDate,
  available: e.quantity - e.reservedQuantity
})));
```

---

## Performance Tips

### 1. Utiliser les select pour limiter les données
```typescript
// BAD - récupère tout
const products = await prisma.product.findMany({
  include: { category: true, images: true, stockEntries: true }
});

// GOOD - seulement ce qui est nécessaire
const products = await prisma.product.findMany({
  select: {
    id: true,
    sku: true,
    nameFr: true,
    priceB2b: true,
    category: {
      select: { id: true, nameFr: true }
    }
  }
});
```

### 2. Pagination pour les listes
```typescript
// À implémenter dans les services
async findAll(page: number = 1, limit: number = 50) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    this.prismaService.productionBatch.findMany({
      skip,
      take: limit,
      orderBy: { productionDate: 'desc' }
    }),
    this.prismaService.productionBatch.count()
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
}
```

### 3. Cache pour les données fréquemment consultées
```typescript
// Installer @nestjs/cache-manager
// Dans un service
@Injectable()
export class StockService {
  constructor(
    private prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getAlerts() {
    const cached = await this.cacheManager.get('stock:alerts');
    if (cached) return cached;

    const alerts = await this.calculateAlerts();
    await this.cacheManager.set('stock:alerts', alerts, 300); // 5 min
    return alerts;
  }
}
```

---

## Ressources Utiles

### Documentation officielle
- **NestJS**: https://docs.nestjs.com
- **Prisma**: https://www.prisma.io/docs
- **class-validator**: https://github.com/typestack/class-validator

### Documentation projet
- `/ARCHITECTURE.md` - Architecture complète
- `/API_ENDPOINTS_REFERENCE.md` - Référence API
- `/BACKEND_MODULES_IMPLEMENTATION.md` - Détails techniques
- `/packages/prisma/schema.prisma` - Schéma BDD

### Commandes utiles
```bash
# Développement
pnpm dev

# Build
pnpm build

# Tests
pnpm test

# Générer Prisma Client
pnpm db:generate

# Migrations
pnpm db:migrate

# Seed data
pnpm db:seed

# Lint
pnpm lint
```

---

## Support

Pour toute question:
1. Consulter la documentation dans `/`
2. Lire le code source (bien commenté)
3. Vérifier les tests (exemples d'utilisation)
4. Consulter les logs de l'application

---

**Date de création**: 2026-02-02
**Version**: 1.0
**Auteur**: Claude Sonnet 4.5
