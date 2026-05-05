import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/db/client";
import { authOptions } from "@/lib/auth/config";

interface CustomerWithMetrics {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  orders: number;
  revenue: number;
  status: "active" | "vip" | "new" | "inactive";
}

export async function GET(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as any;

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const integrations = await prisma.integration.findMany({
      where: { userId },
      select: { id: true },
    });

    if (!integrations.length) {
      return NextResponse.json({ success: true, data: [] });
    }

    const integrationIds = integrations.map((i) => i.id);

    // Fetch customers with order metrics
    const customers = await prisma.customer.findMany({
      where: {
        integrationId: { in: integrationIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        created_at: true,
        orders: {
          select: {
            id: true,
            revenue: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      take: 100,
    });

    const data: CustomerWithMetrics[] = customers.map((customer) => {
      const orderCount = customer.orders.length;
      const totalRevenue = customer.orders.reduce((sum, order) => sum + Number(order.revenue || 0), 0);
      const isNew = new Date(customer.created_at).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000;
      const isVIP = orderCount > 10;

      return {
        id: customer.id,
        name: customer.name || "Unknown Customer",
        email: customer.email || undefined,
        phone: customer.phone || undefined,
        orders: orderCount,
        revenue: totalRevenue,
        status: isNew ? "new" : isVIP ? "vip" : orderCount > 0 ? "active" : "inactive",
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[Customers] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
