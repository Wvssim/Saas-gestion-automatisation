import { Order, Product } from '@/types';

export const calculateTotalRevenue = (orders: Order[]): number => {
  return orders.reduce((sum, order) => sum + order.revenue, 0);
};

export const calculateAverageOrderValue = (orders: Order[]): number => {
  if (orders.length === 0) return 0;
  return calculateTotalRevenue(orders) / orders.length;
};

export const calculateConversionRate = (orders: number, visitors: number): number => {
  if (visitors === 0) return 0;
  return (orders / visitors) * 100;
};

export const calculateRevenueTrend = (currentRevenue: number, previousRevenue: number): number => {
  if (previousRevenue === 0) return 0;
  return ((currentRevenue - previousRevenue) / previousRevenue) * 100;
};

export const calculateOrdersTrend = (currentOrders: number, previousOrders: number): number => {
  if (previousOrders === 0) return 0;
  return ((currentOrders - previousOrders) / previousOrders) * 100;
};

export const calculateLowStockProducts = (products: Product[], threshold = 5): Product[] => {
  return products.filter((p) => p.stock <= threshold);
};

export const calculateTopProducts = (orders: Order[], limit = 10): string[] => {
  const productCount: Record<string, number> = {};

  orders.forEach((order) => {
    if (order.productId) {
      productCount[order.productId] = (productCount[order.productId] || 0) + order.revenue;
    }
  });

  return Object.entries(productCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([id]) => id);
};
