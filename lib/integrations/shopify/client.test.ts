import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShopifyClient } from './client';
import { AuthError, RateLimitError, InternalError } from '@/lib/utils/errors';

describe('ShopifyClient', () => {
  let client: ShopifyClient;
  const storeUrl = 'test.myshopify.com';
  const accessToken = 'shpua_test_token';

  beforeEach(() => {
    client = new ShopifyClient(storeUrl, accessToken);
  });

  describe('constructor', () => {
    it('should initialize with valid credentials', () => {
      expect(() => new ShopifyClient(storeUrl, accessToken)).not.toThrow();
    });

    it('should throw on missing storeUrl', () => {
      expect(() => new ShopifyClient('', accessToken)).toThrow(AuthError);
    });

    it('should throw on missing accessToken', () => {
      expect(() => new ShopifyClient(storeUrl, '')).toThrow(AuthError);
    });

    it('should normalize store URL', () => {
      const variations = [
        'https://test.myshopify.com/',
        'http://test.myshopify.com',
        'TEST.MYSHOPIFY.COM',
      ];

      variations.forEach((url) => {
        expect(() => new ShopifyClient(url, accessToken)).not.toThrow();
      });
    });
  });

  describe('rate limiting', () => {
    it('should track rate limit state', () => {
      // Rate limit state should be initialized
      expect(client['rateLimitState']).toBeDefined();
      expect(client['rateLimitState'].remaining).toBe(40);
    });

    it('should wait when capacity is low', async () => {
      // Simulate low capacity
      client['rateLimitState'].remaining = 1;
      client['rateLimitState'].reset = Date.now() + 1000;

      const startTime = Date.now();
      await client['checkRateLimit']();
      const elapsed = Date.now() - startTime;

      // Should have waited some amount
      expect(elapsed).toBeGreaterThan(0);
    });

    it('should reset rate limit after window expires', async () => {
      client['rateLimitState'].reset = Date.now() - 1000; // Expired
      client['rateLimitState'].remaining = 0;

      await client['checkRateLimit']();

      expect(client['rateLimitState'].remaining).toBe(40);
    });
  });

  describe('retry logic', () => {
    it('should retry on transient errors', async () => {
      let attempts = 0;

      const fn = async () => {
        attempts++;
        if (attempts < 2) {
          throw new InternalError('Network error');
        }
        return { success: true };
      };

      const result = await client['requestWithRetry'](
        fn,
        'testOp'
      );

      expect(attempts).toBe(2);
      expect(result.success).toBe(true);
    });

    it('should give up after max retries', async () => {
      const fn = async () => {
        throw new InternalError('Persistent error');
      };

      await expect(
        client['requestWithRetry'](fn, 'testOp')
      ).rejects.toThrow(InternalError);
    });
  });

  describe('error handling', () => {
    it('should identify retryable errors', () => {
      const retryable = [
        new InternalError('Server error'),
        new RateLimitError('Rate limited'),
      ];

      retryable.forEach((error) => {
        expect(client['isRetryable'](error)).toBe(true);
      });
    });

    it('should not retry auth errors', () => {
      const error = new AuthError('Invalid token');
      expect(client['isRetryable'](error)).toBe(false);
    });
  });

  describe('GraphQL queries', () => {
    it('should build products query', () => {
      const query = client['buildProductsQuery'](50);
      expect(query).toContain('GetProducts');
      expect(query).toContain('products');
      expect(query).toContain('pageInfo');
    });

    it('should build orders query', () => {
      const query = client['buildOrdersQuery']();
      expect(query).toContain('GetOrders');
      expect(query).toContain('orders');
      expect(query).toContain('lineItems');
    });
  });
});

describe('ShopifyClient Integration', () => {
  // These tests would require mocking fetch or using a test Shopify account
  // Placeholder for integration tests

  it.skip('should fetch products from Shopify', async () => {
    // Requires real Shopify API credentials
  });

  it.skip('should fetch orders from Shopify', async () => {
    // Requires real Shopify API credentials
  });

  it.skip('should handle rate limiting correctly', async () => {
    // Requires API call volume
  });
});
