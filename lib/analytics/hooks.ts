'use client';

import { useQuery } from '@tanstack/react-query';
import type { DashboardMetrics } from '@/types';
import type { TrendsQuery, TopProductsQuery } from './schemas';

/**
 * Fetch overview metrics
 */
export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/overview');
      if (!response.ok) throw new Error('Failed to fetch overview');
      const data = await response.json();
      return data.data as DashboardMetrics;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

interface TrendDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

/**
 * Fetch trend data
 */
export function useAnalyticsTrends(period: 'week' | 'month' | 'year' = 'month') {
  return useQuery({
    queryKey: ['analytics', 'trends', period],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/trends?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch trends');
      const data = await response.json();
      return data.data as TrendDataPoint[];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

interface TopProduct {
  id: string;
  name: string;
  sku?: string;
  totalRevenue: number;
  orderCount: number;
  avgPrice: number;
}

/**
 * Fetch top products
 */
export function useTopProducts(limit: number = 10) {
  return useQuery({
    queryKey: ['analytics', 'products', 'top', limit],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/products/top?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch top products');
      const data = await response.json();
      return data.data as TopProduct[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });
}
