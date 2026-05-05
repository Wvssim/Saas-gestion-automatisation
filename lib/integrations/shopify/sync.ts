import { prisma } from '@/lib/db/client';
import { ShopifyClient } from './client';
import { SHOPIFY_CONFIG } from './config';
import {
  mapShopifyProduct,
  mapShopifyOrder,
  mapShopifyCustomer,
  mapShopifyLineItem,
  mapShopifyVariant,
  mapShopifyImage,
  validateProductData,
  validateOrderData,
  extractProductsFromShopifyResponse,
  extractOrdersFromShopifyResponse,
  extractShopifyId,
} from './transform';
import { InternalError } from '@/lib/utils/errors';

interface SyncResult {
  success: boolean;
  productsCount: number;
  ordersCount: number;
  customersCount: number;
  errors: string[];
  duration: number;
}

export interface ProductSyncError {
  productId: string;
  error: string;
}

export interface ProductSyncResult {
  success: boolean;
  successCount: number;
  failureCount: number;
  deletedCount: number;
  errors: ProductSyncError[];
}

export interface OrderSyncResult {
  success: boolean;
  count: number;
  customersCount: number;
  lineItemsCount: number;
  errors: string[];
}

const PAGE_SIZE = SHOPIFY_CONFIG.sync.productsPerPage;

/**
 * Synchronise un produit unique (variantes + images + lien variant→image)
 */
async function syncSingleProduct(
  shopifyProduct: any,
  integrationId: string
): Promise<void> {
  const mapped = mapShopifyProduct(shopifyProduct, integrationId);

  if (!validateProductData(mapped)) {
    throw new Error(`Invalid product data: ${shopifyProduct.title}`);
  }

  // Transaction atomique: produit + images + variantes
  await prisma.$transaction(async (tx) => {
    // 1. Upsert product (réactive si soft-deleted)
    const product = await tx.product.upsert({
      where: {
        integrationId_externalId: {
          integrationId,
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
        status: mapped.status,
        deletedAt: null, // Restaurer si réapparu
        lastUpdatedAt: new Date(),
        updated_at: new Date(),
      },
    });

    // 2. Sync images (delete absents, upsert présents)
    const imageEdges = shopifyProduct.images?.edges || [];
    const imageIdMap = new Map<string, string>(); // shopifyImageId → DB image id

    const incomingImageIds = imageEdges
      .map((e: any) => extractShopifyId(e.node.id))
      .filter(Boolean);

    // Delete images supprimées
    if (incomingImageIds.length > 0) {
      await tx.productImage.deleteMany({
        where: {
          productId: product.id,
          externalId: { notIn: incomingImageIds },
        },
      });
    } else {
      await tx.productImage.deleteMany({ where: { productId: product.id } });
    }

    // Upsert chaque image
    for (let i = 0; i < imageEdges.length; i++) {
      const imgData = mapShopifyImage(imageEdges[i].node, product.id, i);
      const dbImage = await tx.productImage.upsert({
        where: {
          productId_externalId: {
            productId: product.id,
            externalId: imgData.externalId,
          },
        },
        create: imgData,
        update: {
          src: imgData.src,
          alt: imgData.alt,
          position: imgData.position,
          updated_at: new Date(),
        },
      });
      imageIdMap.set(imgData.externalId, dbImage.id);
    }

    // 3. Sync variantes
    const variantEdges = shopifyProduct.variants?.edges || [];
    const incomingVariantIds = variantEdges
      .map((e: any) => extractShopifyId(e.node.id))
      .filter(Boolean);

    if (incomingVariantIds.length > 0) {
      await tx.productVariant.deleteMany({
        where: {
          productId: product.id,
          externalId: { notIn: incomingVariantIds },
        },
      });
    } else {
      await tx.productVariant.deleteMany({ where: { productId: product.id } });
    }

    for (const edge of variantEdges) {
      const variantData = mapShopifyVariant(edge.node, product.id, imageIdMap);
      await tx.productVariant.upsert({
        where: {
          productId_externalId: {
            productId: product.id,
            externalId: variantData.externalId,
          },
        },
        create: variantData,
        update: {
          title: variantData.title,
          sku: variantData.sku,
          price: variantData.price,
          stock: variantData.stock,
          imageId: variantData.imageId,
          updated_at: new Date(),
        },
      });
    }
  });
}

/**
 * Synchronise tous les produits depuis Shopify
 * - Pagination cursor (pageInfo.hasNextPage / endCursor)
 * - Variantes + images (avec lien variant→image)
 * - Soft delete des produits absents
 * - Status active/draft/archived
 * - Erreur per-produit non-fatale
 */
export async function syncProducts(integration: {
  id: string;
  storeUrl: string;
  apiKey: string;
  refreshToken?: string;
  accessTokenExpiresAt?: Date | null;
  last_sync?: Date;
}): Promise<ProductSyncResult> {
  const errors: ProductSyncError[] = [];
  const seenExternalIds = new Set<string>();
  let successCount = 0;
  let failureCount = 0;

  const client = new ShopifyClient(integration.storeUrl, integration.apiKey, {
    refreshToken: integration.refreshToken,
    accessTokenExpiresAt: integration.accessTokenExpiresAt,
    integrationId: integration.id,
  });

  let cursor: string | undefined;
  let hasNextPage = true;

  while (hasNextPage) {
    let response: any;
    try {
      response = await client.getProducts(PAGE_SIZE, cursor);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ productId: 'page', error: `Fetch page failed: ${msg}` });
      // Erreur de page = arrêt (mais soft-delete saute pour éviter faux positifs)
      return {
        success: false,
        successCount,
        failureCount,
        deletedCount: 0,
        errors,
      };
    }

    const products = extractProductsFromShopifyResponse(response);

    for (const shopifyProduct of products) {
      const externalId = extractShopifyId(shopifyProduct.id);
      seenExternalIds.add(externalId);

      try {
        await syncSingleProduct(shopifyProduct, integration.id);
        successCount++;
      } catch (err) {
        failureCount++;
        const msg = err instanceof Error ? err.message : String(err);
        errors.push({
          productId: externalId || shopifyProduct.title || 'unknown',
          error: msg,
        });
        console.warn(
          `[Shopify] Product ${externalId} sync failed: ${msg}`
        );
      }
    }

    hasNextPage = response?.data?.products?.pageInfo?.hasNextPage || false;
    cursor = response?.data?.products?.pageInfo?.endCursor;
  }

  // Soft delete: produits en DB mais absents du fetch complet
  let deletedCount = 0;
  try {
    const deletion = await prisma.product.updateMany({
      where: {
        integrationId: integration.id,
        externalId: { notIn: Array.from(seenExternalIds) },
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    });
    deletedCount = deletion.count;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    errors.push({ productId: 'soft-delete', error: msg });
  }

  console.log(
    `[Shopify] Products: ${successCount} ok, ${failureCount} failed, ${deletedCount} soft-deleted`
  );

  return {
    success: failureCount === 0,
    successCount,
    failureCount,
    deletedCount,
    errors,
  };
}

/**
 * Upsert un customer Shopify
 * Composite key: (integrationId, externalId)
 * Retourne l'id DB du customer ou null si pas de customer
 */
async function upsertCustomer(
  shopifyCustomer: any,
  integrationId: string
): Promise<string | null> {
  const mapped = mapShopifyCustomer(shopifyCustomer, integrationId);
  if (!mapped) return null;

  try {
    const customer = await prisma.customer.upsert({
      where: {
        integrationId_externalId: {
          integrationId,
          externalId: mapped.externalId,
        },
      },
      create: mapped,
      update: {
        email: mapped.email,
        first_name: mapped.first_name,
        last_name: mapped.last_name,
        name: mapped.name,
        phone: mapped.phone,
        address: mapped.address,
        city: mapped.city,
        province: mapped.province,
        country: mapped.country,
        zip: mapped.zip,
        addresses: mapped.addresses,
        last_seen: mapped.last_seen,
        updated_at: new Date(),
      },
    });
    return customer.id;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      `[Shopify] Customer upsert failed (ext=${mapped.externalId}): ${msg}`
    );
    return null;
  }
}

/**
 * Sync line items pour une commande
 * - Lookup Product par externalId si présent
 * - Snapshot dans productInfo si Product manquant
 * - Delete les line items absents
 */
async function syncOrderLineItems(
  shopifyOrder: any,
  orderId: string,
  integrationId: string
): Promise<{ count: number; errors: string[] }> {
  const errors: string[] = [];
  const lineItemEdges = shopifyOrder.lineItems?.edges || [];
  let count = 0;

  // Préfetch tous les products référencés (un seul query)
  const productExtIds = lineItemEdges
    .map((e: any) => e.node?.product?.id)
    .filter(Boolean)
    .map((id: string) => extractShopifyId(id));

  const productMap = new Map<string, string>();
  if (productExtIds.length > 0) {
    const products = await prisma.product.findMany({
      where: {
        integrationId,
        externalId: { in: productExtIds },
      },
      select: { id: true, externalId: true },
    });
    for (const p of products) {
      productMap.set(p.externalId, p.id);
    }
  }

  const seenLineItemIds: string[] = [];

  for (const edge of lineItemEdges) {
    const li = edge.node;
    if (!li) continue;

    try {
      const externalProductId = li.product?.id
        ? extractShopifyId(li.product.id)
        : null;
      const productId = externalProductId
        ? productMap.get(externalProductId) || null
        : null;

      const mapped = mapShopifyLineItem(li, orderId, productId);

      if (!mapped.externalId) {
        errors.push(`Line item missing externalId in order ${orderId}`);
        continue;
      }

      seenLineItemIds.push(mapped.externalId);

      await prisma.lineItem.upsert({
        where: {
          orderId_externalId: {
            orderId,
            externalId: mapped.externalId,
          },
        },
        create: mapped,
        update: {
          productId: mapped.productId,
          variantId: mapped.variantId,
          title: mapped.title,
          sku: mapped.sku,
          quantity: mapped.quantity,
          price: mapped.price,
          subtotal: mapped.subtotal,
          productInfo: mapped.productInfo,
          updated_at: new Date(),
        },
      });

      count++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`LineItem sync failed: ${msg}`);
      console.warn(`[Shopify] LineItem sync failed: ${msg}`);
    }
  }

  // Cleanup: supprimer line items qui n'apparaissent plus
  if (seenLineItemIds.length > 0) {
    try {
      await prisma.lineItem.deleteMany({
        where: {
          orderId,
          externalId: { notIn: seenLineItemIds },
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[Shopify] LineItem cleanup failed: ${msg}`);
    }
  }

  return { count, errors };
}

/**
 * Synchronise toutes les commandes depuis Shopify
 * - Pagination cursor sur orders
 * - Sync Customer (upsert) avant Order (FK)
 * - Sync LineItems après Order
 * - Status transitions: pending → shipped → delivered → cancelled
 * - Refunds + adjustments stockés dans Order.details (JSON)
 * - Incremental depuis integration.last_sync
 * - Erreur per-order non-fatale
 */
export async function syncOrders(integration: {
  id: string;
  storeUrl: string;
  apiKey: string;
  refreshToken?: string;
  accessTokenExpiresAt?: Date | null;
  last_sync?: Date;
}): Promise<OrderSyncResult> {
  const errors: string[] = [];
  let count = 0;
  let customersCount = 0;
  let lineItemsCount = 0;

  const client = new ShopifyClient(integration.storeUrl, integration.apiKey, {
    refreshToken: integration.refreshToken,
    accessTokenExpiresAt: integration.accessTokenExpiresAt,
    integrationId: integration.id,
  });

  const since =
    integration.last_sync ||
    new Date(Date.now() - SHOPIFY_CONFIG.sync.defaultHistoryDays * 24 * 60 * 60 * 1000);

  let cursor: string | undefined;
  let hasNextPage = true;
  const seenCustomerExtIds = new Set<string>();

  while (hasNextPage) {
    let response: any;
    try {
      response = await client.getOrders(since, PAGE_SIZE, cursor);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Failed to fetch orders page: ${msg}`);
      console.error('[Shopify] Orders page fetch failed:', err);
      break;
    }

    const orders = extractOrdersFromShopifyResponse(response);

    for (const shopifyOrder of orders) {
      try {
        const mapped = mapShopifyOrder(shopifyOrder, integration.id);

        if (!validateOrderData(mapped)) {
          errors.push(`Invalid order: ${shopifyOrder.name || shopifyOrder.id}`);
          continue;
        }

        // 1. Sync customer (avant order pour la FK)
        let customerId: string | null = null;
        if (shopifyOrder.customer) {
          const customerExtId = extractShopifyId(shopifyOrder.customer.id);
          customerId = await upsertCustomer(
            shopifyOrder.customer,
            integration.id
          );
          if (customerId && !seenCustomerExtIds.has(customerExtId)) {
            seenCustomerExtIds.add(customerExtId);
            customersCount++;
          }
        }

        // 2. Upsert order
        const order = await prisma.order.upsert({
          where: {
            integrationId_externalId: {
              integrationId: integration.id,
              externalId: mapped.externalId,
            },
          },
          create: {
            ...mapped,
            productId: null,
            customerId,
          },
          update: {
            customerId,
            name: mapped.name,
            email: mapped.email,
            quantity: mapped.quantity,
            revenue: mapped.revenue,
            status: mapped.status,
            financial_status: mapped.financial_status,
            details: mapped.details,
            order_date: mapped.order_date,
            updated_at: new Date(),
          },
        });

        // 3. Sync line items
        try {
          const liResult = await syncOrderLineItems(
            shopifyOrder,
            order.id,
            integration.id
          );
          lineItemsCount += liResult.count;
          if (liResult.errors.length > 0) {
            errors.push(
              ...liResult.errors.map(
                (e) => `[order ${mapped.externalId}] ${e}`
              )
            );
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push(
            `LineItems sync failed for order ${mapped.externalId}: ${msg}`
          );
        }

        count++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(
          `Failed to sync order ${shopifyOrder.name || shopifyOrder.id}: ${msg}`
        );
        console.warn(`[Shopify] Order sync failed: ${msg}`);
      }
    }

    hasNextPage = response?.data?.orders?.pageInfo?.hasNextPage || false;
    cursor = response?.data?.orders?.pageInfo?.endCursor;
  }

  console.log(
    `[Shopify] Orders: ${count} synced, ${customersCount} customers, ${lineItemsCount} line items, ${errors.length} errors`
  );

  return {
    success: errors.length === 0,
    count,
    customersCount,
    lineItemsCount,
    errors,
  };
}

/**
 * Orchestrate: produits + commandes
 * last_sync mis à jour UNIQUEMENT si succès
 */
export async function sync(integration: {
  id: string;
  storeUrl: string;
  apiKey: string;
  refreshToken?: string;
  accessTokenExpiresAt?: Date | null;
  last_sync?: Date;
}): Promise<SyncResult> {
  const startTime = Date.now();
  const allErrors: string[] = [];

  try {
    if (!integration.storeUrl || !integration.apiKey) {
      throw new InternalError('Missing integration credentials');
    }

    console.log(`[Shopify] Starting sync for ${integration.storeUrl}`);

    const productResult = await syncProducts(integration);
    if (!productResult.success) {
      allErrors.push(
        ...productResult.errors.map((e) => `[${e.productId}] ${e.error}`)
      );
    }

    const orderResult = await syncOrders(integration);
    if (!orderResult.success) {
      allErrors.push(...orderResult.errors);
    }

    // last_sync UNIQUEMENT si tout OK
    const fullySucceeded = productResult.success && orderResult.success;
    if (fullySucceeded) {
      await prisma.integration.update({
        where: { id: integration.id },
        data: { last_sync: new Date() },
      });
    }

    const duration = Date.now() - startTime;
    const result: SyncResult = {
      success: fullySucceeded,
      productsCount: productResult.successCount,
      ordersCount: orderResult.count,
      customersCount: orderResult.customersCount,
      errors: allErrors,
      duration,
    };

    console.log(
      `[Shopify] Sync done: ${result.productsCount} products, ${result.ordersCount} orders, ${result.customersCount} customers (${result.duration}ms)`
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
      customersCount: 0,
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
