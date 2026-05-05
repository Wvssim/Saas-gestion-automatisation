import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/db/client';
import { authOptions } from '@/lib/auth/config';

/**
 * POST /api/integrations/shopify/webhooks/test
 * Test webhook by simulating a Shopify event
 */
export async function POST(req: NextRequest) {
  try {
    const session = (await getServerSession(authOptions)) as any;

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { integrationId, topic, sample } = await req.json();

    if (!integrationId || !topic) {
      return NextResponse.json(
        { success: false, error: 'integrationId and topic required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const integration = await prisma.integration.findFirst({
      where: {
        id: integrationId,
        userId: session.user.id,
      },
    });

    if (!integration) {
      return NextResponse.json(
        { success: false, error: 'Integration not found' },
        { status: 404 }
      );
    }

    // Generate sample payload based on topic
    const payload = sample || generateSamplePayload(topic, integration);

    // Generate valid HMAC
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET || '';
    const body = JSON.stringify(payload);
    const hmac = crypto
      .createHmac('sha256', secret)
      .update(body, 'utf8')
      .digest('base64');

    // Call our webhook handler
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/integrations/shopify/webhooks/handle`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Topic': topic,
          'X-Shopify-Hmac-SHA256': hmac,
        },
        body,
      }
    );

    const result = await response.json();

    return NextResponse.json({
      success: response.ok,
      statusCode: response.status,
      response: result,
      payload: { topic, body: JSON.parse(body) },
    });
  } catch (error) {
    console.error('[Webhooks Test] Error:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Generate sample webhook payload for testing
 */
function generateSamplePayload(topic: string, integration: any): any {
  const basePayload = {
    shop_id: 123456789,
    myshopify_domain: integration.storeUrl,
    timestamp: new Date().toISOString(),
  };

  switch (topic) {
    case 'products/update':
    case 'products/create':
      return {
        ...basePayload,
        id: 632910392,
        title: 'Test Product',
        handle: 'test-product',
        body_html: 'Test product description',
        vendor: 'Test Vendor',
        product_type: 'Clothing',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
        template_suffix: null,
        published_scope: 'global',
        tags: 'test',
        status: 'active',
        variants: [
          {
            id: 793545172,
            product_id: 632910392,
            title: 'Default Title',
            price: '19.99',
            sku: 'TEST-001',
            position: 1,
            inventory_policy: 'continue',
            compare_at_price: null,
            fulfillment_service: 'manual',
            inventory_management: 'shopify',
            option1: null,
            option2: null,
            option3: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            taxable: true,
            barcode: null,
            image_id: null,
            weight: 0,
            weight_unit: 'lb',
            inventory_item_id: 123456,
            inventory_quantity: 50,
            old_inventory_quantity: 50,
            requires_shipping: true,
          },
        ],
      };

    case 'orders/create':
    case 'orders/updated':
      return {
        ...basePayload,
        id: 1234567890,
        email: 'customer@example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        currency: 'USD',
        total_price: '99.99',
        subtotal_price: '99.99',
        total_tax: '0.00',
        financial_status: 'paid',
        fulfillment_status: null,
        line_items: [
          {
            id: 123456789,
            variant_id: 793545172,
            title: 'Test Product',
            quantity: 1,
            sku: 'TEST-001',
            variant_title: 'Default Title',
            vendor: 'Test Vendor',
            fulfillment_service: 'manual',
            product_id: 632910392,
            requires_shipping: true,
            taxable: true,
            gift_card: false,
            name: 'Test Product',
            variant_inventory_management: 'shopify',
            properties: [],
            product_exists: true,
            fulfillment_status: null,
            price: '99.99',
          },
        ],
        customer: {
          id: 987654321,
          email: 'customer@example.com',
          accepts_marketing: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          first_name: 'John',
          last_name: 'Doe',
          orders_count: 1,
          state: 'default',
          total_spent: '99.99',
          last_order_id: 1234567890,
          note: null,
          verified_email: true,
          multipass_identifier: null,
          tax_exempt: false,
          phone: '+1234567890',
          tags: '',
          last_order_name: '#1001',
          currency: 'USD',
          addresses: [
            {
              id: 555555555,
              customer_id: 987654321,
              first_name: 'John',
              last_name: 'Doe',
              company: null,
              address1: '123 Main St',
              address2: null,
              city: 'Anytown',
              province: 'CA',
              country: 'United States',
              zip: '12345',
              phone: '+1234567890',
              name: 'John Doe',
              province_code: 'CA',
              country_code: 'US',
              country_name: 'United States',
              default: true,
            },
          ],
        },
      };

    case 'inventory_levels/update':
      return {
        ...basePayload,
        inventory_item_id: 123456,
        location_id: 987654,
        available: 50,
        updated_at: new Date().toISOString(),
      };

    default:
      return basePayload;
  }
}
