import { prisma } from '@/lib/db/client';
import { ShopifyClient } from './client';
import {
  mapShopifyProduct,
  mapShopifyOrder,
  validateProductData,
  validateOrderData,
  extractProductsFromShopifyResponse,
  extractOrdersFromShopifyResponse,
} from './transform';
import { InternalError } from '@/lib/utils/errors';

interface SyncResult {
  success: boolean;
  productsCount: number;
  ordersCount: number;
  errors: string[];
  duration: number;
}

/**
 * Synchronise tous les produits depuis Shopify
 */
export async function syncProducts(
  integration: {
    id: string;
    storeUrl: string;
    apiKey: string;
    last_sync?: Date;
  }
): Promise<{ success: boolean; count: number; errors: string[] }> {
  const errors: string[] = [];
  let count = 0;

  try {
    const client = new ShopifyClient(integration.storeUrl, integration.apiKey);

    let cursor: string | undefined;
    let hasNextPage = true;

    while (hasNextPage) {
      try {
        const response = await client.getProducts(50, cursor);
        const products = extractProductsFromShopifyResponse(response);

        for (const shopifyProduct of products) {
          try {
            const mapped = mapShopifyProduct(shopifyProduct, integration.id);

            if (!validateProductData(mapped)) {
              errors.push(`Invalid product: ${shopifyProduct.title}`);
              continue;
            }

            // Upsert (create or update)
            await prisma.product.upsert({
              where: {
                integrationId_externalId: {
                  integrationId: integration.id,
                  externalId: mapped.externalId,
                },
              },
              create: mapped,
              update: {
                name: mapped.name,
                sku: mapped.sku,
                description: mapped.description,
                price: mapped.price,
                stock: mapped.stock,
                imageUrl: mapped.imageUrl,
                updated_at: new Date(),
              },
            });

            count++;
          } catch (err) {
            errors.push(
              `Failed to sync product ${shopifyProduct.title}: ${err instanceof Error ? err.message : String(err)}`
            );
          }
        }

        // Pagination
        hasNextPage = response?.data?.products?.pageInfo?.hasNextPage || false;
        cursor = response?.data?.products?.pageInfo?.endCursor;
      } catch (err) {
        errors.push(
          `Failed to fetch products page: ${err instanceof Error ? err.message : String(err)}`
        );
        break;
      }
    }

    console.log(`[Shopify] Synced ${count} products from ${integration.storeUrl}`);

    return {
      success: errors.length === 0,
      count,
      errors,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Products sync failed: ${msg}`);
    console.error('[Shopify] syncProducts error:', err);

    return {
      success: false,
      count,
      errors,
    };
  }
}

/**
 * Synchronise toutes les commandes depuis Shopify
 */
export async function syncOrders(
  integration: {
    id: string;
    storeUrl: string;
    apiKey: string;
    last_sync?: Date;
  }
): Promise<{ success: boolean; count: number; errors: string[] }> {
  const errors: string[] = [];
  let count = 0;

  try {
    const client = new ShopifyClient(integration.storeUrl, integration.apiKey);

    // Fetch depuis last_sync (incremental)
    const since = integration.last_sync || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: 30j
    const response = await client.getOrders(since);
    const orders = extractOrdersFromShopifyResponse(response);

    for (const shopifyOrder of orders) {
      try {
        const mapped = mapShopifyOrder(shopifyOrder, integration.id);

        if (!validateOrderData(mapped)) {
          errors.push(`Invalid order: ${shopifyOrder.name}`);
          continue;
        }

        // Upsert commande
        await prisma.order.upsert({
          where: {
            integrationId_externalId: {
              integrationId: integration.id,
              externalId: mapped.externalId,
            },
          },
          create: {
            ...mapped,
            productId: null, // Default: pas de produit lié (many-to-many via line items)
          },
          update: {
            quantity: mapped.quantity,
            revenue: mapped.revenue,
            status: mapped.status,
            updated_at: new Date(),
          },
        });

        count++;
      } catch (err) {
        errors.push(
          `Failed to sync order ${shopifyOrder.name}: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }

    console.log(`[Shopify] Synced ${count} orders from ${integration.storeUrl}`);

    return {
      success: errors.length === 0,
      count,
      errors,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push(`Orders sync failed: ${msg}`);
    console.error('[Shopify] syncOrders error:', err);

    return {
      success: false,
      count,
      errors,
    };
  }
}

/**
 * Orchestrate complet: produits + commandes
 * Met à jour last_sync après succès
 */
export async function sync(
  integration: {
    id: string;
    storeUrl: string;
    apiKey: string;
    last_sync?: Date;
  }
): Promise<SyncResult> {
  const startTime = Date.now();
  const allErrors: string[] = [];

  try {
    // Valider integration
    if (!integration.storeUrl || !integration.apiKey) {
      throw new InternalError('Missing integration credentials');
    }

    console.log(`[Shopify] Starting sync for ${integration.storeUrl}`);

    // Sync produits
    const productResult = await syncProducts(integration);
    if (!productResult.success) {
      allErrors.push(...productResult.errors);
    }

    // Sync commandes
    const orderResult = await syncOrders(integration);
    if (!orderResult.success) {
      allErrors.push(...orderResult.errors);
    }

    // Update last_sync timestamp
    await prisma.integration.update({
      where: { id: integration.id },
      data: { last_sync: new Date() },
    });

    const duration = Date.now() - startTime;

    const result: SyncResult = {
      success: allErrors.length === 0,
      productsCount: productResult.count,
      ordersCount: orderResult.count,
      errors: allErrors,
      duration,
    };

    console.log(
      `[Shopify] Sync completed: ${result.productsCount} products, ${result.ordersCount} orders (${result.duration}ms)`
    );

    return result;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    allErrors.push(msg);
    const duration = Date.now() - startTime;

    console.error('[Shopify] Sync failed:', err);

    return {
      success: false,
      productsCount: 0,
      ordersCount: 0,
      errors: allErrors,
      duration,
    };
  }
}

/**
 * Helper: Test connexion
 */
export async function testConnection(
  storeUrl: string,
  accessToken: string
): Promise<boolean> {
  try {
    const client = new ShopifyClient(storeUrl, accessToken);
    const response = await client.getProducts(1);
    return !!response?.data?.products;
  } catch (err) {
    console.warn('[Shopify] Connection test failed:', err);
    return false;
  }
}
