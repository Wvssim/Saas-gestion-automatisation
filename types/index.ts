export type UserPlan = 'starter' | 'pro' | 'enterprise';

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  plan: UserPlan;
  createdAt: Date;
  updatedAt: Date;
}

export interface Integration {
  id: string;
  userId: string;
  type: 'shopify' | 'amazon' | 'ebay';
  apiKey: string;
  storeUrl?: string;
  enabled: boolean;
  lastSync?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  integrationId: string;
  externalId: string;
  name: string;
  sku?: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  integrationId: string;
  productId?: string;
  externalId: string;
  quantity: number;
  revenue: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Analytics {
  id: string;
  integrationId: string;
  date: Date;
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  conversionRate?: number;
  avgOrderValue?: number;
  createdAt: Date;
}

export interface Automation {
  id: string;
  integrationId: string;
  userId: string;
  name: string;
  type: 'price_adjustment' | 'stock_alert' | 'description_update';
  condition: Record<string, unknown>;
  action: Record<string, unknown>;
  enabled: boolean;
  frequency: 'daily' | 'real-time' | 'on_order';
  lastRun?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutomationLog {
  id: string;
  automationId: string;
  userId: string;
  status: 'success' | 'failed' | 'skipped';
  affectedItems: number;
  details?: Record<string, unknown>;
  executedAt: Date;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  conversionRate: number;
  revenueTrend: number;
  ordersTrend: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
