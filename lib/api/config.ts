/**
 * API Configuration
 * Central configuration for API endpoints and client setup
 */

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 2,
  RETRY_DELAY: 1000, // 1 second
};

/**
 * Query key factory for TanStack Query
 * Ensures consistent cache key naming across the app
 */
export const queryKeys = {
  dashboard: {
    all: ['dashboard'] as const,
    analytics: () => [...queryKeys.dashboard.all, 'analytics'] as const,
    revenue: () => [...queryKeys.dashboard.all, 'revenue'] as const,
    orders: () => [...queryKeys.dashboard.all, 'orders'] as const,
    topProducts: () => [...queryKeys.dashboard.all, 'topProducts'] as const,
    stockAlerts: () => [...queryKeys.dashboard.all, 'stockAlerts'] as const,
  },
  products: {
    all: ['products'] as const,
    list: () => [...queryKeys.products.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.products.all, 'detail', id] as const,
  },
  orders: {
    all: ['orders'] as const,
    list: () => [...queryKeys.orders.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.orders.all, 'detail', id] as const,
  },
  integrations: {
    all: ['integrations'] as const,
    list: () => [...queryKeys.integrations.all, 'list'] as const,
  },
  automation: {
    all: ['automation'] as const,
    list: () => [...queryKeys.automation.all, 'list'] as const,
  },
};

/**
 * Error messages map
 * User-friendly error messages for different error codes
 */
export const ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  AUTH_REQUIRED: 'Authentication required. Please login.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
};
