import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db/client';
import { authOptions } from '@/lib/auth/config';
import { ShopifyClient } from '@/lib/integrations/shopify/client';
import { SHOPIFY_CONFIG } from '@/lib/integrations/shopify/config';

/**
 * POST /api/integrations/shopify/webhooks/register
 * Register Shopify webhooks for real-time sync
 */
export async function POST(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as any;

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { integrationId } = await req.json();

    if (!integrationId) {
      return NextResponse.json(
        { success: false, error: 'integrationId required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const integration = await prisma.integration.findFirst({
      where: {
        id: integrationId,
        userId: session.user.id,
      },
    });

    if (!integration) {
      return NextResponse.json(
        { success: false, error: 'Integration not found' },
        { status: 404 }
      );
    }

    if (integration.type !== 'shopify') {
      return NextResponse.json(
        { success: false, error: 'Integration is not a Shopify store' },
        { status: 400 }
      );
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

    // Webhook endpoint (must be accessible from Shopify)
    const webhookEndpoint = `${process.env.NEXTAUTH_URL}/api/integrations/shopify/webhooks/handle`;

    // Topics to subscribe
    const topics = [
      'PRODUCTS_UPDATE',
      'ORDERS_CREATE',
      'ORDERS_UPDATED',
      'INVENTORY_LEVELS_UPDATE',
    ];

    const subscriptions: any[] = [];
    const errors: any[] = [];

    // Register each topic
    for (const topic of topics) {
      try {
        const result = await registerWebhook(
          client,
          topic,
          webhookEndpoint
        );

        subscriptions.push({
          topic,
          shopifyWebhookId: result.webhookSubscriptionId,
          active: true,
          endpoint: webhookEndpoint,
        });

        // Store in DB
        await prisma.webhookSubscription.upsert({
          where: {
            integrationId_topic: {
              integrationId: integration.id,
              topic,
            },
          },
          create: {
            integrationId: integration.id,
            shopifyWebhookId: result.webhookSubscriptionId,
            topic,
            endpoint: webhookEndpoint,
            active: true,
          },
          update: {
            shopifyWebhookId: result.webhookSubscriptionId,
            active: true,
            updated_at: new Date(),
          },
        });
      } catch (err) {
        console.error(`[Webhooks] Failed to register ${topic}:`, err);
        errors.push({
          topic,
          error: (err as Error).message,
        });
      }
    }

    return NextResponse.json({
      success: errors.length === 0,
      subscriptions,
      errors: errors.length > 0 ? errors : undefined,
      message: `${subscriptions.length}/${topics.length} webhooks registered`,
    });
  } catch (error) {
    console.error('[Webhooks Register] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Register a single webhook via GraphQL mutation
 */
async function registerWebhook(
  client: ShopifyClient,
  topic: string,
  endpoint: string
): Promise<{ webhookSubscriptionId: string }> {
  const mutation = `
    mutation CreateWebhookSubscription($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
      webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
        webhookSubscription {
          id
          topic
          endpoint {
            __typename
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    topic,
    webhookSubscription: {
      callbackUrl: endpoint,
      format: 'JSON',
    },
  };

  const response = await client.graphql(mutation, variables);

  if (response.errors) {
    throw new Error(`GraphQL error: ${JSON.stringify(response.errors)}`);
  }

  const subscription = response.data?.webhookSubscriptionCreate?.webhookSubscription;
  const userErrors = response.data?.webhookSubscriptionCreate?.userErrors;

  if (userErrors && userErrors.length > 0) {
    throw new Error(`Shopify error: ${userErrors.map((e: any) => e.message).join(', ')}`);
  }

  if (!subscription?.id) {
    throw new Error('No webhook subscription ID returned');
  }

  return {
    webhookSubscriptionId: subscription.id,
  };
}

/**
 * GET /api/integrations/shopify/webhooks/register
 * List registered webhooks
 */
export async function GET(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as any;

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const integrationId = searchParams.get('integrationId');

    if (!integrationId) {
      return NextResponse.json(
        { success: false, error: 'integrationId required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const integration = await prisma.integration.findFirst({
      where: {
        id: integrationId,
        userId: session.user.id,
      },
    });

    if (!integration) {
      return NextResponse.json(
        { success: false, error: 'Integration not found' },
        { status: 404 }
      );
    }

    const subscriptions = await prisma.webhookSubscription.findMany({
      where: {
        integrationId,
      },
      orderBy: { topic: 'asc' },
    });

    return NextResponse.json({
      success: true,
      integrationId,
      subscriptions,
    });
  } catch (error) {
    console.error('[Webhooks List] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
