'use client';

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { DashboardData } from '@/types/dashboard';
import { ApiResponse } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// Mock data para desarrollo
const mockDashboardData: DashboardData = {
  kpis: [
    {
      id: '1',
      label: 'Total Revenue',
      value: '$28,450.50',
      trend: 12.5,
      trendLabel: 'vs last 7 days',
      icon: 'DollarSign',
      color: 'emerald',
    },
    {
      id: '2',
      label: 'Total Orders',
      value: '384',
      trend: 8.2,
      trendLabel: 'vs last 7 days',
      icon: 'ShoppingCart',
      color: 'blue',
    },
    {
      id: '3',
      label: 'Avg Order Value',
      value: '$74.08',
      trend: 3.1,
      trendLabel: 'vs last 7 days',
      icon: 'TrendingUp',
      color: 'purple',
    },
    {
      id: '4',
      label: 'Conversion Rate',
      value: '3.24%',
      trend: 1.8,
      trendLabel: 'vs last 7 days',
      icon: 'Target',
      color: 'orange',
    },
    {
      id: '5',
      label: 'Pending Orders',
      value: '24',
      trend: -5.3,
      trendLabel: 'vs last week',
      icon: 'Clock',
      color: 'amber',
    },
    {
      id: '6',
      label: 'Customer Satisfaction',
      value: '4.7/5',
      trend: 2.1,
      trendLabel: 'vs last month',
      icon: 'Star',
      color: 'rose',
    },
  ],
  revenueChart: [
    { date: 'Mon', value: 2400, revenue: 2400 },
    { date: 'Tue', value: 3100, revenue: 3100 },
    { date: 'Wed', value: 2800, revenue: 2800 },
    { date: 'Thu', value: 3900, revenue: 3900 },
    { date: 'Fri', value: 4200, revenue: 4200 },
    { date: 'Sat', value: 3800, revenue: 3800 },
    { date: 'Sun', value: 4350, revenue: 4350 },
  ],
  ordersChart: [
    { date: 'Mon', value: 40, orders: 40 },
    { date: 'Tue', value: 52, orders: 52 },
    { date: 'Wed', value: 48, orders: 48 },
    { date: 'Thu', value: 61, orders: 61 },
    { date: 'Fri', value: 71, orders: 71 },
    { date: 'Sat', value: 65, orders: 65 },
    { date: 'Sun', value: 77, orders: 77 },
  ],
  topProducts: [
    {
      id: '1',
      name: 'Premium Wireless Headphones',
      revenue: 12450,
      orders: 156,
      stock: 45,
      image: '🎧',
    },
    {
      id: '2',
      name: 'USB-C Fast Charger',
      revenue: 8230,
      orders: 412,
      stock: 128,
      image: '🔌',
    },
    {
      id: '3',
      name: 'Phone Screen Protector',
      revenue: 5680,
      orders: 284,
      stock: 203,
      image: '📱',
    },
    {
      id: '4',
      name: 'Portable Power Bank',
      revenue: 4920,
      orders: 164,
      stock: 72,
      image: '🔋',
    },
    {
      id: '5',
      name: 'Phone Case Set',
      revenue: 3450,
      orders: 230,
      stock: 95,
      image: '📦',
    },
  ],
  stockAlerts: [
    {
      id: '1',
      productName: 'Limited Edition Charger',
      currentStock: 3,
      minStock: 20,
      severity: 'critical',
      sku: 'CHAR-001-LE',
    },
    {
      id: '2',
      productName: 'Wireless Earbuds V2',
      currentStock: 12,
      minStock: 25,
      severity: 'low',
      sku: 'EARB-002-V2',
    },
    {
      id: '3',
      productName: 'Premium Cable Pack',
      currentStock: 8,
      minStock: 30,
      severity: 'critical',
      sku: 'CAB-003-PKG',
    },
  ],
};

export const useAnalytics = (): UseQueryResult<DashboardData> => {
  return useQuery({
    queryKey: ['dashboard', 'analytics'],
    queryFn: async () => {
      try {
        // TODO: Replace with actual API call when backend ready
        // const response = await fetch(`${API_BASE}/api/analytics/overview`);
        // if (!response.ok) throw new Error('Failed to fetch analytics');
        // return await response.json();

        // Mock API delay for realism
        await new Promise((resolve) => setTimeout(resolve, 500));
        return mockDashboardData;
      } catch (error) {
        console.error('Analytics fetch error:', error);
        throw new Error('Failed to load dashboard analytics');
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  });
};

export const useRevenueChart = (): UseQueryResult<
  { date: string; revenue: number }[]
> => {
  return useQuery({
    queryKey: ['dashboard', 'revenue-chart'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockDashboardData.revenueChart.map((d) => ({
        date: d.date,
        revenue: d.revenue || 0,
      }));
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useOrdersChart = (): UseQueryResult<
  { date: string; orders: number }[]
> => {
  return useQuery({
    queryKey: ['dashboard', 'orders-chart'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockDashboardData.ordersChart.map((d) => ({
        date: d.date,
        orders: d.orders || 0,
      }));
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useTopProducts = (): UseQueryResult<typeof mockDashboardData.topProducts> => {
  return useQuery({
    queryKey: ['dashboard', 'top-products'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockDashboardData.topProducts;
    },
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });
};

export const useStockAlerts = (): UseQueryResult<typeof mockDashboardData.stockAlerts> => {
  return useQuery({
    queryKey: ['dashboard', 'stock-alerts'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockDashboardData.stockAlerts;
    },
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
};
