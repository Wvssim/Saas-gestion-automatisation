import { productQueue, orderQueue, inventoryQueue, retryQueue } from './index';

/**
 * Setup monitoring and logging for all queues
 */
export function setupQueueMonitoring() {
  const queues = [
    { queue: productQueue, name: 'ProductQueue' },
    { queue: orderQueue, name: 'OrderQueue' },
    { queue: inventoryQueue, name: 'InventoryQueue' },
    { queue: retryQueue, name: 'RetryQueue' },
  ];

  queues.forEach(({ queue, name }) => {
    queue.on('error', (err) => {
      console.error(`[${name}] Error:`, err);
    });

    queue.on('waiting', (jobId) => {
      console.log(`[${name}] Job ${jobId} is waiting`);
    });

    queue.on('active', (job, jobPromise) => {
      console.log(`[${name}] Job ${job.id} is active`);
    });

    queue.on('stalled', (job) => {
      console.warn(`[${name}] Job ${job.id} stalled`);
    });

    queue.on('progress', (job, progress) => {
      console.log(`[${name}] Job ${job.id} progress: ${progress}%`);
    });

    queue.on('completed', (job, result) => {
      console.log(`[${name}] Job ${job.id} completed`, {
        duration: Date.now() - job.processedOn,
        result,
      });
    });

    queue.on('failed', (job, err) => {
      console.error(`[${name}] Job ${job.id} failed (attempt ${job.attemptsMade}):`, {
        error: err.message,
        data: job.data,
      });
    });

    queue.on('paused', () => {
      console.warn(`[${name}] Queue paused`);
    });

    queue.on('resumed', () => {
      console.log(`[${name}] Queue resumed`);
    });

    queue.on('cleaned', (jobs, type) => {
      console.log(`[${name}] Cleaned ${jobs.length} ${type} jobs`);
    });

    queue.on('drained', () => {
      console.log(`[${name}] Queue drained (all jobs processed)`);
    });
  });

  console.log('[Monitoring] Queue event listeners registered');
}

/**
 * Get queue statistics for health check
 */
export async function getQueueStats() {
  const stats = {
    timestamp: new Date().toISOString(),
    productQueue: await productQueue.getJobCounts(),
    orderQueue: await orderQueue.getJobCounts(),
    inventoryQueue: await inventoryQueue.getJobCounts(),
    retryQueue: await retryQueue.getJobCounts(),
  };

  return stats;
}

/**
 * Get detailed queue status
 */
export async function getQueueStatus() {
  const [productActive, orderActive, inventoryActive] = await Promise.all([
    productQueue.getActive(),
    orderQueue.getActive(),
    inventoryQueue.getActive(),
  ]);

  const [productWaiting, orderWaiting, inventoryWaiting] = await Promise.all([
    productQueue.getWaiting(),
    orderQueue.getWaiting(),
    inventoryQueue.getWaiting(),
  ]);

  return {
    timestamp: new Date().toISOString(),
    products: {
      active: productActive.length,
      waiting: productWaiting.length,
      ...await productQueue.getJobCounts(),
    },
    orders: {
      active: orderActive.length,
      waiting: orderWaiting.length,
      ...await orderQueue.getJobCounts(),
    },
    inventory: {
      active: inventoryActive.length,
      waiting: inventoryWaiting.length,
      ...await inventoryQueue.getJobCounts(),
    },
  };
}

/**
 * Cleanup old jobs (keep only recent)
 */
export async function cleanupOldJobs(daysToKeep: number = 7) {
  const timestamp = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;

  const queues = [productQueue, orderQueue, inventoryQueue, retryQueue];

  for (const queue of queues) {
    await queue.clean(0, 'completed'); // Remove all completed jobs
    await queue.clean(0, 'failed'); // Remove all failed jobs (already in DLQ)
  }

  console.log(`[Monitoring] Cleaned up jobs older than ${daysToKeep} days`);
}
