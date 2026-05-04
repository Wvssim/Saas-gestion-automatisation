# Shopify Integration

Intégration Shopify complète pour SellFlow. REST API + GraphQL, OAuth 2.0, sync incrémentale, rate limiting.

## Architecture

```
lib/integrations/shopify/
├── client.ts          # ShopifyClient: HTTP requests + rate limiting
├── sync.ts            # Sync orchestration: products + orders
├── transform.ts       # Data transformation: Shopify → DB
├── types.ts           # TypeScript interfaces
├── encryption.ts      # API key encryption utilities
├── logger.ts          # Structured logging

app/api/integrations/shopify/
├── connect/route.ts   # OAuth initiation
├── callback/route.ts  # OAuth callback + token exchange
└── sync/route.ts      # Manual sync trigger
```

## Installation

### 1. Variables d'environnement

```bash
# .env.local
SHOPIFY_API_KEY=xxx
SHOPIFY_API_SECRET=xxx
SHOPIFY_API_VERSION=2024-01
ENCRYPTION_KEY=<openssl rand -base64 32>
```

### 2. Database setup

```bash
npx prisma migrate dev --name add_shopify
```

New tables:
- `integrations` (storeUrl, apiKey encrypté)
- `oauth_states` (CSRF protection)

### 3. Shopify app setup

https://admin.shopify.com/settings/apps-and-integrations/development

1. Create app
2. Set OAuth redirect URI: `https://yourdomain.com/api/integrations/shopify/callback`
3. Required scopes:
   - `read_products`
   - `read_orders`
   - `read_inventory`
   - `read_locations`

## Usage

### Client-side flow

```typescript
// 1. Initiate OAuth
const res = await fetch('/api/integrations/shopify/connect', {
  method: 'POST',
  body: JSON.stringify({ storeUrl: 'mystore.myshopify.com' })
});

const { oauthUrl } = await res.json();
window.location.href = oauthUrl;

// 2. User authorizes → redirects to callback
// 3. Callback exchanges code → stores integration
// 4. Automatic initial sync triggered
```

### Server-side: Manual sync

```typescript
import { sync } from '@/lib/integrations/shopify/sync';

const result = await sync({
  id: integrationId,
  storeUrl: 'mystore.myshopify.com',
  apiKey: accessToken,
  last_sync: lastSyncDate
});

console.log(result);
// { 
//   success: true,
//   productsCount: 150,
//   ordersCount: 45,
//   errors: [],
//   duration: 3200
// }
```

### Server-side: Test connection

```typescript
import { testConnection } from '@/lib/integrations/shopify/sync';

const ok = await testConnection(storeUrl, accessToken);
```

## Features

### Rate Limiting

ShopifyClient respecte les limites Shopify API:
- Default: 40 requests / 1 second
- Automatiquement attend si < 10% capacity
- Extrait `x-shopify-shop-api-call-limit` header

```typescript
const client = new ShopifyClient(storeUrl, accessToken);
// Rate limit géré automatiquement
const products = await client.getProducts(50);
```

### Incremental Sync

Utilise `last_sync` timestamp:

```typescript
// Récupère seulement commandes depuis last_sync
const { orders } = await client.getOrders(integration.last_sync);
```

### Error Handling

Retry automatique pour:
- Timeouts (5xx errors)
- Rate limits (429)
- Network transients

```typescript
const result = await sync(integration);
if (result.errors.length > 0) {
  console.error('Sync warnings:', result.errors);
  // Success flag = true si core data synced, même avec erreurs partielles
}
```

### Data Transformation

```typescript
import {
  mapShopifyProduct,
  mapShopifyOrder,
  validateProductData,
  validateOrderData
} from '@/lib/integrations/shopify/transform';

// Shopify format → DB format
const product = mapShopifyProduct(shopifyProduct, integrationId);

// Validation
if (validateProductData(product)) {
  await prisma.product.create({ data: product });
}
```

### Encryption

API keys stored encrypted via Prisma `@db.Encrypted`.

Optional app-level encryption:

```typescript
import { encryptApiKey, decryptApiKey } from '@/lib/integrations/shopify/encryption';

const encrypted = encryptApiKey(accessToken);
const decrypted = decryptApiKey(encrypted);
```

## API Endpoints

### `POST /api/integrations/shopify/connect`

Initiate OAuth flow.

```bash
curl -X POST http://localhost:3000/api/integrations/shopify/connect \
  -H "Content-Type: application/json" \
  -d '{"storeUrl":"mystore.myshopify.com"}'
```

Response:
```json
{
  "oauthUrl": "https://mystore.myshopify.com/admin/oauth/authorize?...",
  "state": "abc123..."
}
```

### `GET /api/integrations/shopify/callback`

OAuth callback (Shopify redirects here).

### `POST /api/integrations/shopify/sync`

Trigger manual sync.

```bash
curl -X POST http://localhost:3000/api/integrations/shopify/sync \
  -H "Content-Type: application/json" \
  -d '{"integrationId":"clx123..."}'
```

Response:
```json
{
  "success": true,
  "productsCount": 150,
  "ordersCount": 45,
  "errors": [],
  "duration": 3200,
  "lastSyncAt": "2024-01-15T10:30:00Z"
}
```

### `GET /api/integrations/shopify/sync`

Get integration status.

```bash
curl http://localhost:3000/api/integrations/shopify/sync?integrationId=clx123...
```

Response:
```json
{
  "integrationId": "clx123...",
  "storeUrl": "mystore.myshopify.com",
  "type": "shopify",
  "enabled": true,
  "lastSyncAt": "2024-01-15T10:30:00Z",
  "productsCount": 150,
  "ordersCount": 45,
  "createdAt": "2024-01-10T09:00:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

## GraphQL Queries

Optimized GraphQL pour réduire requêtes + bandwidth:

### getProducts query

Fetch 50 produits avec pagination:

```graphql
query GetProducts($first: Int!, $after: String) {
  products(first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        id
        title
        handle
        description
        vendor
        productType
        variants(first: 1) {
          edges {
            node {
              price
              sku
              inventoryQuantity
            }
          }
        }
        featuredImage {
          url
        }
      }
    }
  }
}
```

### getOrders query

Fetch commandes depuis date:

```graphql
query GetOrders($since: DateTime) {
  orders(first: 100, query: $since) {
    edges {
      node {
        id
        name
        totalPrice {
          amount
        }
        fulfillmentStatus
        createdAt
        updatedAt
        lineItems(first: 100) {
          edges {
            node {
              id
              product {
                id
              }
              quantity
              originalUnitPrice {
                amount
              }
              sku
            }
          }
        }
      }
    }
  }
}
```

## Debugging

Enable debug logging:

```bash
DEBUG=shopify npm run dev
```

Logs:
```
[Shopify] 🔍 makeRequest: GET /admin/api/2024-01/graphql.json
[Shopify] ⏱️ getProducts: 1250ms
[Shopify] 📊 Syncing products: 150/150 (100%)
[Shopify] Rate limit capacity low (5.0%), waiting 420ms
```

## Next steps (Phase 2)

- [ ] Webhooks: real-time product updates
- [ ] Webhook signature verification
- [ ] Bulk Operations API pour >250K products
- [ ] Custom metafields sync
- [ ] Inventory sync with locations
- [ ] Job queue (Bull) pour long-running syncs
- [ ] Retry queue + DLQ
- [ ] Analytics dashboard
