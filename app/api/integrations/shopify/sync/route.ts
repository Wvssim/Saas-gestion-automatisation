import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/client';
import { testConnection } from '@/lib/integrations/shopify/sync';
import { productQueue, orderQueue } from '@/lib/queue';

/**
 * POST /api/integrations/shopify/sync
 * Manually trigger Shopify sync via job queue
 * Body: { integrationId: "xxx" }
 * Returns: job IDs for tracking
 */
export async function POST(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { integrationId } = body;

    if (!integrationId) {
      return NextResponse.json(
        { error: 'Missing integrationId' },
        { status: 400 }
      );
    }

    // Vérifier ownership
    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration || integration.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Integration not found or unauthorized' },
        { status: 404 }
      );
    }

    if (integration.type !== 'shopify') {
      return NextResponse.json(
        { error: 'Not a Shopify integration' },
        { status: 400 }
      );
    }

    // Tester connexion avant enqueue
    const canConnect = await testConnection(
      integration.storeUrl || '',
      integration.apiKey
    );

    if (!canConnect) {
      return NextResponse.json(
        { error: 'Cannot connect to Shopify. Check API key.' },
        { status: 401 }
      );
    }

    // Enqueue jobs pour sync async
    const productJob = await productQueue.add(
      { integrationId },
      {
        attempts: 2,
        backoff: { type: 'exponential', delay: 2000 },
        priority: 10, // Manual sync has higher priority
      }
    );

    const orderJob = await orderQueue.add(
      { integrationId },
      {
        attempts: 2,
        backoff: { type: 'exponential', delay: 2000 },
        priority: 10,
      }
    );

    console.log(`[Shopify Sync] Enqueued jobs for integration ${integrationId}:`, {
      productJobId: productJob.id,
      orderJobId: orderJob.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Sync jobs queued. Monitor status at /sync/status',
      jobs: {
        products: productJob.id,
        orders: orderJob.id,
      },
      integrationId,
    });
  } catch (error) {
    console.error('[Shopify] Sync API error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Sync failed',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/integrations/shopify/sync?integrationId=xxx
 * Get sync status + queue stats
 */
export async function GET(request: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as any;
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('integrationId');

    if (!integrationId) {
      return NextResponse.json(
        { error: 'Missing integrationId' },
        { status: 400 }
      );
    }

    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration || integration.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Integration not found or unauthorized' },
        { status: 404 }
      );
    }

    const [productStats, orderStats] = await Promise.all([
      productQueue.getJobCounts(),
      orderQueue.getJobCounts(),
    ]);

    const dbStats = await prisma.$transaction([
      prisma.product.count({
        where: { integrationId },
      }),
      prisma.order.count({
        where: { integrationId },
      }),
    ]);

    return NextResponse.json({
      integration: {
        id: integrationId,
        storeUrl: integration.storeUrl,
        type: integration.type,
        enabled: integration.enabled,
        lastSyncAt: integration.last_sync,
        createdAt: integration.created_at,
        updatedAt: integration.updated_at,
      },
      data: {
        productsCount: dbStats[0],
        ordersCount: dbStats[1],
      },
      queue: {
        products: productStats,
        orders: orderStats,
      },
    });
  } catch (error) {
    console.error('[Shopify] Status API error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to get status',
      },
      { status: 500 }
    );
  }
}
