/**
 * Shopify Integration Module
 * Public API exports
 */

// Client
export { ShopifyClient } from './client';

// Sync orchestration
export { sync, syncProducts, syncOrders, testConnection } from './sync';

// Data transformation
export {
  mapShopifyProduct,
  mapShopifyOrder,
  mapShopifyLineItem,
  validateProductData,
  validateOrderData,
  extractProductsFromShopifyResponse,
  extractOrdersFromShopifyResponse,
} from './transform';

// Types
export type {
  ShopifyCredentials,
  ShopifyOAuthToken,
  ShopifySyncOptions,
  ShopifyProduct,
  ShopifyOrder,
  ShopifyLineItem,
  SyncResult,
  ShopifyGraphQLResponse,
  GetProductsResponse,
  GetOrdersResponse,
} from './types';

// Configuration
export {
  SHOPIFY_CONFIG,
  isValidShopifyStoreUrl,
  normalizeShopifyStoreUrl,
  getGraphQLEndpoint,
  getRESTEndpoint,
  extractShopifyId,
  generateShopifyId,
  statusCodeHandler,
} from './config';

// Encryption utilities
export {
  encryptApiKey,
  decryptApiKey,
  isValidShopifyAccessToken,
} from './encryption';

// Logging
export { ShopifyLogger } from './logger';
