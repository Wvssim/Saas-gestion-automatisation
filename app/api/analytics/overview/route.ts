import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db/client';
import { authOptions } from '@/lib/auth/config';
import {
  calculateRevenue,
  calculateAOV,
  calculateConversionRate,
  calculateTrend,
  getPeriodDates,
} from '@/lib/analytics/calculations';
import { ApiError } from '@/lib/utils/errors';
import type { ApiResponse } from '@/types';
import type { DashboardMetrics } from '@/types';

/**
 * GET /api/analytics/overview
 * Returns: Dashboard metrics (revenue, orders, AOV, conversion_rate, trends)
 */
export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<DashboardMetrics>>> {
  try {
    const session = await getServerSession(authOptions) as any;

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user's integrations
    const integrations = await prisma.integration.findMany({
      where: { userId },
      select: { id: true },
    });

    if (!integrations.length) {
      return NextResponse.json(
        {
          success: true,
          data: {
            totalRevenue: 0,
            totalOrders: 0,
            avgOrderValue: 0,
            conversionRate: 0,
            revenueTrend: 0,
            ordersTrend: 0,
          },
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          },
        }
      );
    }

    const integrationIds = integrations.map((i) => i.id);

    // Get current month data
    const { startDate: currentStart, endDate: currentEnd } = getPeriodDates('month');

    const currentOrders = await prisma.order.findMany({
      where: {
        integrationId: { in: integrationIds },
        order_date: {
          gte: currentStart,
          lte: currentEnd,
        },
      },
    });

    // Get previous month data for trends
    const prevStart = new Date(currentStart);
    prevStart.setMonth(prevStart.getMonth() - 1);
    const prevEnd = new Date(currentStart);

    const previousOrders = await prisma.order.findMany({
      where: {
        integrationId: { in: integrationIds },
        order_date: {
          gte: prevStart,
          lte: prevEnd,
        },
      },
    });

    // Calculate metrics
    const currentRevenue = calculateRevenue(currentOrders);
    const previousRevenue = calculateRevenue(previousOrders);
    const revenueTrend = calculateTrend(currentRevenue, previousRevenue);

    const currentOrderCount = currentOrders.length;
    const previousOrderCount = previousOrders.length;
    const ordersTrend = calculateTrend(currentOrderCount, previousOrderCount);

    const data: DashboardMetrics = {
      totalRevenue: Number(currentRevenue.toFixed(2)),
      totalOrders: currentOrderCount,
      avgOrderValue: calculateAOV(currentOrders),
      conversionRate: calculateConversionRate(currentOrders),
      revenueTrend,
      ordersTrend,
    };

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('[Analytics Overview] Error:', error);

    if (error instanceof ApiError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
