import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { prisma } from '@/lib/db/client';
import { authOptions } from '@/lib/auth/config';
import { topProductsQuerySchema } from '@/lib/analytics/schemas';
import type { ApiResponse } from '@/types';

interface TopProduct {
  id: string;
  name: string;
  sku?: string;
  totalRevenue: number;
  orderCount: number;
  avgPrice: number;
}

/**
 * GET /api/analytics/products/top
 * Query: ?limit=10
 * Returns: Top products par revenue avec pagination
 */
export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<TopProduct[]>>> {
  try {
    const session = await getServerSession(authOptions) as any;

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query params
    const searchParams = req.nextUrl.searchParams;
    const limitStr = searchParams.get('limit') || '10';

    // Validate
    let limit = 10;
    try {
      const validated = topProductsQuerySchema.parse({ limit: parseInt(limitStr) });
      limit = validated.limit;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Invalid limit parameter' },
          { status: 400 }
        );
      }
      throw error;
    }

    const userId = session.user.id;

    // Get user's integrations
    const integrations = await prisma.integration.findMany({
      where: { userId },
      select: { id: true },
    });

    if (!integrations.length) {
      return NextResponse.json(
        { success: true, data: [] },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
          },
        }
      );
    }

    const integrationIds = integrations.map((i) => i.id);

    // Get top products by revenue using raw SQL aggregation
    const topProducts = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        sku: string | null;
        total_revenue: number;
        order_count: number;
        avg_price: number;
      }>
    >`
      SELECT
        p.id,
        p.name,
        p.sku,
        COALESCE(SUM(CAST(o.revenue AS DECIMAL)), 0) as total_revenue,
        COUNT(o.id) as order_count,
        COALESCE(AVG(CAST(o.revenue AS DECIMAL)), 0) as avg_price
      FROM products p
      LEFT JOIN orders o ON p.id = o."productId"
      WHERE p."integrationId" = ANY(ARRAY[${integrationIds.join(',')}]::text[])
      GROUP BY p.id, p.name, p.sku
      ORDER BY total_revenue DESC
      LIMIT ${limit}
    `;

    const data: TopProduct[] = topProducts.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku || undefined,
      totalRevenue: Number(product.total_revenue || 0),
      orderCount: Number(product.order_count || 0),
      avgPrice: Number((product.avg_price || 0).toFixed(2)),
    }));

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        },
      }
    );
  } catch (error) {
    console.error('[Analytics Top Products] Error:', error);

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
