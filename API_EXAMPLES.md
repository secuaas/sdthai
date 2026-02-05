# SD Thai Food - API Examples (v0.3.0)

## Base URL
```
https://sdthai.secuaas.dev/api
```

## Table des Matières
1. [Authentification](#authentification)
2. [Partner Sessions](#partner-sessions)
3. [POS Transactions](#pos-transactions)
4. [Returns Management](#returns-management)
5. [Orders avec Deadline](#orders-avec-deadline)

---

## Authentification

### Login
```bash
curl -X POST https://sdthai.secuaas.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sdthai.ch","password":"Admin123!"}'
```

**Response:**
```json
{
  "user": {
    "id": "5f0c6297-da82-4f41-ae20-1ce0e820e6f0",
    "email": "admin@sdthai.ch",
    "firstName": "Dumrong",
    "lastName": "Kongsunton",
    "role": "SUPER_ADMIN"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Partner Sessions

### 1. Request Session Code (Public)
```bash
curl -X POST https://sdthai.secuaas.dev/api/partner-sessions/request \
  -H "Content-Type: application/json" \
  -d '{
    "partnerId": "8beef599-c85d-4d75-b093-1b0cc4773f38",
    "deviceType": "DESKTOP"
  }'
```

**Response:**
```json
{
  "sessionCode": "ABC123",
  "message": "Session code generated. Please contact admin to activate.",
  "session": {
    "id": "9205f3fc-a647-4aa0-8e94-7c392d9444cc",
    "partnerId": "8beef599-c85d-4d75-b093-1b0cc4773f38",
    "partnerName": "Restaurant Asiatique Genève",
    "deviceType": "DESKTOP",
    "isActive": false,
    "createdAt": "2026-02-05T18:12:03.958Z"
  }
}
```

### 2. Activate Session (Admin Only)
```bash
curl -X PATCH https://sdthai.secuaas.dev/api/partner-sessions/9205f3fc-a647-4aa0-8e94-7c392d9444cc/activate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Validate Session Code (Public)
```bash
curl -X POST https://sdthai.secuaas.dev/api/partner-sessions/validate \
  -H "Content-Type: application/json" \
  -d '{"sessionCode": "ABC123"}'
```

**Response:**
```json
{
  "valid": true,
  "partner": {
    "id": "8beef599-c85d-4d75-b093-1b0cc4773f38",
    "name": "Restaurant Asiatique Genève",
    "email": "contact@asiatique-geneve.ch",
    "type": "WITH_DELIVERY",
    "isActive": true
  },
  "session": {
    "id": "9205f3fc-a647-4aa0-8e94-7c392d9444cc",
    "sessionCode": "ABC123",
    "deviceType": "DESKTOP",
    "lastActivity": "2026-02-05T18:12:04.128Z"
  }
}
```

### 4. List All Sessions (Admin Only)
```bash
curl https://sdthai.secuaas.dev/api/partner-sessions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Deactivate Session (Admin Only)
```bash
curl -X PATCH https://sdthai.secuaas.dev/api/partner-sessions/9205f3fc-a647-4aa0-8e94-7c392d9444cc/deactivate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## POS Transactions

### 1. Create Transaction (Admin Only)
```bash
curl -X POST https://sdthai.secuaas.dev/api/pos/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "partnerId": "7c7d8661-3330-466b-8fc4-59fe4d872124",
    "paymentMethod": "CARD",
    "items": [
      {
        "productId": "9085ae89-c568-492e-be20-4f9f9cd94388",
        "quantity": 2
      },
      {
        "productId": "20b29e8d-0f3e-4a5c-abd4-0fa67da8622d",
        "quantity": 1
      }
    ],
    "notes": "Customer paid by credit card"
  }'
```

**Response:**
```json
{
  "id": "b02c6b3f-5436-41e3-9066-21dfbc7d8044",
  "partnerId": "7c7d8661-3330-466b-8fc4-59fe4d872124",
  "paymentMethod": "CARD",
  "subtotal": "36.50",
  "vatAmount": "2.96",
  "total": "39.46",
  "createdBy": "5f0c6297-da82-4f41-ae20-1ce0e820e6f0",
  "timestamp": "2026-02-05T18:12:04.128Z",
  "notes": "Customer paid by credit card",
  "partner": {
    "id": "7c7d8661-3330-466b-8fc4-59fe4d872124",
    "name": "Automate EPFL",
    "type": "DEPOT_AUTOMATE"
  },
  "items": [
    {
      "id": "...",
      "productId": "9085ae89-c568-492e-be20-4f9f9cd94388",
      "quantity": 2,
      "unitPrice": "12.50",
      "subtotal": "25.00",
      "product": {
        "id": "9085ae89-c568-492e-be20-4f9f9cd94388",
        "sku": "TH-CUR-001",
        "nameFr": "Curry Rouge Poulet"
      }
    },
    {
      "id": "...",
      "productId": "20b29e8d-0f3e-4a5c-abd4-0fa67da8622d",
      "quantity": 1,
      "unitPrice": "11.50",
      "subtotal": "11.50",
      "product": {
        "id": "20b29e8d-0f3e-4a5c-abd4-0fa67da8622d",
        "sku": "TH-CUR-002",
        "nameFr": "Curry Vert Légumes"
      }
    }
  ]
}
```

### 2. Get All Transactions (Admin Only)
```bash
curl https://sdthai.secuaas.dev/api/pos/transactions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Get Transaction by ID
```bash
curl https://sdthai.secuaas.dev/api/pos/transactions/b02c6b3f-5436-41e3-9066-21dfbc7d8044 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Get Transactions by Partner
```bash
curl https://sdthai.secuaas.dev/api/pos/transactions/partner/7c7d8661-3330-466b-8fc4-59fe4d872124 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Get Partner Statistics
```bash
# All time
curl https://sdthai.secuaas.dev/api/pos/stats/7c7d8661-3330-466b-8fc4-59fe4d872124 \
  -H "Authorization: Bearer YOUR_TOKEN"

# With date range
curl "https://sdthai.secuaas.dev/api/pos/stats/7c7d8661-3330-466b-8fc4-59fe4d872124?startDate=2026-02-01&endDate=2026-02-28" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "totalTransactions": 5,
  "totalRevenue": 197.30,
  "byPaymentMethod": {
    "CARD": {
      "count": 3,
      "total": 118.38
    },
    "CASH": {
      "count": 2,
      "total": 78.92
    }
  },
  "period": {
    "start": "2026-02-01T00:00:00.000Z",
    "end": "2026-02-28T23:59:59.999Z"
  }
}
```

---

## Returns Management

### 1. Create Return (Driver or Admin)
```bash
curl -X POST https://sdthai.secuaas.dev/api/returns \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "partnerId": "8beef599-c85d-4d75-b093-1b0cc4773f38",
    "orderId": "optional-order-id",
    "reason": "DAMAGED",
    "items": [
      {
        "productId": "9085ae89-c568-492e-be20-4f9f9cd94388",
        "quantity": 1
      }
    ],
    "notes": "Product damaged during delivery - packaging broken"
  }'
```

**Return Reasons:**
- `DAMAGED` - Produit endommagé
- `WRONG_PRODUCT` - Mauvais produit livré
- `EXCESS` - Trop livré
- `OTHER` - Autre raison

**Response:**
```json
{
  "id": "616a031b-aba9-424f-8d51-946cee945659",
  "orderId": null,
  "partnerId": "8beef599-c85d-4d75-b093-1b0cc4773f38",
  "reason": "DAMAGED",
  "status": "PENDING",
  "notes": "Product damaged during delivery - packaging broken",
  "createdBy": "5f0c6297-da82-4f41-ae20-1ce0e820e6f0",
  "createdAt": "2026-02-05T18:12:04.203Z",
  "updatedAt": "2026-02-05T18:12:04.203Z",
  "items": [
    {
      "id": "...",
      "productId": "9085ae89-c568-492e-be20-4f9f9cd94388",
      "quantity": 1,
      "product": {
        "id": "9085ae89-c568-492e-be20-4f9f9cd94388",
        "sku": "TH-CUR-001",
        "nameFr": "Curry Rouge Poulet"
      }
    }
  ],
  "photos": []
}
```

### 2. Add Photo to Return (Driver or Admin)
```bash
curl -X POST https://sdthai.secuaas.dev/api/returns/616a031b-aba9-424f-8d51-946cee945659/photos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://s3.amazonaws.com/sdthai/returns/damaged-curry-001.jpg"
  }'
```

### 3. Get Photos for Return
```bash
curl https://sdthai.secuaas.dev/api/returns/616a031b-aba9-424f-8d51-946cee945659/photos \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Update Return Status (Admin Only)
```bash
curl -X PUT https://sdthai.secuaas.dev/api/returns/616a031b-aba9-424f-8d51-946cee945659/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "APPROVED"}'
```

**Status Options:**
- `PENDING` - En attente de traitement
- `APPROVED` - Approuvé
- `REJECTED` - Refusé

### 5. Get All Returns (Admin Only)
```bash
curl https://sdthai.secuaas.dev/api/returns \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Get Returns by Partner
```bash
curl https://sdthai.secuaas.dev/api/returns/partner/8beef599-c85d-4d75-b093-1b0cc4773f38 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Orders avec Deadline

### Règles de Deadline
- **STANDARD**: Commande avant 20h00, J-2 avant livraison
- **LATE**: Entre 20h00 J-2 et 05h00 J-1 (nécessite approbation admin)
- **DEROGATION**: Après 05h00 J-1 (bloqué, contact admin requis)

### Example: Commande Standard
```bash
curl -X POST https://sdthai.secuaas.dev/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "partnerId": "8beef599-c85d-4d75-b093-1b0cc4773f38",
    "requestedDate": "2026-02-10",
    "items": [
      {
        "productId": "9085ae89-c568-492e-be20-4f9f9cd94388",
        "quantity": 5
      }
    ],
    "notes": "Livraison matin si possible"
  }'
```

**Response (STANDARD deadline):**
```json
{
  "id": "...",
  "orderNumber": "ORD-20260205-0003",
  "deadlineType": "STANDARD",
  "requiresApproval": false,
  "status": "CONFIRMED",
  ...
}
```

**Response (LATE deadline):**
```json
{
  "id": "...",
  "orderNumber": "ORD-20260205-0004",
  "deadlineType": "LATE",
  "requiresApproval": true,
  "status": "PENDING",
  "message": "Commande en attente d'approbation (deadline tardive)",
  ...
}
```

**Error (DEROGATION):**
```json
{
  "statusCode": 400,
  "message": "La date limite pour cette livraison était le 08/02/2026 à 20h00. Veuillez contacter l'administrateur pour une dérogation.",
  "error": "Bad Request"
}
```

### Approve Late Order (Admin Only)
```bash
curl -X PATCH https://sdthai.secuaas.dev/api/orders/{orderId} \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "urgentApproved": true
  }'
```

---

## Test Data Created

### Partners
- **WITH_DELIVERY**: Restaurant Asiatique Genève (Lundi, Jeudi)
- **DEPOT_AUTOMATE**: Automate EPFL

### Products
- Curry Rouge Poulet (12.50 CHF)
- Curry Vert Légumes (11.50 CHF)
- Massaman Boeuf (13.50 CHF)
- Tom Yum Crevettes (10.50 CHF)
- Tom Kha Gai (11.00 CHF)

### Test Results
✅ Partner Session: Code `543BEO` created and validated
✅ POS Transaction: 39.46 CHF (2 Curry Rouge + 1 Curry Vert)
✅ Return: 1 damaged Curry Rouge, APPROVED with photo

---

## Notes
- All amounts in CHF
- TVA: 8.1%
- Session codes: 6 uppercase alphanumeric characters
- Order numbers format: `ORD-YYYYMMDD-XXXX`
