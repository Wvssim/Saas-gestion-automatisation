import { Decimal } from '@prisma/client/runtime/library';
import { ShopifyProduct, ShopifyOrder, ShopifyLineItem } from './types';

/**
 * Transforme un produit Shopify en format DB
 */
export function mapShopifyProduct(
  shopifyProduct: any,
  integrationId: string
): {
  integrationId: string;
  externalId: string;
  name: string;
  sku: string | null;
  description: string | null;
  price: Decimal;
  stock: number;
  imageUrl: string | null;
} {
  const variant = shopifyProduct.variants?.edges?.[0]?.node;
  const featuredImage = shopifyProduct.featuredImage;

  // Extraire ID Shopify (format: gid://shopify/Product/123456789)
  const externalId = shopifyProduct.id.split('/').pop() || shopifyProduct.id;

  return {
    integrationId,
    externalId,
    name: shopifyProduct.title || 'Unknown Product',
    sku: variant?.sku || null,
    description: shopifyProduct.description || null,
    price: new Decimal(variant?.price || 0),
    stock: variant?.inventoryQuantity || 0,
    imageUrl: featuredImage?.url || null,
  };
}

/**
 * Transforme une commande Shopify en format DB
 */
export function mapShopifyOrder(
  shopifyOrder: any,
  integrationId: string
): {
  integrationId: string;
  externalId: string;
  quantity: number;
  revenue: Decimal;
  status: string;
  order_date: Date;
} {
  // Extraire numéro commande Shopify
  const externalId = shopifyOrder.id.split('/').pop() || shopifyOrder.id;

  // Sumériser quantity et price des line items
  let totalQuantity = 0;
  shopifyOrder.lineItems?.edges?.forEach((edge: any) => {
    totalQuantity += edge.node?.quantity || 0;
  });

  const totalPrice = shopifyOrder.totalPrice?.amount || 0;

  // Mapper status Shopify → DB
  const status = mapOrderStatus(shopifyOrder.fulfillmentStatus);

  return {
    integrationId,
    externalId,
    quantity: totalQuantity,
    revenue: new Decimal(totalPrice),
    status,
    order_date: new Date(shopifyOrder.createdAt),
  };
}

/**
 * Transforme un line item en format DB
 * Lié à Product + Order
 */
export function mapShopifyLineItem(
  lineItem: any,
  orderId: string,
  productId: string | null
): {
  orderId: string;
  productId: string | null;
  quantity: number;
  price: Decimal;
} {
  return {
    orderId,
    productId,
    quantity: lineItem.quantity || 0,
    price: new Decimal(lineItem.originalUnitPrice?.amount || 0),
  };
}

/**
 * Mapper statut Shopify → format DB
 */
function mapOrderStatus(shopifyStatus: string | null | undefined): string {
  const statusMap: Record<string, string> = {
    fulfilled: 'delivered',
    partial: 'shipped',
    unfulfilledFulfilled: 'pending',
    unfulfilledPartial: 'pending',
    unfulfilledCanceled: 'cancelled',
    restocked: 'pending',
    cancelled: 'cancelled',
  };

  return statusMap[shopifyStatus || ''] || 'pending';
}

/**
 * Valider + nettoyer produit avant stockage
 */
export function validateProductData(product: any): boolean {
  // Champs obligatoires
  if (!product.integrationId || !product.externalId || !product.name) {
    console.warn('[Shopify] Invalid product data:', {
      integrationId: !!product.integrationId,
      externalId: !!product.externalId,
      name: !!product.name,
    });
    return false;
  }

  // Price doit être >= 0
  const price = Number(product.price);
  if (isNaN(price) || price < 0) {
    console.warn('[Shopify] Invalid product price:', product.price);
    return false;
  }

  // Stock doit être >= 0
  const stock = Number(product.stock);
  if (isNaN(stock) || stock < 0) {
    console.warn('[Shopify] Invalid product stock:', product.stock);
    return false;
  }

  return true;
}

/**
 * Valider + nettoyer commande avant stockage
 */
export function validateOrderData(order: any): boolean {
  if (!order.integrationId || !order.externalId) {
    console.warn('[Shopify] Invalid order data:', {
      integrationId: !!order.integrationId,
      externalId: !!order.externalId,
    });
    return false;
  }

  const revenue = Number(order.revenue);
  if (isNaN(revenue)) {
    console.warn('[Shopify] Invalid order revenue:', order.revenue);
    return false;
  }

  const quantity = Number(order.quantity);
  if (isNaN(quantity) || quantity < 0) {
    console.warn('[Shopify] Invalid order quantity:', order.quantity);
    return false;
  }

  // Valider date
  if (!(order.order_date instanceof Date) || isNaN(order.order_date.getTime())) {
    console.warn('[Shopify] Invalid order date:', order.order_date);
    return false;
  }

  return true;
}

/**
 * Convertir Shopify product response → Domain model
 */
export function extractProductsFromShopifyResponse(response: any): any[] {
  const products = response?.data?.products?.edges || [];
  return products.map((edge: any) => edge.node);
}

/**
 * Convertir Shopify orders response → Domain model
 */
export function extractOrdersFromShopifyResponse(response: any): any[] {
  const orders = response?.data?.orders?.edges || [];
  return orders.map((edge: any) => edge.node);
}
