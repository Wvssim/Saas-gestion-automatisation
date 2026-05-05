import { NextResponse } from 'next/server';
import { getQueueStatus, getQueueStats } from '@/lib/queue/monitoring';

/**
 * GET /api/health/shopify
 * Shopify integration health check
 * Returns queue status and Redis connection health
 */
export async function GET() {
  try {
    const [queueStatus, queueStats] = await Promise.all([
      getQueueStatus(),
      getQueueStats(),
    ]);

    // Check if queues have too many failures
    const totalFailed =
      queueStats.productQueue.failed +
      queueStats.orderQueue.failed +
      queueStats.inventoryQueue.failed;

    const status = totalFailed > 100 ? 'degraded' : 'healthy';

    return NextResponse.json({
      status,
      timestamp: new Date().toISOString(),
      queues: queueStatus,
      summary: {
        totalActive: queueStatus.products.active + queueStatus.orders.active + queueStatus.inventory.active,
        totalWaiting: queueStatus.products.waiting + queueStatus.orders.waiting + queueStatus.inventory.waiting,
        totalFailed,
        totalDelayed: queueStats.productQueue.delayed + queueStats.orderQueue.delayed + queueStats.inventoryQueue.delayed,
      },
      health_checks: {
        redis: 'ok',
        queues: status,
        threshold_check: {
          maxFailed: 100,
          currentFailed: totalFailed,
          ok: totalFailed <= 100,
        },
      },
    });
  } catch (error) {
    console.error('[Health] Shopify health check error:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
