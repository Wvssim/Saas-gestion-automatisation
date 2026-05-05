import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import crypto from 'crypto';
import { prisma } from '@/lib/db/client';
import { AuthError, ValidationError, InternalError } from '@/lib/utils/errors';
import { testConnection } from '@/lib/integrations/shopify/sync';

/**
 * GET /api/integrations/shopify/callback
 * Shopify OAuth callback handler
 * Query: ?code=XXX&state=YYY
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return redirectWithError(
        'Unauthorized. Please sign in.',
        '/integrations/shopify'
      );
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const shop = searchParams.get('shop');

    // Valider params
    if (!code || !state || !shop) {
      return redirectWithError(
        'Missing OAuth parameters',
        '/integrations/shopify'
      );
    }

    // Vérifier state (CSRF protection)
    const stateValid = await verifyOAuthState(state, shop, session.user.id);
    if (!stateValid) {
      console.warn(
        `[Shopify] Invalid state for user ${session.user.id}, shop ${shop}`
      );
      return redirectWithError(
        'Security validation failed. Please try again.',
        '/integrations/shopify'
      );
    }

    // Échanger code → tokens
    const tokenData = await exchangeCodeForToken(code, shop);
    if (!tokenData) {
      return redirectWithError(
        'Failed to authenticate with Shopify',
        '/integrations/shopify'
      );
    }

    const { accessToken, refreshToken, accessTokenExpiresAt } = tokenData;

    // Tester connexion avant stockage
    const connected = await testConnection(shop, accessToken);
    if (!connected) {
      return redirectWithError(
        'Shopify connection failed. Invalid credentials.',
        '/integrations/shopify'
      );
    }

    // Créer/update intégration
    const integration = await prisma.integration.upsert({
      where: {
        userId_type_storeUrl: {
          userId: session.user.id,
          type: 'shopify',
          storeUrl: shop,
        },
      },
      create: {
        userId: session.user.id,
        type: 'shopify',
        storeUrl: shop,
        apiKey: accessToken, // Encrypté via Prisma @db.Encrypted
        refreshToken: refreshToken || null,
        accessTokenExpiresAt: accessTokenExpiresAt || null,
        enabled: true,
      },
      update: {
        apiKey: accessToken,
        refreshToken: refreshToken || null,
        accessTokenExpiresAt: accessTokenExpiresAt || null,
        enabled: true,
        updated_at: new Date(),
      },
    });

    console.log(
      `[Shopify] Integration created/updated: ${integration.id}, store: ${shop}`
    );

    // Déclencher sync initial
    // TODO: Dispatcher job queue (Bull/RabbitMQ) si volume élevé
    // Pour MVP: sync synchrone
    setTimeout(async () => {
      try {
        const { sync } = await import('@/lib/integrations/shopify/sync');
        await sync({
          id: integration.id,
          storeUrl: shop,
          apiKey: accessToken,
          refreshToken: refreshToken || undefined,
          accessTokenExpiresAt: accessTokenExpiresAt || undefined,
        });
      } catch (err) {
        console.error('[Shopify] Initial sync failed:', err);
      }
    }, 1000);

    // Rediriger avec succès
    return NextResponse.redirect(
      new URL('/integrations/shopify?connected=true', request.url)
    );
  } catch (error) {
    console.error('[Shopify] Callback error:', error);
    return redirectWithError(
      'An unexpected error occurred',
      '/integrations/shopify'
    );
  }
}

/**
 * Vérifier state (anti-CSRF)
 */
async function verifyOAuthState(
  state: string,
  shop: string,
  userId: string
): Promise<boolean> {
  try {
    const result = await prisma.$queryRawUnsafe<
      Array<{ store_url: string; user_id: string }>
    >(
      `SELECT store_url, user_id FROM oauth_states
       WHERE state = $1 AND expires_at > now()`,
      state
    );

    if (!result || result.length === 0) {
      return false;
    }

    const record = result[0]!;
    const normalizedShop = shop
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
      .toLowerCase();

    // Vérifier shop + userId match
    return (
      record.store_url === normalizedShop &&
      record.user_id === userId
    );
  } catch (err) {
    console.error('[Shopify] State verification error:', err);
    return false;
  }
}

/**
 * Échanger code authorization → access token
 */
async function exchangeCodeForToken(
  code: string,
  shop: string
): Promise<{
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresAt?: Date;
} | null> {
  try {
    const apiSecret = process.env.SHOPIFY_API_SECRET;
    if (!apiSecret) {
      throw new Error('SHOPIFY_API_SECRET not configured');
    }

    const normalizedShop = shop
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
      .toLowerCase();

    const body = {
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: apiSecret,
      code,
    };

    const response = await fetch(
      `https://${normalizedShop}/admin/oauth/access_token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(
        `Token exchange failed: ${error?.errors || response.statusText}`
      );
    }

    const data = await response.json();
    const accessToken: string | undefined = data.access_token;
    const refreshToken: string | undefined = data.refresh_token;
    const expiresIn: number | undefined = data.expires_in;

    if (!accessToken) {
      throw new Error('No access token in response');
    }

    // Buffer 60s pour rafraîchir avant expiration réelle
    const TOKEN_BUFFER_SEC = 60;
    const accessTokenExpiresAt = expiresIn
      ? new Date(Date.now() + (expiresIn - TOKEN_BUFFER_SEC) * 1000)
      : undefined;

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
    };
  } catch (err) {
    console.error('[Shopify] Token exchange error:', err);
    return null;
  }
}

/**
 * Helper: Redirection avec erreur
 */
function redirectWithError(message: string, redirectPath: string): NextResponse {
  const url = new URL(redirectPath, process.env.NEXTAUTH_URL);
  url.searchParams.set('error', encodeURIComponent(message));
  return NextResponse.redirect(url);
}
