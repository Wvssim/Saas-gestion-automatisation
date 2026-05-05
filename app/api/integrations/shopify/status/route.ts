import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db/client';
import {
  AuthError,
  ValidationError,
  NotFoundError,
  InternalError,
  isApiError,
} from '@/lib/utils/errors';
import { ShopifyClient } from '@/lib/integrations/shopify/client';

/**
 * GET /api/integrations/shopify/status?integrationId=xxx
 * Connection health check:
 *  - tokenValid? (vérifie expiry)
 *  - tokenRefreshed? (rafraîchi si expiré)
 *  - lastSyncAt
 *  - productsCount, ordersCount
 *  - storeUrl, enabled
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      throw new AuthError('Unauthorized');
    }

    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('integrationId');

    if (!integrationId) {
      throw new ValidationError('Missing integrationId');
    }

    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration || integration.userId !== session.user.id) {
      throw new NotFoundError('Integration');
    }

    if (integration.type !== 'shopify') {
      throw new ValidationError('Not a Shopify integration');
    }

    if (!integration.storeUrl) {
      throw new InternalError('Integration missing storeUrl');
    }

    // Init client + check token state
    const client = new ShopifyClient(integration.storeUrl, integration.apiKey, {
      refreshToken: integration.refreshToken || undefined,
      accessTokenExpiresAt: integration.accessTokenExpiresAt,
      integrationId: integration.id,
    });

    const tokenExpired = client.isTokenExpired();
    let tokenRefreshed = false;
    let refreshError: string | undefined;
    let newExpiresAt: Date | undefined = integration.accessTokenExpiresAt || undefined;

    if (tokenExpired && integration.refreshToken) {
      try {
        const refreshed = await client.refreshToken();
        tokenRefreshed = true;
        newExpiresAt = refreshed.accessTokenExpiresAt;
      } catch (err) {
        refreshError = err instanceof Error ? err.message : String(err);
        console.warn('[Shopify] Status: refresh failed:', err);
      }
    }

    const tokenValid = !tokenExpired || tokenRefreshed;

    // Compteurs DB
    const [productsCount, ordersCount] = await prisma.$transaction([
      prisma.product.count({ where: { integrationId } }),
      prisma.order.count({ where: { integrationId } }),
    ]);

    // Health overall
    const healthy = integration.enabled && tokenValid;

    return NextResponse.json({
      success: true,
      data: {
        integrationId: integration.id,
        storeUrl: integration.storeUrl,
        type: integration.type,
        enabled: integration.enabled,
        healthy,
        token: {
          valid: tokenValid,
          expired: tokenExpired,
          refreshed: tokenRefreshed,
          expiresAt: newExpiresAt || null,
          hasRefreshToken: !!integration.refreshToken,
          refreshError: refreshError || null,
        },
        lastSyncAt: integration.last_sync,
        productsCount,
        ordersCount,
        createdAt: integration.created_at,
        updatedAt: integration.updated_at,
      },
    });
  } catch (error) {
    console.error('[Shopify] Status API error:', error);

    if (isApiError(error)) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get status',
      },
      { status: 500 }
    );
  }
}
