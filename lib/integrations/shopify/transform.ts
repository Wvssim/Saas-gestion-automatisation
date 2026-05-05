import { Decimal } from '@prisma/client/runtime/library';
import { ShopifyProduct, ShopifyOrder, ShopifyLineItem } from './types';

/**
 * Extraire l'ID interne Shopify d'un GID (gid://shopify/Type/123 → "123")
 */
export function extractShopifyId(gid: string): string {
  if (!gid) return '';
  return gid.split('/').pop() || gid;
}

/**
 * Mapper status Shopify → format DB (active, draft, archived)
 */
function mapProductStatus(shopifyStatus: string | null | undefined): string {
  const status = (shopifyStatus || '').toLowerCase();
  if (status === 'active' || status === 'draft' || status === 'archived') {
    return status;
  }
  return 'active';
}

/**
 * Transforme un produit Shopify en format DB (table products)
 * Note: variantes + images mappées séparément (mapShopifyVariant, mapShopifyImage)
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
  status: string;
} {
  const firstVariant = shopifyProduct.variants?.edges?.[0]?.node;
  const featuredImage =
    shopifyProduct.featuredImage ||
    shopifyProduct.images?.edges?.[0]?.node;

  const externalId = extractShopifyId(shopifyProduct.id);

  // Stock cumulé sur toutes variantes
  const totalStock =
    shopifyProduct.variants?.edges?.reduce(
      (sum: number, e: any) => sum + (e.node?.inventoryQuantity || 0),
      0
    ) ?? (firstVariant?.inventoryQuantity || 0);

  return {
    integrationId,
    externalId,
    name: shopifyProduct.title || 'Unknown Product',
    sku: firstVariant?.sku || null,
    description: shopifyProduct.description || null,
    price: new Decimal(firstVariant?.price || 0),
    stock: totalStock,
    imageUrl: featuredImage?.url || null,
    status: mapProductStatus(shopifyProduct.status),
  };
}

/**
 * Mapper variante Shopify → ProductVariant
 */
export function mapShopifyVariant(
  variant: any,
  productId: string,
  imageIdMap: Map<string, string>
): {
  productId: string;
  externalId: string;
  title: string;
  sku: string | null;
  price: Decimal;
  stock: number;
  imageId: string | null;
} {
  const externalId = extractShopifyId(variant.id);
  const imageGid = variant.image?.id;
  const imageId = imageGid ? imageIdMap.get(extractShopifyId(imageGid)) || null : null;

  return {
    productId,
    externalId,
    title: variant.title || 'Default',
    sku: variant.sku || null,
    price: new Decimal(variant.price || 0),
    stock: variant.inventoryQuantity || 0,
    imageId,
  };
}

/**
 * Mapper image Shopify → ProductImage
 */
export function mapShopifyImage(
  image: any,
  productId: string,
  position: number
): {
  productId: string;
  externalId: string;
  src: string;
  alt: string | null;
  position: number;
} {
  return {
    productId,
    externalId: extractShopifyId(image.id),
    src: image.url || '',
    alt: image.altText || null,
    position,
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
  name: string | null;
  email: string | null;
  quantity: number;
  revenue: Decimal;
  status: string;
  financial_status: string | null;
  details: any;
  order_date: Date;
} {
  const externalId = extractShopifyId(shopifyOrder.id);

  let totalQuantity = 0;
  shopifyOrder.lineItems?.edges?.forEach((edge: any) => {
    totalQuantity += edge.node?.quantity || 0;
  });

  const totalPrice =
    shopifyOrder.currentTotalPriceSet?.shopMoney?.amount ??
    shopifyOrder.totalPriceSet?.shopMoney?.amount ??
    shopifyOrder.totalPrice?.amount ??
    0;

  const status = mapOrderStatus(
    shopifyOrder.displayFulfillmentStatus || shopifyOrder.fulfillmentStatus,
    shopifyOrder.cancelledAt
  );

  const refunds = (shopifyOrder.refunds || []).map((r: any) => ({
    id: r.id,
    createdAt: r.createdAt,
    note: r.note,
    amount: r.totalRefundedSet?.shopMoney?.amount || '0',
    currency: r.totalRefundedSet?.shopMoney?.currencyCode || null,
  }));

  const details = {
    refunds,
    totalRefunded: shopifyOrder.totalRefundedSet?.shopMoney?.amount || '0',
    cancelReason: shopifyOrder.cancelReason || null,
    cancelledAt: shopifyOrder.cancelledAt || null,
    processedAt: shopifyOrder.processedAt || null,
    currency:
      shopifyOrder.currentTotalPriceSet?.shopMoney?.currencyCode ||
      shopifyOrder.totalPriceSet?.shopMoney?.currencyCode ||
      null,
  };

  return {
    integrationId,
    externalId,
    name: shopifyOrder.name || null,
    email: shopifyOrder.email || shopifyOrder.customer?.email || null,
    quantity: totalQuantity,
    revenue: new Decimal(totalPrice),
    status,
    financial_status: shopifyOrder.displayFinancialStatus || null,
    details,
    order_date: new Date(
      shopifyOrder.processedAt || shopifyOrder.createdAt
    ),
  };
}

/**
 * Transforme un customer Shopify en format DB
 */
export function mapShopifyCustomer(
  shopifyCustomer: any,
  integrationId: string
): {
  integrationId: string;
  externalId: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  zip: string | null;
  addresses: any;
  last_seen: Date;
} | null {
  if (!shopifyCustomer || !shopifyCustomer.id) return null;

  const externalId = extractShopifyId(shopifyCustomer.id);
  const addr = shopifyCustomer.defaultAddress || {};
  const firstName = shopifyCustomer.firstName || null;
  const lastName = shopifyCustomer.lastName || null;
  const fullName =
    [firstName, lastName].filter(Boolean).join(' ').trim() || null;

  return {
    integrationId,
    externalId,
    email: shopifyCustomer.email || null,
    first_name: firstName,
    last_name: lastName,
    name: fullName,
    phone: shopifyCustomer.phone || addr.phone || null,
    address:
      [addr.address1, addr.address2].filter(Boolean).join(', ') || null,
    city: addr.city || null,
    province: addr.province || null,
    country: addr.country || null,
    zip: addr.zip || null,
    addresses: shopifyCustomer.addresses || [],
    last_seen: new Date(
      shopifyCustomer.updatedAt || shopifyCustomer.createdAt || Date.now()
    ),
  };
}

/**
 * Transforme un line item en format DB
 * productId optionnel: si Product non trouvé, on garde snapshot dans productInfo
 */
export function mapShopifyLineItem(
  lineItem: any,
  orderId: string,
  productId: string | null
): {
  orderId: string;
  productId: string | null;
  externalId: string | null;
  variantId: string | null;
  title: string | null;
  sku: string | null;
  quantity: number;
  price: Decimal;
  subtotal: Decimal;
  productInfo: any;
} {
  const quantity = lineItem.quantity || 0;
  const unitPrice =
    lineItem.originalUnitPriceSet?.shopMoney?.amount ??
    lineItem.originalUnitPrice?.amount ??
    0;
  const subtotal =
    lineItem.discountedTotalSet?.shopMoney?.amount ??
    Number(unitPrice) * quantity;

  const externalProductId = lineItem.product?.id
    ? extractShopifyId(lineItem.product.id)
    : null;
  const variantId = lineItem.variant?.id
    ? extractShopifyId(lineItem.variant.id)
    : null;
  const lineExternalId = lineItem.id ? extractShopifyId(lineItem.id) : null;

  return {
    orderId,
    productId,
    externalId: lineExternalId,
    variantId,
    title: lineItem.title || null,
    sku: lineItem.sku || null,
    quantity,
    price: new Decimal(unitPrice),
    subtotal: new Decimal(subtotal),
    productInfo: productId
      ? null
      : {
          externalProductId,
          variantId,
          title: lineItem.title || null,
          sku: lineItem.sku || null,
        },
  };
}

/**
 * Mapper statut Shopify → format DB (pending, shipped, delivered, cancelled)
 * Prend en compte cancelledAt qui surcharge fulfillment
 */
function mapOrderStatus(
  shopifyStatus: string | null | undefined,
  cancelledAt?: string | null
): string {
  if (cancelledAt) return 'cancelled';

  const status = (shopifyStatus || '').toUpperCase();
  const statusMap: Record<string, string> = {
    FULFILLED: 'delivered',
    PARTIALLY_FULFILLED: 'shipped',
    IN_PROGRESS: 'shipped',
    ON_HOLD: 'pending',
    OPEN: 'pending',
    PENDING_FULFILLMENT: 'pending',
    REQUEST_DECLINED: 'cancelled',
    SCHEDULED: 'pending',
    UNFULFILLED: 'pending',
    RESTOCKED: 'pending',
    // legacy lowercase fallback
    FULFILLED_LEGACY: 'delivered',
    CANCELLED: 'cancelled',
  };

  return statusMap[status] || 'pending';
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
