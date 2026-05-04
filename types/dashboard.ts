export interface DashboardKPI {
  id: string;
  label: string;
  value: number | string;
  trend: number;
  trendLabel: string;
  icon: string;
  color: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  revenue?: number;
  orders?: number;
}

export interface TopProduct {
  id: string;
  name: string;
  revenue: number;
  orders: number;
  stock: number;
  image?: string;
}

export interface StockAlert {
  id: string;
  productName: string;
  currentStock: number;
  minStock: number;
  severity: 'low' | 'critical';
  sku?: string;
}

export interface DashboardData {
  kpis: DashboardKPI[];
  revenueChart: ChartDataPoint[];
  ordersChart: ChartDataPoint[];
  topProducts: TopProduct[];
  stockAlerts: StockAlert[];
}
