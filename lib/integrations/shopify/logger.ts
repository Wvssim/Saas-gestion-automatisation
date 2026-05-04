/**
 * Shopify integration logging
 * Structured logs pour debugging + monitoring
 */

interface LogContext {
  integrationId?: string;
  storeUrl?: string;
  operation?: string;
  userId?: string;
  [key: string]: any;
}

export const ShopifyLogger = {
  info(message: string, context?: LogContext) {
    console.log(`[Shopify] ${message}`, context);
  },

  warn(message: string, context?: LogContext) {
    console.warn(`[Shopify] ⚠️ ${message}`, context);
  },

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorMsg =
      error instanceof Error ? error.message : String(error);
    console.error(
      `[Shopify] ❌ ${message}`,
      errorMsg,
      context
    );
  },

  debug(message: string, data?: any) {
    if (process.env.DEBUG?.includes('shopify')) {
      console.debug(`[Shopify] 🔍 ${message}`, data);
    }
  },

  /**
   * Performance metrics
   */
  metric(label: string, duration: number, context?: LogContext) {
    console.log(
      `[Shopify] ⏱️ ${label}: ${duration}ms`,
      context
    );
  },

  /**
   * Rate limit warnings
   */
  rateLimit(message: string, remaining: number, limit: number) {
    const percent = ((remaining / limit) * 100).toFixed(1);
    console.warn(
      `[Shopify] 🚫 ${message} (${remaining}/${limit} = ${percent}%)`
    );
  },

  /**
   * Sync progress
   */
  syncProgress(
    stage: 'products' | 'orders',
    processed: number,
    total: number
  ) {
    const percent = total > 0 ? ((processed / total) * 100).toFixed(1) : '0';
    console.log(
      `[Shopify] 📊 Syncing ${stage}: ${processed}/${total} (${percent}%)`
    );
  },
};
