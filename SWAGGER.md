# SD Thai Food - API Documentation Swagger/OpenAPI

## Accès à la Documentation

Une fois l'API déployée et accessible, la documentation Swagger/OpenAPI est disponible à :

**URL:** `https://sdthai.secuaas.dev/api/docs`

## Fonctionnalités

### Interface Interactive
- **Testez les endpoints** directement depuis l'interface
- **Authentification JWT** intégrée (cliquez sur "Authorize" en haut à droite)
- **Exemples de requêtes/réponses** pour chaque endpoint
- **Validation en temps réel** des paramètres

### Tags/Catégories
- **auth** - Authentification (login, refresh, logout, me)
- **users** - Gestion des utilisateurs
- **partners** - Gestion des partenaires
- **products** - Catalogue de produits
- **orders** - Gestion des commandes avec validation deadline
- **partner-sessions** - Sessions d'authentification partenaires
- **pos** - Transactions point de vente
- **returns** - Gestion des retours
- **stock** - Gestion du stock (SALE/DEMO/STAFF)
- **health** - Health check

## Utilisation

### 1. Authentification

1. Dépliez la section **auth**
2. Cliquez sur **POST /api/auth/login**
3. Cliquez sur "Try it out"
4. Entrez les credentials:
   ```json
   {
     "email": "admin@sdthai.ch",
     "password": "Admin123!"
   }
   ```
5. Cliquez sur "Execute"
6. Copiez le **accessToken** de la réponse
7. Cliquez sur le bouton **"Authorize"** en haut à droite
8. Collez le token dans le champ "Value"
9. Cliquez sur "Authorize"

Vous êtes maintenant authentifié et pouvez tester tous les endpoints protégés!

### 2. Tester une Commande avec Livraison sur Place

Une fois authentifié:

1. Dépliez **orders** → **POST /api/orders**
2. Cliquez sur "Try it out"
3. Exemple de commande standard:
   ```json
   {
     "partnerId": "8beef599-c85d-4d75-b093-1b0cc4773f38",
     "requestedDate": "2026-02-15",
     "items": [
       {
         "productId": "9085ae89-c568-492e-be20-4f9f9cd94388",
         "quantity": 5
       }
     ],
     "notes": "Test order"
   }
   ```

4. Exemple de commande avec livraison sur place (ON_SITE):
   ```json
   {
     "partnerId": "8beef599-c85d-4d75-b093-1b0cc4773f38",
     "requestedDate": "2026-02-15",
     "deliveryType": "ON_SITE",
     "onSiteDeliveryTime": "2026-02-15T14:30:00Z",
     "items": [
       {
         "productId": "9085ae89-c568-492e-be20-4f9f9cd94388",
         "quantity": 8
       }
     ],
     "notes": "Delivery on-site at 14:30"
   }
   ```

### 3. Filtres et Recherche

Utilisez la barre de recherche en haut pour filtrer les endpoints par mot-clé.

## Validation Deadline

Les commandes sont soumises à une validation de deadline:

- **STANDARD**: Commande avant 20h00, J-2 avant la livraison → Confirmée automatiquement
- **LATE**: Entre 20h00 J-2 et 05h00 J-1 → Nécessite approbation admin
- **DEROGATION**: Après 05h00 J-1 → Bloqué, contact admin requis

## Types de Livraison

- **STANDARD** (par défaut): Livraison classique selon les jours fixes du partenaire
- **ON_SITE**: Livraison sur place à une heure précise (spécifier `onSiteDeliveryTime`)

## Export de la Spécification

La spécification OpenAPI 3.0 est disponible en JSON:

**URL:** `https://sdthai.secuaas.dev/api/docs-json`

Vous pouvez importer ce fichier dans:
- Postman (File → Import)
- Insomnia
- Autres clients API compatibles OpenAPI

## Version

Documentation pour SD Thai Food API **v0.4.1**

Dernière mise à jour: 2026-02-05

## Notes

- Tous les timestamps sont en UTC (ISO 8601)
- Les UUIDs sont au format standard UUID v4
- La TVA est calculée automatiquement (8.1%)
- Les montants sont en CHF (Francs Suisses)
