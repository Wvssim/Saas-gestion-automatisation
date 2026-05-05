import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db/client';
import { sync, testConnection } from '@/lib/integrations/shopify/sync';

/**
 * POST /api/integrations/shopify/sync
 * Manually trigger Shopify sync
 * Body: { integrationId: "xxx" }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
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

    // Tester connexion avant sync
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

    // Déclencher sync
    const result = await sync({
      id: integration.id,
      storeUrl: integration.storeUrl || '',
      apiKey: integration.apiKey,
      refreshToken: integration.refreshToken || undefined,
      accessTokenExpiresAt: integration.accessTokenExpiresAt,
      last_sync: integration.last_sync || undefined,
    });

    return NextResponse.json({
      success: result.success,
      productsCount: result.productsCount,
      ordersCount: result.ordersCount,
      errors: result.errors,
      duration: result.duration,
      lastSyncAt: new Date(),
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
 * Get sync status
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
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

    const stats = await prisma.$transaction([
      prisma.product.count({
        where: { integrationId },
      }),
      prisma.order.count({
        where: { integrationId },
      }),
    ]);

    return NextResponse.json({
      integrationId,
      storeUrl: integration.storeUrl,
      type: integration.type,
      enabled: integration.enabled,
      lastSyncAt: integration.last_sync,
      productsCount: stats[0],
      ordersCount: stats[1],
      createdAt: integration.created_at,
      updatedAt: integration.updated_at,
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
