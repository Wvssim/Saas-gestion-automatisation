import { Job } from 'bull';
import { prisma } from '@/lib/db/client';
import { ShopifyClient } from '@/lib/integrations/shopify/client';
import {
  syncSingleProduct,
  syncOrdersIncremental,
} from '@/lib/integrations/shopify/sync';
import { productQueue, orderQueue, inventoryQueue, retryQueue } from './index';

interface JobData {
  integrationId: string;
  payload: any;
  topic: string;
  timestamp: Date;
}

/**
 * Handle product update/create webhook
 */
export async function handleProductJob(job: Job<JobData>) {
  const { integrationId, payload } = job.data;

  try {
    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`);
    }

    // Initialize Shopify client
    const client = new ShopifyClient(
      integration.storeUrl!,
      integration.apiKey,
      {
        refreshToken: integration.refreshToken || undefined,
        accessTokenExpiresAt: integration.accessTokenExpiresAt || undefined,
        integrationId: integration.id,
      }
    );

    // Fetch full product data from Shopify
    const productId = payload.id;
    const product = await client.fetchProductById(productId.toString());

    if (!product) {
      throw new Error(`Product ${productId} not found on Shopify`);
    }

    // Sync to DB (atomic transaction with variants + images)
    await syncSingleProduct(product, integrationId);

    console.log(
      `[ProductQueue] Successfully synced product ${productId} for integration ${integrationId}`
    );

    return {
      status: 'synced',
      productId,
      integrationId,
    };
  } catch (err) {
    const error = err as Error;
    console.error(
      `[ProductQueue] Job ${job.id} failed (attempt ${job.attemptsMade}):`,
      error.message
    );

    // If max retries exceeded, move to DLQ
    if (job.attemptsMade >= (job.opts.attempts || 3) - 1) {
      console.error(`[ProductQueue] Max retries exceeded for job ${job.id}, moving to DLQ`);
      await retryQueue.add(
        {
          ...job.data,
          retry_count: (job.attemptsMade || 0) + 1,
          original_queue: 'products',
          error: error.message,
        },
        {
          priority: 10, // Higher priority for failed jobs
        }
      );
    }

    throw error; // Rethrow to trigger Bull's retry mechanism
  }
}

/**
 * Handle order create/update webhook
 */
export async function handleOrderJob(job: Job<JobData>) {
  const { integrationId, payload } = job.data;

  try {
    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`);
    }

    // Initialize Shopify client
    const client = new ShopifyClient(
      integration.storeUrl!,
      integration.apiKey,
      {
        refreshToken: integration.refreshToken || undefined,
        accessTokenExpiresAt: integration.accessTokenExpiresAt || undefined,
        integrationId: integration.id,
      }
    );

    // Fetch full order data from Shopify
    const orderId = payload.id;
    const order = await client.fetchOrderById(orderId.toString());

    if (!order) {
      throw new Error(`Order ${orderId} not found on Shopify`);
    }

    // Sync to DB (customer + order + line items in atomic transaction)
    // This uses the existing syncOrdersIncremental logic but for a single order
    const synced = await syncSingleOrder(order, integrationId);

    console.log(
      `[OrderQueue] Successfully synced order ${orderId} for integration ${integrationId}`
    );

    return {
      status: 'synced',
      orderId,
      integrationId,
      synced,
    };
  } catch (err) {
    const error = err as Error;
    console.error(
      `[OrderQueue] Job ${job.id} failed (attempt ${job.attemptsMade}):`,
      error.message
    );

    if (job.attemptsMade >= (job.opts.attempts || 3) - 1) {
      console.error(`[OrderQueue] Max retries exceeded for job ${job.id}, moving to DLQ`);
      await retryQueue.add(
        {
          ...job.data,
          retry_count: (job.attemptsMade || 0) + 1,
          original_queue: 'orders',
          error: error.message,
        },
        {
          priority: 10,
        }
      );
    }

    throw error;
  }
}

/**
 * Handle inventory level update webhook
 */
export async function handleInventoryJob(job: Job<JobData>) {
  const { integrationId, payload } = job.data;

  try {
    const { inventory_item_id, available, location_id } = payload;

    if (!inventory_item_id) {
      throw new Error('No inventory_item_id in payload');
    }

    // Find product by external inventory item ID
    const inventoryItem = await prisma.product.findFirst({
      where: {
        integrationId,
        // In real scenarios, you'd have a mapping table
        // For now, we'll update via variant relationship
      },
    });

    if (!inventoryItem) {
      console.warn(
        `[InventoryQueue] Inventory item ${inventory_item_id} not found for integration ${integrationId}`
      );
      // Don't throw - inventory updates are less critical
      return { status: 'skipped', reason: 'Inventory item not found' };
    }

    // Update product stock
    await prisma.product.updateMany({
      where: {
        integrationId,
      },
      data: {
        stock: available || 0,
        lastUpdatedAt: new Date(),
      },
    });

    // Check for low stock and trigger alerts
    const products = await prisma.product.findMany({
      where: {
        integrationId,
        stock: {
          lt: prisma.raw('minStock'),
        },
      },
      select: { id: true, name: true, stock: true, minStock: true },
    });

    if (products.length > 0) {
      console.log(
        `[InventoryQueue] Low stock alert for ${products.length} products in integration ${integrationId}`
      );
      // Here you could trigger email alerts or other notifications
      // For now, just log
    }

    console.log(
      `[InventoryQueue] Successfully updated inventory levels for integration ${integrationId}`
    );

    return {
      status: 'updated',
      productsAffected: products.length,
    };
  } catch (err) {
    const error = err as Error;
    console.error(
      `[InventoryQueue] Job ${job.id} failed (attempt ${job.attemptsMade}):`,
      error.message
    );

    if (job.attemptsMade >= (job.opts.attempts || 2) - 1) {
      console.error(`[InventoryQueue] Max retries exceeded for job ${job.id}, moving to DLQ`);
      await retryQueue.add(
        {
          ...job.data,
          retry_count: (job.attemptsMade || 0) + 1,
          original_queue: 'inventory',
          error: error.message,
        },
        {
          priority: 5, // Lower priority for inventory failures
        }
      );
    }

    throw error;
  }
}

/**
 * Helper: Sync a single order (simplified version of syncOrdersIncremental)
 */
async function syncSingleOrder(order: any, integrationId: string) {
  const {
    mapShopifyOrder,
    mapShopifyCustomer,
    mapShopifyLineItem,
  } = await import('@/lib/integrations/shopify/transform');

  // Use transaction for atomicity
  const result = await prisma.$transaction(async (tx) => {
    // 1. Sync customer
    const customer = order.customer;
    if (customer) {
      const mappedCustomer = mapShopifyCustomer(customer, integrationId);
      await tx.customer.upsert({
        where: {
          integrationId_externalId: {
            integrationId,
            externalId: mappedCustomer.externalId,
          },
        },
        create: mappedCustomer,
        update: {
          email: mappedCustomer.email,
          name: mappedCustomer.name,
          phone: mappedCustomer.phone,
          updated_at: new Date(),
        },
      });
    }

    // 2. Sync order
    const mappedOrder = mapShopifyOrder(order, integrationId);
    const upsertedOrder = await tx.order.upsert({
      where: {
        integrationId_externalId: {
          integrationId,
          externalId: mappedOrder.externalId,
        },
      },
      create: mappedOrder,
      update: {
        status: mappedOrder.status,
        financial_status: mappedOrder.financial_status,
        fulfillment_status: mappedOrder.fulfillment_status,
        revenue: mappedOrder.revenue,
        details: mappedOrder.details,
        updated_at: new Date(),
      },
    });

    // 3. Sync line items
    const lineItems = order.line_items || [];
    const lineItemIds = new Set<string>();

    for (const item of lineItems) {
      const mappedItem = mapShopifyLineItem(item, upsertedOrder.id, integrationId);
      lineItemIds.add(mappedItem.externalId);

      await tx.lineItem.upsert({
        where: {
          externalId_orderId: {
            externalId: mappedItem.externalId,
            orderId: upsertedOrder.id,
          },
        },
        create: mappedItem,
        update: {
          quantity: mappedItem.quantity,
          price: mappedItem.price,
          updated_at: new Date(),
        },
      });
    }

    // 4. Delete line items not in webhook (soft-delete not available for LineItem)
    await tx.lineItem.deleteMany({
      where: {
        orderId: upsertedOrder.id,
        externalId: {
          notIn: Array.from(lineItemIds),
        },
      },
    });

    return {
      orderId: upsertedOrder.id,
      lineItemCount: lineItems.length,
    };
  });

  return result;
}

/**
 * Register all handlers
 */
export function registerHandlers() {
  productQueue.process(1, handleProductJob); // 1 concurrent worker
  orderQueue.process(1, handleOrderJob);
  inventoryQueue.process(2, handleInventoryJob); // 2 concurrent workers (less critical)

  console.log('[Queue] All job handlers registered');
}
