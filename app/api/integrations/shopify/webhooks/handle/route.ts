import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db/client';
import { productQueue, orderQueue, inventoryQueue } from '@/lib/queue';

/**
 * POST /api/integrations/shopify/webhooks/handle
 * Webhook handler for Shopify events (products, orders, inventory)
 * Validates HMAC-SHA256 signature and enqueues jobs
 */
export async function POST(req: NextRequest) {
  try {
    // Get raw body for HMAC validation
    const body = await req.text();
    const hmac = req.headers.get('X-Shopify-Hmac-SHA256');
    const topic = req.headers.get('X-Shopify-Topic');

    if (!hmac || !topic) {
      return NextResponse.json(
        { error: 'Missing HMAC or Topic header' },
        { status: 400 }
      );
    }

    // Validate HMAC-SHA256
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
    if (!secret) {
      console.error('[Webhooks] SHOPIFY_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    const calculatedHmac = crypto
      .createHmac('sha256', secret)
      .update(body, 'utf8')
      .digest('base64');

    if (calculatedHmac !== hmac) {
      console.warn(`[Webhooks] Invalid HMAC for topic ${topic}. Expected: ${calculatedHmac}, got: ${hmac}`);
      return NextResponse.json(
        { error: 'Invalid HMAC signature' },
        { status: 401 }
      );
    }

    // Parse payload
    const payload = JSON.parse(body);
    const shopId = payload.shop_id?.toString();

    if (!shopId) {
      console.warn('[Webhooks] No shop_id in payload');
      return NextResponse.json(
        { error: 'Invalid payload: missing shop_id' },
        { status: 400 }
      );
    }

    // Find integration by store URL (from payload or metadata)
    const storeUrl = payload.myshopify_domain || extractStoreUrl(payload);

    if (!storeUrl) {
      console.warn('[Webhooks] Could not extract store URL from payload');
      return NextResponse.json(
        { error: 'Could not determine store URL' },
        { status: 400 }
      );
    }

    const integration = await prisma.integration.findFirst({
      where: {
        type: 'shopify',
        storeUrl: storeUrl,
      },
      select: { id: true },
    });

    if (!integration) {
      console.warn(`[Webhooks] No integration found for store: ${storeUrl}`);
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      );
    }

    // Update webhook subscription lastTriggeredAt
    await prisma.webhookSubscription.updateMany({
      where: {
        integrationId: integration.id,
        topic: normalizeWebhookTopic(topic),
      },
      data: {
        lastTriggeredAt: new Date(),
      },
    }).catch(err => {
      console.warn('[Webhooks] Failed to update webhook subscription', err);
    });

    // Route to appropriate queue
    const jobData = {
      integrationId: integration.id,
      payload,
      topic,
      timestamp: new Date(),
    };

    switch (topic) {
      case 'products/update':
      case 'products/create':
        await productQueue.add(jobData, {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
        });
        break;

      case 'orders/create':
      case 'orders/updated':
        await orderQueue.add(jobData, {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
        });
        break;

      case 'inventory_levels/update':
        await inventoryQueue.add(jobData, {
          attempts: 2,
          backoff: { type: 'exponential', delay: 1000 },
        });
        break;

      default:
        console.warn(`[Webhooks] Unknown topic: ${topic}`);
    }

    console.log(`[Webhooks] Enqueued job for topic: ${topic}, integration: ${integration.id}`);

    // Return 200 OK immediately (acknowledge webhook)
    return NextResponse.json({ status: 'received' }, { status: 200 });
  } catch (error) {
    console.error('[Webhooks] Handler error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Extract store URL from webhook payload
 */
function extractStoreUrl(payload: any): string | null {
  if (payload.myshopify_domain) {
    return payload.myshopify_domain;
  }

  // Try to extract from other fields
  if (payload.shop && payload.shop.myshopify_domain) {
    return payload.shop.myshopify_domain;
  }

  if (payload.admin_graphql_api_id) {
    // Format: gid://shopify/Shop/123456
    const match = payload.admin_graphql_api_id.match(/Shop\/(\d+)/);
    if (match) {
      // We'd need to lookup the shop, but we don't have a way to do that from ID alone
      // For now, skip
    }
  }

  return null;
}

/**
 * Normalize Shopify webhook topic to our format
 */
function normalizeWebhookTopic(topic: string): string {
  const normalizedMap: Record<string, string> = {
    'products/update': 'PRODUCTS_UPDATE',
    'products/create': 'PRODUCTS_CREATE',
    'orders/create': 'ORDERS_CREATE',
    'orders/updated': 'ORDERS_UPDATED',
    'inventory_levels/update': 'INVENTORY_LEVELS_UPDATE',
  };

  return normalizedMap[topic] || topic;
}
