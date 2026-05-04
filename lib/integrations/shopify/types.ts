export interface ShopifyCredentials {
  apiKey: string;
  apiSecret: string;
  storeUrl: string;
}

export interface ShopifyOAuthToken {
  accessToken: string;
  scope: string;
  expiresIn?: number;
  expiresAt?: Date;
}

export interface ShopifySyncOptions {
  fromDate?: Date;
  limit?: number;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description?: string;
  vendor?: string;
  productType?: string;
  price: number;
  sku?: string;
  inventory?: number;
  imageUrl?: string;
}

export interface ShopifyOrder {
  id: string;
  number: string;
  totalPrice: number;
  status: string;
  fulfillmentStatus?: string;
  createdAt: Date;
  updatedAt: Date;
  lineItems: ShopifyLineItem[];
}

export interface ShopifyLineItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  sku?: string;
}

export interface SyncResult {
  success: boolean;
  productsCount: number;
  ordersCount: number;
  errors: string[];
  duration: number;
}

// GraphQL Response types
export interface ShopifyGraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
  }>;
}

export interface GetProductsResponse {
  products: {
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    edges: Array<{
      node: ShopifyProduct;
    }>;
  };
}

export interface GetOrdersResponse {
  orders: {
    edges: Array<{
      node: ShopifyOrder;
    }>;
  };
}
