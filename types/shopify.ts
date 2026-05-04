export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  vendor: string;
  product_type: string;
  created_at: string;
  handle: string;
  updated_at: string;
  published_at: string;
  tags: string;
  status: string;
  variants: ShopifyVariant[];
  images: ShopifyImage[];
}

export interface ShopifyVariant {
  id: string;
  product_id: string;
  title: string;
  price: string;
  sku: string;
  position: number;
  inventory_quantity: number;
  inventory_management: string;
  inventory_policy: string;
  barcode: string;
  compare_at_price: string | null;
  fulfillment_service: string;
  weight: number;
  weight_unit: string;
  vendor: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShopifyImage {
  id: string;
  product_id: string;
  position: number;
  created_at: string;
  updated_at: string;
  alt: string | null;
  width: number;
  height: number;
  src: string;
  variant_ids: string[];
}

export interface ShopifyOrder {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  number: number;
  note: string | null;
  token: string;
  gateway: string;
  test: boolean;
  total_price: string;
  subtotal_price: string;
  total_weight: number;
  currency: string;
  financial_status: string;
  fulfillment_status: string | null;
  fulfillments: ShopifyFulfillment[];
  line_items: ShopifyLineItem[];
}

export interface ShopifyLineItem {
  id: string;
  variant_id: string;
  title: string;
  quantity: number;
  price: string;
  sku: string;
  variant_title: string;
  vendor: string;
  fulfillment_service: string;
  product_id: string;
  requires_shipping: boolean;
  taxable: boolean;
  gift_card: boolean;
}

export interface ShopifyFulfillment {
  id: string;
  order_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  tracking_company: string | null;
  tracking_number: string | null;
  line_items: ShopifyLineItem[];
}

export interface ShopifyGraphQLResponse<T> {
  data: T;
  errors?: Array<{ message: string }>;
}
