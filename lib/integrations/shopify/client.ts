import { RateLimitError, AuthError, InternalError } from '@/lib/utils/errors';
import { ShopifyProduct, ShopifyOrder, ShopifyLineItem } from './types';
import { prisma } from '@/lib/db/client';
import { SHOPIFY_CONFIG } from './config';

interface RateLimitState {
  remaining: number;
  reset: number;
  requestsThisInterval: number;
}

interface TokenRefreshResult {
  accessToken: string;
  refreshToken?: string;
  accessTokenExpiresAt: Date;
}

export class ShopifyClient {
  private accessToken: string;
  private refreshTokenValue?: string;
  private accessTokenExpiresAt?: Date;
  private integrationId?: string;
  private storeUrl: string;
  private apiVersion: string;
  private rateLimitState: RateLimitState = {
    remaining: SHOPIFY_CONFIG.rateLimit.requestsPerSecond,
    reset: Date.now(),
    requestsThisInterval: 0,
  };

  private readonly RATE_LIMIT_THRESHOLD = SHOPIFY_CONFIG.rateLimit.waitThreshold;
  private readonly REQUEST_TIMEOUT = SHOPIFY_CONFIG.timeout.request;
  private readonly RETRY_ATTEMPTS = SHOPIFY_CONFIG.timeout.retryAttempts;
  private readonly RETRY_DELAY = SHOPIFY_CONFIG.timeout.retryDelay;
  private readonly TOKEN_BUFFER_MS = SHOPIFY_CONFIG.sync.defaultHistoryDays * 24 * 60 * 60 * 1000; // Convert to ms

  constructor(
    storeUrl: string,
    accessToken: string,
    options?: {
      refreshToken?: string;
      accessTokenExpiresAt?: Date | null;
      integrationId?: string;
    }
  ) {
    if (!storeUrl || !accessToken) {
      throw new AuthError('Missing Shopify credentials');
    }

    this.storeUrl = storeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
    this.accessToken = accessToken;
    this.refreshTokenValue = options?.refreshToken;
    this.accessTokenExpiresAt = options?.accessTokenExpiresAt
      ? new Date(options.accessTokenExpiresAt)
      : undefined;
    this.integrationId = options?.integrationId;
    this.apiVersion = SHOPIFY_CONFIG.apiVersion;
  }

  /**
   * Vérifier si access token expiré (ou bientôt)
   */
  isTokenExpired(): boolean {
    if (!this.accessTokenExpiresAt) {
      return false;
    }
    return this.accessTokenExpiresAt.getTime() - this.TOKEN_BUFFER_MS < Date.now();
  }

  /**
   * Échanger refresh token contre nouvel access token
   * Persiste les nouveaux tokens en DB si integrationId connu
   */
  async refreshToken(refreshToken?: string): Promise<TokenRefreshResult> {
    const tokenToUse = refreshToken || this.refreshTokenValue;
    if (!tokenToUse) {
      throw new AuthError('No refresh token available');
    }

    const apiKey = process.env.SHOPIFY_API_KEY;
    const apiSecret = process.env.SHOPIFY_API_SECRET;
    if (!apiKey || !apiSecret) {
      throw new InternalError('Shopify credentials not configured');
    }

    const url = `https://${this.storeUrl}/admin/oauth/access_token`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: apiKey,
          client_secret: apiSecret,
          grant_type: 'refresh_token',
          refresh_token: tokenToUse,
        }),
        signal: controller.signal,
      });

      if (response.status === 401) {
        throw new AuthError('Refresh token invalid or expired');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new InternalError(
          `Token refresh failed: ${error?.error_description || response.statusText}`
        );
      }

      const data = await response.json();
      const newAccessToken: string | undefined = data.access_token;
      const newRefreshToken: string | undefined = data.refresh_token;
      const expiresIn: number | undefined = data.expires_in;

      if (!newAccessToken) {
        throw new InternalError('No access token in refresh response');
      }

      const expiresAt = expiresIn
        ? new Date(Date.now() + expiresIn * 1000 - this.TOKEN_BUFFER_MS)
        : new Date(Date.now() + 24 * 60 * 60 * 1000);

      this.accessToken = newAccessToken;
      if (newRefreshToken) this.refreshTokenValue = newRefreshToken;
      this.accessTokenExpiresAt = expiresAt;

      if (this.integrationId) {
        try {
          await prisma.integration.update({
            where: { id: this.integrationId },
            data: {
              apiKey: newAccessToken,
              refreshToken: newRefreshToken || this.refreshTokenValue,
              accessTokenExpiresAt: expiresAt,
              updated_at: new Date(),
            },
          });
          console.log(
            `[Shopify] Token refreshed for integration ${this.integrationId}`
          );
        } catch (err) {
          console.error('[Shopify] Failed to persist refreshed token:', err);
        }
      }

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        accessTokenExpiresAt: expiresAt,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new InternalError('Shopify token refresh timeout');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Garantir token valide avant requête
   */
  private async ensureValidToken(): Promise<void> {
    if (this.isTokenExpired() && this.refreshTokenValue) {
      await this.refreshToken();
    }
  }

  /**
   * Getters publics pour token state
   */
  getAccessToken(): string {
    return this.accessToken;
  }

  getRefreshToken(): string | undefined {
    return this.refreshTokenValue;
  }

  getAccessTokenExpiresAt(): Date | undefined {
    return this.accessTokenExpiresAt;
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
   * Récupère les commandes depuis une date avec pagination cursor
   */
  async getOrders(
    since?: Date,
    limit: number = 50,
    cursor?: string
  ): Promise<any> {
    const queryFilter = since
      ? `updated_at:>='${since.toISOString()}'`
      : null;

    return this.requestWithRetry(
      () =>
        this.makeRequest('GET', '/graphql.json', {
          query: this.buildOrdersQuery(),
          variables: {
            first: limit,
            after: cursor,
            query: queryFilter,
          },
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
    // Refresh proactif si token expiré
    await this.ensureValidToken();

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
        // Tentative de refresh réactif si possible
        if (this.refreshTokenValue) {
          try {
            await this.refreshToken();
            const retry = await fetch(url, {
              method,
              headers: {
                'X-Shopify-Access-Token': this.accessToken,
                'Content-Type': 'application/json',
              },
              body: body ? JSON.stringify(body) : undefined,
            });
            this.updateRateLimitFromResponse(retry);
            if (retry.ok) {
              const data = await retry.json();
              if (data.errors && Array.isArray(data.errors)) {
                throw new InternalError(
                  `GraphQL error: ${data.errors.map((e: any) => e.message).join(', ')}`
                );
              }
              return data;
            }
          } catch (refreshErr) {
            console.error('[Shopify] Reactive token refresh failed:', refreshErr);
          }
        }
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
              status
              updatedAt
              variants(first: 100) {
                edges {
                  node {
                    id
                    title
                    sku
                    price
                    inventoryQuantity
                    image {
                      id
                    }
                  }
                }
              }
              images(first: 50) {
                edges {
                  node {
                    id
                    url
                    altText
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
      query GetOrders($first: Int!, $after: String, $query: String) {
        orders(first: $first, after: $after, query: $query, sortKey: UPDATED_AT) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            cursor
            node {
              id
              name
              email
              displayFulfillmentStatus
              displayFinancialStatus
              cancelledAt
              cancelReason
              createdAt
              updatedAt
              processedAt
              currentTotalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              totalRefundedSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              refunds(first: 25) {
                id
                createdAt
                note
                totalRefundedSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
              }
              customer {
                id
                email
                firstName
                lastName
                phone
                createdAt
                updatedAt
                defaultAddress {
                  address1
                  address2
                  city
                  province
                  country
                  zip
                  phone
                }
                addresses {
                  address1
                  address2
                  city
                  province
                  country
                  zip
                }
              }
              lineItems(first: 100) {
                edges {
                  node {
                    id
                    title
                    sku
                    quantity
                    variant {
                      id
                    }
                    product {
                      id
                    }
                    originalUnitPriceSet {
                      shopMoney {
                        amount
                      }
                    }
                    discountedTotalSet {
                      shopMoney {
                        amount
                      }
                    }
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
