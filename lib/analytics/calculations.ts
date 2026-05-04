import { Decimal } from '@prisma/client/runtime/library';

/**
 * Order interface for calculations
 */
export interface OrderData {
  revenue: Decimal | number;
  quantity: number;
  order_date: Date;
  status: string;
}

/**
 * Calculate total revenue from orders
 */
export function calculateRevenue(orders: OrderData[]): number {
  return orders.reduce((sum, order) => {
    const revenue = typeof order.revenue === 'string'
      ? parseFloat(order.revenue)
      : Number(order.revenue);
    return sum + revenue;
  }, 0);
}

/**
 * Calculate Average Order Value
 */
export function calculateAOV(orders: OrderData[]): number {
  if (orders.length === 0) return 0;

  const totalRevenue = calculateRevenue(orders);
  return Number((totalRevenue / orders.length).toFixed(2));
}

/**
 * Calculate conversion rate (delivered orders / total orders)
 */
export function calculateConversionRate(orders: OrderData[]): number {
  if (orders.length === 0) return 0;

  const deliveredOrders = orders.filter(
    (order) => order.status === 'delivered'
  ).length;

  return Number(((deliveredOrders / orders.length) * 100).toFixed(2));
}

/**
 * Calculate trends (% change between two periods)
 */
export function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(2));
}

/**
 * Group orders by date
 */
export function groupByDate(
  orders: OrderData[],
): Record<string, OrderData[]> {
  return orders.reduce(
    (acc, order) => {
      const date = new Date(order.order_date).toISOString().split('T')[0]!;
      if (!acc[date]) acc[date] = [];
      acc[date].push(order);
      return acc;
    },
    {} as Record<string, OrderData[]>,
  );
}

/**
 * Generate date range for trends
 */
export function generateDateRange(
  startDate: Date,
  endDate: Date,
): string[] {
  const dates: string[] = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    dates.push(current.toISOString().split('T')[0]!);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Calculate metrics for a specific period
 */
export function calculatePeriodMetrics(
  orders: OrderData[],
): {
  revenue: number;
  orderCount: number;
  aov: number;
  conversionRate: number;
} {
  return {
    revenue: calculateRevenue(orders),
    orderCount: orders.length,
    aov: calculateAOV(orders),
    conversionRate: calculateConversionRate(orders),
  };
}

/**
 * Get date range for period (week, month, year)
 */
export function getPeriodDates(period: 'week' | 'month' | 'year' = 'month') {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case 'week':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
  }

  return { startDate, endDate };
}

/**
 * Calculate trend data points for charts
 */
export function calculateTrendDataPoints(
  orders: OrderData[],
  period: 'week' | 'month' | 'year' = 'month',
): Array<{
  date: string;
  revenue: number;
  orders: number;
}> {
  const { startDate, endDate } = getPeriodDates(period);
  const dateRange = generateDateRange(startDate, endDate);
  const grouped = groupByDate(orders);

  return dateRange.map((date) => {
    const dayOrders = grouped[date] || [];
    return {
      date,
      revenue: calculateRevenue(dayOrders),
      orders: dayOrders.length,
    };
  });
}

/**
 * Get top products by revenue
 */
export function getTopProductsByRevenue<T extends { revenue: Decimal | number }>(
  products: T[],
  limit: number = 10,
): T[] {
  return products
    .sort((a, b) => {
      const aRev = typeof a.revenue === 'string' ? parseFloat(a.revenue) : Number(a.revenue);
      const bRev = typeof b.revenue === 'string' ? parseFloat(b.revenue) : Number(b.revenue);
      return bRev - aRev;
    })
    .slice(0, limit);
}
