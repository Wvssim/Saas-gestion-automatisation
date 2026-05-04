import { RateLimitError, AuthError, InternalError } from '@/lib/utils/errors';
import { ShopifyProduct, ShopifyOrder, ShopifyLineItem } from './types';

interface RateLimitState {
  remaining: number;
  reset: number;
  requestsThisInterval: number;
}

export class ShopifyClient {
  private accessToken: string;
  private storeUrl: string;
  private apiVersion: string;
  private rateLimitState: RateLimitState = {
    remaining: 40,
    reset: Date.now(),
    requestsThisInterval: 0,
  };

  private readonly RATE_LIMIT_THRESHOLD = 0.1; // Attendre si < 10% capacity
  private readonly REQUEST_TIMEOUT = 30000; // 30s
  private readonly RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 1000; // ms

  constructor(storeUrl: string, accessToken: string) {
    if (!storeUrl || !accessToken) {
      throw new AuthError('Missing Shopify credentials');
    }

    this.storeUrl = storeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    this.accessToken = accessToken;
    this.apiVersion = process.env.SHOPIFY_API_VERSION || '2024-01';
  }

  /**
   * Récupère les produits avec pagination
   */
  async getProducts(
    limit: number = 50,
    cursor?: string
  ): Promise<{ products: ShopifyProduct[]; nextCursor?: string }> {
    return this.requestWithRetry(
      () =>
        this.makeRequest('GET', '/graphql.json', {
          query: this.buildProductsQuery(limit),
          variables: { first: limit, after: cursor },
        }),
      'getProducts'
    );
  }

  /**
   * Récupère les commandes depuis une date
   */
  async getOrders(since?: Date): Promise<{ orders: ShopifyOrder[] }> {
    const sinceDate = since?.toISOString() || null;

    return this.requestWithRetry(
      () =>
        this.makeRequest('GET', '/graphql.json', {
          query: this.buildOrdersQuery(),
          variables: { since: sinceDate },
        }),
      'getOrders'
    );
  }

  /**
   * Récupère les variantes d'un produit
   */
  async getProductVariants(productId: string): Promise<any[]> {
    if (!productId) {
      throw new Error('productId required');
    }

    const result = await this.requestWithRetry(
      () =>
        this.makeRequest('GET', '/graphql.json', {
          query: `
            query GetProductVariants($id: ID!) {
              product(id: $id) {
                variants(first: 100) {
                  edges {
                    node {
                      id
                      title
                      sku
                      price
                      inventoryQuantity
                    }
                  }
                }
              }
            }
          `,
          variables: { id: productId },
        }),
      'getProductVariants'
    );

    return result?.data?.product?.variants?.edges?.map((e: any) => e.node) || [];
  }

  /**
   * Requête HTTP robuste avec retry et rate limiting
   */
  private async makeRequest(
    method: string,
    path: string,
    body?: any
  ): Promise<any> {
    // Attendre si rate limit approche
    await this.checkRateLimit();

    const url = `https://${this.storeUrl}/admin/api/${this.apiVersion}${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      // Maj rate limit depuis headers
      this.updateRateLimitFromResponse(response);

      if (response.status === 401) {
        throw new AuthError('Invalid Shopify access token');
      }

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('retry-after') || '60');
        throw new RateLimitError(`Rate limited. Retry after ${retryAfter}s`);
      }

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new InternalError(
          `Shopify API error: ${error?.errors?.[0]?.message || response.statusText}`
        );
      }

      const data = await response.json();

      // GraphQL errors
      if (data.errors && Array.isArray(data.errors)) {
        throw new InternalError(
          `GraphQL error: ${data.errors.map((e: any) => e.message).join(', ')}`
        );
      }

      return data;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new InternalError('Shopify API request timeout');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Retry avec backoff exponentiel
   */
  private async requestWithRetry(
    fn: () => Promise<any>,
    operationName: string,
    attempt = 1
  ): Promise<any> {
    try {
      return await fn();
    } catch (error) {
      if (attempt < this.RETRY_ATTEMPTS && this.isRetryable(error)) {
        const delay = this.RETRY_DELAY * Math.pow(2, attempt - 1);
        console.warn(
          `[Shopify] ${operationName} failed, retry ${attempt}/${this.RETRY_ATTEMPTS} in ${delay}ms`,
          error
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.requestWithRetry(fn, operationName, attempt + 1);
      }

      throw error;
    }
  }

  private isRetryable(error: any): boolean {
    // Retry sur timeout, 500-level errors, rate limit
    if (error instanceof InternalError && error.code === 'INTERNAL_ERROR') {
      return true;
    }
    if (error instanceof RateLimitError) {
      return true;
    }
    return false;
  }

  /**
   * Vérifier rate limit avant requête
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();

    // Reset window expiré
    if (now > this.rateLimitState.reset) {
      this.rateLimitState.remaining = 40;
      this.rateLimitState.requestsThisInterval = 0;
      this.rateLimitState.reset = now + 1000;
    }

    // Si < 10% capacity, attendre
    const capacityPercent = this.rateLimitState.remaining / 40;
    if (capacityPercent < this.RATE_LIMIT_THRESHOLD) {
      const waitTime = this.rateLimitState.reset - now;
      console.warn(
        `[Shopify] Rate limit capacity low (${(capacityPercent * 100).toFixed(1)}%), waiting ${waitTime}ms`
      );

      await new Promise((resolve) => setTimeout(resolve, Math.max(100, waitTime)));
    }
  }

  /**
   * Extraire rate limit headers
   */
  private updateRateLimitFromResponse(response: Response): void {
    // Shopify API v2024-01 uses x-shopify-shop-api-call-limit
    const callLimit = response.headers.get('x-shopify-shop-api-call-limit');
    if (callLimit) {
      const [used, limit] = callLimit.split('/').map(Number);
      this.rateLimitState.remaining = limit - used;
      this.rateLimitState.requestsThisInterval++;
    }
  }

  /**
   * GraphQL queries
   */
  private buildProductsQuery(limit: number): string {
    return `
      query GetProducts($first: Int!, $after: String) {
        products(first: $first, after: $after) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              title
              handle
              description
              vendor
              productType
              variants(first: 1) {
                edges {
                  node {
                    price
                    sku
                    inventoryQuantity
                  }
                }
              }
              featuredImage {
                url
              }
            }
          }
        }
      }
    `;
  }

  private buildOrdersQuery(): string {
    return `
      query GetOrders($since: DateTime) {
        orders(first: 100, query: $since) {
          edges {
            node {
              id
              name
              totalPrice {
                amount
              }
              fulfillmentStatus
              createdAt
              updatedAt
              lineItems(first: 100) {
                edges {
                  node {
                    id
                    product {
                      id
                    }
                    quantity
                    originalUnitPrice {
                      amount
                    }
                    sku
                  }
                }
              }
            }
          }
        }
      }
    `;
  }
}
