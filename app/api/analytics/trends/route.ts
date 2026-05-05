import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { authOptions } from "@/lib/auth/config";
import {
  calculateTrendDataPoints,
  getPeriodDates,
} from "@/lib/analytics/calculations";
import { trendsQuerySchema } from "@/lib/analytics/schemas";
import type { ApiResponse } from "@/types";

interface TrendDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

/**
 * GET /api/analytics/trends
 * Query: ?period=week|month|year
 * Returns: Data points pour chart (date, revenue, orders)
 */
export async function GET(
  req: NextRequest,
): Promise<NextResponse<ApiResponse<TrendDataPoint[]>>> {
  try {
    const session = (await getServerSession(authOptions)) as any;

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Parse query params
    const searchParams = req.nextUrl.searchParams;
    const period = (searchParams.get("period") || "month") as
      | "week"
      | "month"
      | "year";

    // Validate
    try {
      trendsQuerySchema.parse({ period });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: "Invalid period parameter" },
          { status: 400 },
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
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        },
      );
    }

    const integrationIds = integrations.map((i) => i.id);
    const { startDate, endDate } = getPeriodDates(period);

    // Fetch orders for period
    const orders = await prisma.order.findMany({
      where: {
        integrationId: { in: integrationIds },
        order_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { order_date: "asc" },
    });

    // Calculate trend data points
    const trendData = calculateTrendDataPoints(orders, period);

    return NextResponse.json(
      { success: true, data: trendData },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error("[Analytics Trends] Error:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
