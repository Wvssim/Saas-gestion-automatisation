/**
 * Shopify Integration Configuration
 * API versions, scopes, rate limits
 */

export const SHOPIFY_CONFIG = {
  /**
   * API Version
   * https://shopify.dev/docs/api/admin-rest
   */
  apiVersion: process.env.SHOPIFY_API_VERSION || '2024-01',

  /**
   * OAuth Scopes
   * https://shopify.dev/docs/api/admin-rest/2024-01#section-oauth-scopes
   */
  scopes: [
    'read_products', // Access product data
    'read_orders', // Access order data
    'read_inventory', // Access inventory data
    'read_locations', // Access location data
    'write_products', // For future: update product data
  ],

  /**
   * Rate Limit
   * Shopify REST API: 40 requests / 1 second
   */
  rateLimit: {
    requestsPerSecond: 40,
    waitThreshold: 0.1, // Wait if < 10% capacity remaining
  },

  /**
   * Timeout settings
   */
  timeout: {
    request: 30000, // 30s per request
    retryAttempts: 3,
    retryDelay: 1000, // Initial backoff: 1s (exponential)
  },

  /**
   * Sync settings
   */
  sync: {
    productsPerPage: 50,
    ordersPerPage: 100,
    defaultHistoryDays: 30, // Fallback if no last_sync
    incrementalSync: true, // Use last_sync for orders
  },

  /**
   * Validation
   */
  validation: {
    minProductPrice: 0,
    minOrderQuantity: 1,
    requiredProductFields: ['id', 'title', 'externalId'],
    requiredOrderFields: ['id', 'externalId', 'quantity', 'revenue'],
  },

  /**
   * Features
   */
  features: {
    enableRetry: true,
    enableRateLimitWait: true,
    enableEncryption: true,
    enableIncrementalSync: true,
  },
};

/**
 * Shopify store URL validation
 */
export function isValidShopifyStoreUrl(url: string): boolean {
  const normalized = url
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
    .toLowerCase();

  // Accept: mystore.myshopify.com OR mystore.shopify.com
  return /^[a-z0-9-]+\.(myshopify|shopify)\.com$/.test(normalized);
}

/**
 * Normalize Shopify store URL
 */
export function normalizeShopifyStoreUrl(url: string): string {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
    .toLowerCase();
}

/**
 * Shopify GraphQL API endpoint
 */
export function getGraphQLEndpoint(storeUrl: string, apiVersion?: string): string {
  const normalized = normalizeShopifyStoreUrl(storeUrl);
  const version = apiVersion || SHOPIFY_CONFIG.apiVersion;
  return `https://${normalized}/admin/api/${version}/graphql.json`;
}

/**
 * Shopify REST API endpoint
 */
export function getRESTEndpoint(
  storeUrl: string,
  path: string,
  apiVersion?: string
): string {
  const normalized = normalizeShopifyStoreUrl(storeUrl);
  const version = apiVersion || SHOPIFY_CONFIG.apiVersion;
  return `https://${normalized}/admin/api/${version}${path}`;
}

/**
 * Extract shop ID from Shopify GraphQL ID
 * Input: "gid://shopify/Product/123456789"
 * Output: "123456789"
 */
export function extractShopifyId(gqlId: string): string {
  return gqlId.split('/').pop() || gqlId;
}

/**
 * Generate Shopify GraphQL ID
 * Input: ("Product", "123456789")
 * Output: "gid://shopify/Product/123456789"
 */
export function generateShopifyId(type: string, id: string): string {
  return `gid://shopify/${type}/${id}`;
}

/**
 * Status code handling
 */
export const statusCodeHandler = {
  isSuccess: (code: number) => code >= 200 && code < 300,
  isClientError: (code: number) => code >= 400 && code < 500,
  isServerError: (code: number) => code >= 500,
  isRateLimited: (code: number) => code === 429,
  isUnauthorized: (code: number) => code === 401,
  isForbidden: (code: number) => code === 403,
};
