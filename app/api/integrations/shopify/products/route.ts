import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db/client';
import { Prisma } from '@prisma/client';

/**
 * GET /api/integrations/shopify/products
 *
 * Query params:
 *   - integrationId  (required)
 *   - status         active | draft | archived | deleted | all   (default: active)
 *   - limit          1..100  (default: 50)
 *   - cursor         product id (offset cursor)
 *   - search         optional name/sku search
 *
 * Response: { products, pageInfo: { hasNextPage, endCursor }, total }
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('integrationId');
    const status = (searchParams.get('status') || 'active').toLowerCase();
    const search = searchParams.get('search') || '';
    const cursor = searchParams.get('cursor') || undefined;
    const limitRaw = parseInt(searchParams.get('limit') || '50', 10);
    const limit = Math.min(Math.max(isNaN(limitRaw) ? 50 : limitRaw, 1), 100);

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

    // Construire filtre
    const where: Prisma.ProductWhereInput = { integrationId };

    if (status === 'deleted') {
      where.deletedAt = { not: null };
    } else if (status === 'all') {
      // pas de filtre status / deletedAt
    } else if (
      status === 'active' ||
      status === 'draft' ||
      status === 'archived'
    ) {
      where.deletedAt = null;
      where.status = status;
    } else {
      return NextResponse.json(
        { error: 'Invalid status. Use: active, draft, archived, deleted, all' },
        { status: 400 }
      );
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Cursor pagination (id-based, stable order)
    const products = await prisma.product.findMany({
      where,
      take: limit + 1, // +1 pour détecter hasNextPage
      ...(cursor
        ? { skip: 1, cursor: { id: cursor } }
        : {}),
      orderBy: { id: 'asc' },
      include: {
        images: { orderBy: { position: 'asc' } },
        variants: {
          orderBy: { created_at: 'asc' },
          include: { image: true },
        },
      },
    });

    const hasNextPage = products.length > limit;
    const items = hasNextPage ? products.slice(0, limit) : products;
    const endCursor = items.length > 0 ? items[items.length - 1]?.id : null;

    const total = await prisma.product.count({ where });

    return NextResponse.json({
      products: items,
      pageInfo: { hasNextPage, endCursor },
      total,
    });
  } catch (error) {
    console.error('[Shopify] Products API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch products',
      },
      { status: 500 }
    );
  }
}
