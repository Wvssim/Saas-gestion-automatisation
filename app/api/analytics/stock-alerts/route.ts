import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/db/client";
import { authOptions } from "@/lib/auth/config";
import { StockAlert } from "@/types/dashboard";

const getStockAlerts = async (userId: string): Promise<StockAlert[]> => {
  const integrations = await prisma.integration.findMany({
    where: { userId },
    select: { id: true },
  });

  if (!integrations.length) return [];

  const integrationIds = integrations.map((i) => i.id);

  const lowStockProducts = await prisma.product.findMany({
    where: {
      integrationId: { in: integrationIds },
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      sku: true,
      stock: true,
      minStock: true,
    },
  });

  return lowStockProducts
    .filter((p) => p.stock < p.minStock)
    .map((product) => ({
      id: product.id,
      productName: product.name,
      sku: product.sku || "N/A",
      currentStock: product.stock,
      minStock: product.minStock,
      severity: product.stock === 0 ? "critical" : product.stock < product.minStock * 0.5 ? "high" : "low",
    }));
};

export async function GET(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as any;

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const alerts = await getStockAlerts(session.user.id);
    return NextResponse.json({ success: true, data: alerts });
  } catch (error) {
    console.error("[Stock Alerts] Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
