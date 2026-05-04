/**
 * Shopify Integration Usage Examples
 * Reference pour implémentation dans les composants React
 */

import { ShopifyClient } from './client';
import { sync, testConnection } from './sync';
import {
  mapShopifyProduct,
  mapShopifyOrder,
  validateProductData,
  validateOrderData,
} from './transform';

/**
 * Example 1: Tester connexion Shopify avant créer integration
 */
export async function exampleTestConnection() {
  const storeUrl = 'mystore.myshopify.com';
  const accessToken = 'shpua_...';

  const isConnected = await testConnection(storeUrl, accessToken);

  if (isConnected) {
    console.log('✓ Connected to Shopify');
  } else {
    console.error('✗ Connection failed');
  }
}

/**
 * Example 2: Utiliser ShopifyClient pour requêtes manuelles
 */
export async function exampleShopifyClient() {
  const client = new ShopifyClient(
    'mystore.myshopify.com',
    'shpua_...'
  );

  // Récupérer produits (avec pagination)
  try {
    const { products, nextCursor } = await client.getProducts(50);
    console.log(`Found ${products.length} products`);

    if (nextCursor) {
      const { products: nextBatch } = await client.getProducts(
        50,
        nextCursor
      );
      console.log(`Next batch: ${nextBatch.length} products`);
    }
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }

  // Récupérer commandes depuis date
  try {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - 7); // Last 7 days

    const { orders } = await client.getOrders(sinceDate);
    console.log(`Found ${orders.length} orders`);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
  }

  // Récupérer variantes produit
  try {
    const variants = await client.getProductVariants(
      'gid://shopify/Product/123456789'
    );
    console.log(`Product has ${variants.length} variants`);
  } catch (error) {
    console.error('Failed to fetch variants:', error);
  }
}

/**
 * Example 3: Sync complet (products + orders)
 */
export async function exampleFullSync() {
  const integration = {
    id: 'integration_123',
    storeUrl: 'mystore.myshopify.com',
    apiKey: 'shpua_...',
    last_sync: new Date('2024-01-10'),
  };

  const result = await sync(integration);

  console.log('Sync result:', {
    success: result.success,
    products: result.productsCount,
    orders: result.ordersCount,
    errors: result.errors,
    duration: `${result.duration}ms`,
  });

  if (!result.success && result.errors.length > 0) {
    console.warn('Sync had errors:');
    result.errors.forEach((err) => console.warn(`  - ${err}`));
  }
}

/**
 * Example 4: Mapper données Shopify → DB format
 */
export async function exampleDataMapping() {
  const shopifyProduct = {
    id: 'gid://shopify/Product/123456789',
    title: 'Awesome Product',
    handle: 'awesome-product',
    description: 'A great product',
    vendor: 'MyVendor',
    productType: 'Apparel',
    variants: {
      edges: [
        {
          node: {
            price: '29.99',
            sku: 'SKU-001',
            inventoryQuantity: 50,
          },
        },
      ],
    },
    featuredImage: {
      url: 'https://...',
    },
  };

  const integrationId = 'integration_123';

  // Transform
  const mapped = mapShopifyProduct(shopifyProduct, integrationId);

  console.log('Mapped product:', {
    externalId: mapped.externalId,
    name: mapped.name,
    sku: mapped.sku,
    price: mapped.price.toString(),
    stock: mapped.stock,
    imageUrl: mapped.imageUrl,
  });

  // Valider
  if (validateProductData(mapped)) {
    console.log('✓ Product data is valid');
    // Safe to store in database
  } else {
    console.error('✗ Product data is invalid');
  }
}

/**
 * Example 5: Handle errors robustement
 */
export async function exampleErrorHandling() {
  const client = new ShopifyClient(
    'invalid-store.myshopify.com',
    'invalid_token'
  );

  try {
    const { products } = await client.getProducts(50);
    console.log(`Got ${products.length} products`);
  } catch (error) {
    if (error instanceof Error) {
      const errorMsg = error.message;

      if (errorMsg.includes('Invalid Shopify access token')) {
        console.error('❌ Auth error: Check API key');
      } else if (errorMsg.includes('Too many requests')) {
        console.warn('⚠️  Rate limited: Retry in 60s');
      } else if (errorMsg.includes('timeout')) {
        console.error('⏱️ Timeout: Network issue or Shopify slow');
      } else {
        console.error('Unknown error:', errorMsg);
      }
    }
  }
}

/**
 * Example 6: Incremental sync (depuis last_sync)
 */
export async function exampleIncrementalSync() {
  // Get last successful sync from DB
  const integration = {
    id: 'integration_123',
    storeUrl: 'mystore.myshopify.com',
    apiKey: 'shpua_...',
    last_sync: new Date('2024-01-15T10:30:00Z'), // Last sync was Jan 15
  };

  // sync() seulement fetch données updated since last_sync
  const result = await sync(integration);

  console.log(
    `Only fetched orders since ${integration.last_sync?.toISOString()}`
  );
  console.log(`Result: ${result.ordersCount} new/updated orders`);
}

/**
 * Example 7: React component integration
 */
export async function exampleReactComponent() {
  // File: app/integrations/shopify/ConnectButton.tsx

  const handleConnect = async () => {
    const storeUrl = 'mystore.myshopify.com';

    // 1. Request OAuth URL
    const res = await fetch('/api/integrations/shopify/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeUrl }),
    });

    const { oauthUrl } = await res.json();

    // 2. Redirect to Shopify OAuth
    window.location.href = oauthUrl;
    // User signs in, then callback redirects back + auto-syncs
  };

  return (
    <button onClick={handleConnect}>
      Connect Shopify Store
    </button>
  );
}

/**
 * Example 8: Manual sync button
 */
export async function exampleManualSync(integrationId: string) {
  // File: app/integrations/shopify/SyncButton.tsx

  const handleSync = async () => {
    try {
      const res = await fetch('/api/integrations/shopify/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId }),
      });

      const result = await res.json();

      if (result.success) {
        console.log(`✓ Synced: ${result.productsCount} products, ${result.ordersCount} orders`);
      } else {
        console.error('Sync failed:', result.errors);
      }
    } catch (error) {
      console.error('Sync request failed:', error);
    }
  };

  return (
    <button onClick={handleSync}>
      Sync Now
    </button>
  );
}

/**
 * Example 9: Integration status dashboard
 */
export async function exampleIntegrationStatus(integrationId: string) {
  // File: app/integrations/shopify/StatusCard.tsx

  const res = await fetch(
    `/api/integrations/shopify/sync?integrationId=${integrationId}`
  );

  const status = await res.json();

  const timeSinceSync = status.lastSyncAt
    ? new Date(status.lastSyncAt).toLocaleDateString()
    : 'Never';

  return {
    store: status.storeUrl,
    products: status.productsCount,
    orders: status.ordersCount,
    lastSync: timeSinceSync,
    status: status.enabled ? 'Connected' : 'Disconnected',
  };
}

/**
 * Example 10: Cron job pour sync régulier
 */
export async function exampleCronSync() {
  // File: app/api/cron/shopify-sync/route.ts

  const integrations = await prisma.integration.findMany({
    where: {
      type: 'shopify',
      enabled: true,
    },
  });

  for (const integration of integrations) {
    try {
      const result = await sync({
        id: integration.id,
        storeUrl: integration.storeUrl || '',
        apiKey: integration.apiKey,
        last_sync: integration.last_sync || undefined,
      });

      console.log(`[${integration.id}] Sync: ${result.productsCount} products, ${result.ordersCount} orders`);
    } catch (error) {
      console.error(`[${integration.id}] Sync failed:`, error);
    }
  }
}
