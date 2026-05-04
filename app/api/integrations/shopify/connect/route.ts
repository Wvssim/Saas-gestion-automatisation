import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import crypto from 'crypto';
import { prisma } from '@/lib/db/client';
import { ValidationError, AuthError } from '@/lib/utils/errors';

/**
 * POST /api/integrations/shopify/connect
 * Initiate Shopify OAuth flow
 * Body: { storeUrl: "example.myshopify.com" }
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier session utilisateur
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { storeUrl } = body;

    // Valider input
    if (!storeUrl || typeof storeUrl !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid storeUrl' },
        { status: 400 }
      );
    }

    // Normaliser URL (remove protocol, trailing slash)
    const normalizedUrl = storeUrl
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '')
      .toLowerCase();

    // Vérifier format Shopify
    if (!normalizedUrl.includes('myshopify.com') && !normalizedUrl.includes('.shopify.com')) {
      return NextResponse.json(
        { error: 'Invalid Shopify store URL format' },
        { status: 400 }
      );
    }

    // Générer state sécurisé (CSRF protection)
    const state = crypto.randomBytes(32).toString('hex');

    // Stocker state en session/cache pour vérification au callback
    // TODO: Implémenter Redis cache ou session storage
    // Pour MVP: stocker temporairement en header set-cookie
    const stateExpiry = Math.floor(Date.now() / 1000) + 600; // 10 min expiry

    // Construire OAuth URL
    const apiKey = process.env.SHOPIFY_API_KEY;
    if (!apiKey) {
      console.error('[Shopify] SHOPIFY_API_KEY not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const scopes = [
      'read_products',
      'read_orders',
      'read_inventory',
      'read_locations',
    ].join(',');

    const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/shopify/callback`;

    const oauthUrl = new URL(`https://${normalizedUrl}/admin/oauth/authorize`);
    oauthUrl.searchParams.set('client_id', apiKey);
    oauthUrl.searchParams.set('scope', scopes);
    oauthUrl.searchParams.set('redirect_uri', redirectUri);
    oauthUrl.searchParams.set('state', state);

    // Créer temporaire state record en DB (TTL + check au callback)
    await prisma.$executeRawUnsafe(
      `INSERT INTO oauth_states (state, store_url, user_id, expires_at) VALUES ($1, $2, $3, to_timestamp($4))
       ON CONFLICT DO NOTHING`,
      state,
      normalizedUrl,
      session.user.id,
      stateExpiry
    );

    console.log(`[Shopify] OAuth initiated for store: ${normalizedUrl}, user: ${session.user.id}`);

    return NextResponse.json({
      oauthUrl: oauthUrl.toString(),
      state, // Return state au client pour optionnel logging
    });
  } catch (error) {
    console.error('[Shopify] Connect error:', error);

    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Failed to initiate OAuth' },
      { status: 500 }
    );
  }
}
