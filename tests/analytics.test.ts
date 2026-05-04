import { describe, it, expect } from '@jest/globals';
import {
  calculateRevenue,
  calculateAOV,
  calculateConversionRate,
  calculateTrend,
  groupByDate,
  generateDateRange,
  calculatePeriodMetrics,
  calculateTrendDataPoints,
  getTopProductsByRevenue,
} from '@/lib/analytics/calculations';
import type { OrderData } from '@/lib/analytics/calculations';

describe('Analytics Calculations', () => {
  // Sample test data
  const mockOrders: OrderData[] = [
    {
      revenue: 100,
      quantity: 1,
      order_date: new Date('2024-01-01'),
      status: 'delivered',
    },
    {
      revenue: 200,
      quantity: 2,
      order_date: new Date('2024-01-01'),
      status: 'delivered',
    },
    {
      revenue: 150,
      quantity: 1,
      order_date: new Date('2024-01-02'),
      status: 'pending',
    },
    {
      revenue: 75,
      quantity: 1,
      order_date: new Date('2024-01-02'),
      status: 'shipped',
    },
  ];

  describe('calculateRevenue', () => {
    it('should calculate total revenue correctly', () => {
      const result = calculateRevenue(mockOrders);
      expect(result).toBe(525);
    });

    it('should return 0 for empty orders', () => {
      const result = calculateRevenue([]);
      expect(result).toBe(0);
    });

    it('should handle Decimal type', () => {
      const orders = [
        { ...mockOrders[0], revenue: '100' as any },
        { ...mockOrders[1], revenue: '200' as any },
      ];
      const result = calculateRevenue(orders);
      expect(result).toBe(300);
    });
  });

  describe('calculateAOV', () => {
    it('should calculate average order value correctly', () => {
      const result = calculateAOV(mockOrders);
      expect(result).toBe(131.25); // 525 / 4
    });

    it('should return 0 for empty orders', () => {
      const result = calculateAOV([]);
      expect(result).toBe(0);
    });

    it('should return single order value', () => {
      const result = calculateAOV([mockOrders[0]]);
      expect(result).toBe(100);
    });
  });

  describe('calculateConversionRate', () => {
    it('should calculate conversion rate (delivered orders %)', () => {
      const result = calculateConversionRate(mockOrders);
      expect(result).toBe(50); // 2 delivered out of 4
    });

    it('should return 0 for empty orders', () => {
      const result = calculateConversionRate([]);
      expect(result).toBe(0);
    });

    it('should return 100 for all delivered', () => {
      const deliveredOrders = mockOrders.map((o) => ({
        ...o,
        status: 'delivered',
      }));
      const result = calculateConversionRate(deliveredOrders);
      expect(result).toBe(100);
    });
  });

  describe('calculateTrend', () => {
    it('should calculate positive trend', () => {
      const result = calculateTrend(150, 100);
      expect(result).toBe(50); // 50% increase
    });

    it('should calculate negative trend', () => {
      const result = calculateTrend(50, 100);
      expect(result).toBe(-50); // 50% decrease
    });

    it('should handle zero previous value', () => {
      const result = calculateTrend(100, 0);
      expect(result).toBe(100);
    });

    it('should return 0 when both are zero', () => {
      const result = calculateTrend(0, 0);
      expect(result).toBe(0);
    });
  });

  describe('groupByDate', () => {
    it('should group orders by date correctly', () => {
      const result = groupByDate(mockOrders);
      expect(Object.keys(result).length).toBe(2);
      expect(result['2024-01-01'].length).toBe(2);
      expect(result['2024-01-02'].length).toBe(2);
    });

    it('should return empty object for empty orders', () => {
      const result = groupByDate([]);
      expect(Object.keys(result).length).toBe(0);
    });
  });

  describe('generateDateRange', () => {
    it('should generate date range correctly', () => {
      const start = new Date('2024-01-01');
      const end = new Date('2024-01-03');
      const result = generateDateRange(start, end);

      expect(result.length).toBe(3);
      expect(result[0]).toBe('2024-01-01');
      expect(result[1]).toBe('2024-01-02');
      expect(result[2]).toBe('2024-01-03');
    });

    it('should return single date when start equals end', () => {
      const date = new Date('2024-01-01');
      const result = generateDateRange(date, date);
      expect(result.length).toBe(1);
      expect(result[0]).toBe('2024-01-01');
    });
  });

  describe('calculatePeriodMetrics', () => {
    it('should calculate all metrics for a period', () => {
      const result = calculatePeriodMetrics(mockOrders);

      expect(result).toHaveProperty('revenue', 525);
      expect(result).toHaveProperty('orderCount', 4);
      expect(result).toHaveProperty('aov', 131.25);
      expect(result).toHaveProperty('conversionRate', 50);
    });

    it('should handle empty orders', () => {
      const result = calculatePeriodMetrics([]);

      expect(result.revenue).toBe(0);
      expect(result.orderCount).toBe(0);
      expect(result.aov).toBe(0);
      expect(result.conversionRate).toBe(0);
    });
  });

  describe('calculateTrendDataPoints', () => {
    it('should generate trend data points for period', () => {
      const result = calculateTrendDataPoints(mockOrders, 'month');

      // Should have data points for all days in month
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      // Check structure
      const point = result[0];
      expect(point).toHaveProperty('date');
      expect(point).toHaveProperty('revenue');
      expect(point).toHaveProperty('orders');
    });
  });

  describe('getTopProductsByRevenue', () => {
    const mockProducts = [
      { id: '1', name: 'Product 1', revenue: 500 },
      { id: '2', name: 'Product 2', revenue: 1000 },
      { id: '3', name: 'Product 3', revenue: 750 },
      { id: '4', name: 'Product 4', revenue: 250 },
    ];

    it('should return top products by revenue', () => {
      const result = getTopProductsByRevenue(mockProducts, 2);

      expect(result.length).toBe(2);
      expect(result[0].id).toBe('2'); // 1000
      expect(result[1].id).toBe('3'); // 750
    });

    it('should respect limit parameter', () => {
      const result = getTopProductsByRevenue(mockProducts, 10);
      expect(result.length).toBe(4); // Only 4 products available
    });

    it('should handle Decimal type revenue', () => {
      const decimalProducts = mockProducts.map((p) => ({
        ...p,
        revenue: p.revenue as any,
      }));
      const result = getTopProductsByRevenue(decimalProducts, 1);

      expect(result[0].id).toBe('2');
    });
  });
});
