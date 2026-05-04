export const PLANS = {
  STARTER: 'starter',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
} as const;

export const PLAN_FEATURES = {
  starter: {
    integrationsLimit: 1,
    automationsLimit: 5,
    price: 29,
    name: 'Starter',
  },
  pro: {
    integrationsLimit: 3,
    automationsLimit: 20,
    price: 79,
    name: 'Pro',
  },
  enterprise: {
    integrationsLimit: 999,
    automationsLimit: 999,
    price: null,
    name: 'Enterprise',
  },
} as const;

export const INTEGRATION_TYPES = {
  SHOPIFY: 'shopify',
  AMAZON: 'amazon',
  EBAY: 'ebay',
} as const;

export const AUTOMATION_TYPES = {
  PRICE_ADJUSTMENT: 'price_adjustment',
  STOCK_ALERT: 'stock_alert',
  DESCRIPTION_UPDATE: 'description_update',
} as const;

export const AUTOMATION_FREQUENCIES = {
  DAILY: 'daily',
  REAL_TIME: 'real-time',
  ON_ORDER: 'on_order',
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const API_ENDPOINTS = {
  ANALYTICS: {
    OVERVIEW: '/api/analytics/overview',
    TRENDS: '/api/analytics/trends',
    PRODUCTS: '/api/analytics/products/top',
  },
  INTEGRATIONS: {
    LIST: '/api/integrations/list',
    SHOPIFY_CONNECT: '/api/integrations/shopify/connect',
    SHOPIFY_CALLBACK: '/api/integrations/shopify/callback',
    SHOPIFY_SYNC: '/api/integrations/shopify/sync',
  },
  AUTOMATION: {
    LIST: '/api/automation/list',
    CREATE: '/api/automation/create',
    UPDATE: '/api/automation/[id]',
    DELETE: '/api/automation/[id]',
  },
} as const;

export const SYNC_INTERVALS = {
  HOURLY: 60 * 60 * 1000,
  DAILY: 24 * 60 * 60 * 1000,
  WEEKLY: 7 * 24 * 60 * 60 * 1000,
} as const;
