import Queue from 'bull';

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
};

export const productQueue = new Queue('product-sync', redisConfig);
export const orderQueue = new Queue('order-sync', redisConfig);
export const inventoryQueue = new Queue('inventory-update', redisConfig);
export const retryQueue = new Queue('retry-dlq', redisConfig);

// Clean up connections on process exit
process.on('SIGTERM', async () => {
  await Promise.all([
    productQueue.close(),
    orderQueue.close(),
    inventoryQueue.close(),
    retryQueue.close(),
  ]);
  process.exit(0);
});
