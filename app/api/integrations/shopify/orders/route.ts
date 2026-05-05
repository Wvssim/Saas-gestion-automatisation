import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db/client';
import { Prisma } from '@prisma/client';

/**
 * GET /api/integrations/shopify/orders
 * Query params:
 *   - integrationId (required)
 *   - status (optional): pending|shipped|delivered|cancelled
 *   - from (optional): ISO date
 *   - to (optional): ISO date
 *   - limit (optional, default 50, max 200)
 *   - cursor (optional): order id (cursor pagination)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('integrationId');
    const status = searchParams.get('status');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const cursor = searchParams.get('cursor');
    const limitParam = parseInt(searchParams.get('limit') || '50', 10);
    const limit = Math.min(Math.max(1, isNaN(limitParam) ? 50 : limitParam), 200);

    if (!integrationId) {
      return NextResponse.json(
        { error: 'Missing integrationId' },
        { status: 400 }
      );
    }

    // Vérifier ownership
    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
      select: { id: true, userId: true, type: true },
    });

    if (!integration || integration.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Integration not found or unauthorized' },
        { status: 404 }
      );
    }

    // Construire filtre
    const where: Prisma.OrderWhereInput = { integrationId };

    if (status) {
      const allowed = ['pending', 'shipped', 'delivered', 'cancelled'];
      if (!allowed.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Allowed: ${allowed.join(', ')}` },
          { status: 400 }
        );
      }
      where.status = status;
    }

    if (from || to) {
      where.order_date = {};
      if (from) {
        const fromDate = new Date(from);
        if (isNaN(fromDate.getTime())) {
          return NextResponse.json(
            { error: 'Invalid from date' },
            { status: 400 }
          );
        }
        where.order_date.gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        if (isNaN(toDate.getTime())) {
          return NextResponse.json(
            { error: 'Invalid to date' },
            { status: 400 }
          );
        }
        where.order_date.lte = toDate;
      }
    }

    const orders = await prisma.order.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { order_date: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            externalId: true,
            email: true,
            first_name: true,
            last_name: true,
            name: true,
            phone: true,
            city: true,
            country: true,
          },
        },
        line_items: {
          select: {
            id: true,
            externalId: true,
            productId: true,
            variantId: true,
            title: true,
            sku: true,
            quantity: true,
            price: true,
            subtotal: true,
            productInfo: true,
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    const hasMore = orders.length > limit;
    const items = hasMore ? orders.slice(0, limit) : orders;
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1]?.id : null;

    return NextResponse.json({
      orders: items,
      pageInfo: {
        hasMore,
        nextCursor,
        count: items.length,
      },
    });
  } catch (error) {
    console.error('[Shopify] Orders API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch orders',
      },
      { status: 500 }
    );
  }
}
