import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Créer un utilisateur test
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      plan: 'pro',
    },
  });

  console.log('Created user:', user);

  // Créer une intégration Shopify de test
  const integration = await prisma.integration.upsert({
    where: { id: 'test-shopify' },
    update: {},
    create: {
      userId: user.id,
      type: 'shopify',
      apiKey: 'test-api-key',
      storeUrl: 'test-store.myshopify.com',
      enabled: true,
    },
  });

  console.log('Created integration:', integration);

  // Créer quelques produits de test
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: 'product-1' },
      update: {},
      create: {
        integrationId: integration.id,
        externalId: 'shopify-1',
        name: 'Product 1',
        sku: 'SKU001',
        price: 29.99,
        stock: 100,
        imageUrl: 'https://via.placeholder.com/300',
      },
    }),
    prisma.product.upsert({
      where: { id: 'product-2' },
      update: {},
      create: {
        integrationId: integration.id,
        externalId: 'shopify-2',
        name: 'Product 2',
        sku: 'SKU002',
        price: 49.99,
        stock: 50,
        imageUrl: 'https://via.placeholder.com/300',
      },
    }),
  ]);

  console.log('Created products:', products);

  console.log('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
