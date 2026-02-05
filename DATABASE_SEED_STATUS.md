# État de la Base de Données - SD Thai Food

**Date:** 2026-02-05
**Environnement:** k8s-dev
**Database:** sdthai @ postgres-service.sdthai:5432

## Résumé des Données

### Utilisateurs (5)
| Email | Prénom | Nom | Rôle | Password |
|-------|--------|-----|------|----------|
| admin@sdthai.ch | Dumrong | Kongsunton | SUPER_ADMIN | Admin123! |
| manager@sdthai.ch | Sophie | Bernard | ADMIN | Partner123! |
| marie@asiatique-geneve.ch | Marie | Dupont | PARTNER | Partner123! |
| jean@epicerie-vevey.ch | Jean | Martin | PARTNER | Partner123! |
| driver@sdthai.ch | Luc | Berger | DRIVER | Partner123! |

### Partenaires (6)

#### WITH_DELIVERY (4 partenaires - paiement cash au livreur)
| Nom | Email | Téléphone | Adresse | Jours de livraison |
|-----|-------|-----------|---------|-------------------|
| Restaurant Asiatique Genève | contact@asiatique-geneve.ch | +41 22 345 67 89 | Rue du Rhône 50, 1204 Genève | Lundi (1), Jeudi (4) |
| Epicerie Fine Vevey | info@epicerie-vevey.ch | +41 21 923 45 67 | Avenue Nestlé 12, 1800 Vevey | Mardi (2), Vendredi (5) |
| Traiteur Lausanne | commandes@traiteur-ls.ch | +41 21 312 45 78 | Rue de Bourg 23, 1003 Lausanne | Lundi (1), Mercredi (3), Vendredi (5) |
| Supermarché Bio Nyon | bio@nyon.ch | +41 22 361 98 76 | Place du Marché 8, 1260 Nyon | Mercredi (3) |

#### DEPOT_AUTOMATE (2 points de vente - paiement carte)
| Nom | Email | Téléphone | Adresse |
|-----|-------|-----------|---------|
| Automate EPFL | epfl@sdthai.ch | +41 21 693 11 11 | Route Cantonale, 1015 Lausanne EPFL |
| Dépôt-Vente Gare Lausanne | gare@sdthai.ch | +41 21 539 17 16 | Place de la Gare 9, 1003 Lausanne |

### Produits (9)

#### Currys (3)
| SKU | Code-barres | Nom | Prix B2B |
|-----|-------------|-----|----------|
| TH-CUR-001 | 7640123450001 | Curry Rouge Poulet | 12.50 CHF |
| TH-CUR-002 | 7640123450002 | Curry Vert Légumes | 11.50 CHF |
| TH-CUR-003 | 7640123450003 | Massaman Boeuf | 13.50 CHF |

#### Soupes (2)
| SKU | Code-barres | Nom | Prix B2B |
|-----|-------------|-----|----------|
| TH-SOU-001 | 7640123450004 | Tom Yum Crevettes | 10.50 CHF |
| TH-SOU-002 | 7640123450005 | Tom Kha Gai | 11.00 CHF |

#### Wok (2)
| SKU | Code-barres | Nom | Prix B2B |
|-----|-------------|-----|----------|
| TH-WOK-001 | 7640123450006 | Pad Thai Crevettes | 12.00 CHF |
| TH-WOK-002 | 7640123450007 | Pad Krapao Poulet | 11.50 CHF |

#### Salades (1)
| SKU | Code-barres | Nom | Prix B2B |
|-----|-------------|-----|----------|
| TH-SAL-001 | 7640123450008 | Salade Papaye Verte | 9.50 CHF |

#### Produits Spéciaux (1)
| SKU | Code-barres | Nom | Prix B2B | Usage |
|-----|-------------|-----|----------|-------|
| TH-DEMO-001 | 7640123459999 | Échantillon Découverte | 0.00 CHF | Démo |

### Commandes (2)

| Numéro | Partenaire | Utilisateur | Statut | Date livraison | Produits | HT | TTC |
|--------|------------|-------------|--------|----------------|----------|-----|-----|
| ORD-20260205-0001 | Restaurant Asiatique Genève | admin@sdthai.ch | CONFIRMED | 2026-02-09 | 5× Massaman Boeuf | 67.50 CHF | 72.97 CHF |
| ORD-20260205-0002 | Restaurant Asiatique Genève | admin@sdthai.ch | CONFIRMED | 2026-02-09 | 5× Massaman Boeuf | 67.50 CHF | 72.97 CHF |

## Statistiques

- **Total Utilisateurs:** 5 (1 SUPER_ADMIN, 1 ADMIN, 2 PARTNER, 1 DRIVER)
- **Total Partenaires:** 6 (4 WITH_DELIVERY, 2 DEPOT_AUTOMATE)
- **Total Produits:** 9 (8 réguliers, 1 démo)
- **Total Commandes:** 2 (135 CHF HT, 145.94 CHF TTC)
- **Chiffre d'affaires:** 145.94 CHF TTC

## Notes Techniques

### Jours de Livraison (fixedDeliveryDays)
Stockés en JSON comme array de nombres:
- 0 = Dimanche
- 1 = Lundi
- 2 = Mardi
- 3 = Mercredi
- 4 = Jeudi
- 5 = Vendredi
- 6 = Samedi

Exemple: `[1, 4]` = Livraisons les lundis et jeudis

### TVA
- Taux: 8.1%
- Calculée automatiquement par le service Orders
- Appliquée sur le subtotal des produits

### Mot de Passe
- Admin: `Admin123!`
- Autres: `Partner123!`
- Hash bcrypt avec salt rounds = 10

## Prochaines Données à Créer

1. Plus d'utilisateurs PARTNER liés aux autres partenaires
2. Commandes pour différents partenaires
3. Commandes avec plusieurs produits différents
4. Commandes urgentes (isUrgent: true)
5. Commandes pour tester validation jours de livraison

## Commandes Utiles

### Statistiques
```sql
-- Compter les entités
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'partners', COUNT(*) FROM partners
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'orders', COUNT(*) FROM orders;

-- Chiffre d'affaires
SELECT SUM(CAST(total AS DECIMAL)) as ca_total FROM orders WHERE status != 'CANCELLED';

-- Produits les plus vendus
SELECT p."nameFr", SUM(oi.quantity) as total_qty, SUM(CAST(oi.subtotal AS DECIMAL)) as ca
FROM order_items oi
JOIN products p ON p.id = oi."productId"
GROUP BY p.id, p."nameFr"
ORDER BY total_qty DESC;
```

### Connexion API
```bash
# Login
curl -X POST https://sdthai.secuaas.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sdthai.ch","password":"Admin123!"}'

# Liste produits
curl https://sdthai.secuaas.dev/api/products \
  -H "Authorization: Bearer <token>"
```
