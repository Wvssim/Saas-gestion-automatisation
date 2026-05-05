import { Job } from 'bull';
import { retryQueue, productQueue, orderQueue, inventoryQueue } from './index';

interface DLQJobData {
  integrationId: string;
  payload?: any;
  topic?: string;
  timestamp?: Date;
  retry_count: number;
  original_queue: string;
  error: string;
  lastAttempt?: string;
}

/**
 * Handle jobs that have exceeded max retries
 * Implements exponential backoff and eventual failure logging
 */
export async function handleDLQJob(job: Job<DLQJobData>) {
  const { retry_count, original_queue, error, integrationId } = job.data;
  const MAX_DLQ_RETRIES = 3;
  const MAX_DLQ_BACKOFF = 5; // days

  console.log(`[DLQ] Processing job with retry_count=${retry_count}`, {
    integrationId,
    originalQueue: original_queue,
    error,
  });

  try {
    if (retry_count >= MAX_DLQ_RETRIES) {
      // Permanent failure - log and alert
      await handlePermanentFailure(job.data);
      console.error(`[DLQ] Job permanently failed after ${retry_count} retries:`, job.data);
      return { status: 'permanently_failed', dlq: true };
    }

    // Exponential backoff: 1h, 6h, 24h
    const delayMs = calculateBackoffDelay(retry_count);

    console.log(
      `[DLQ] Re-queuing job with retry_count=${retry_count + 1}, backoff=${delayMs}ms`
    );

    // Re-enqueue to original queue
    const targetQueue =
      original_queue === 'products'
        ? productQueue
        : original_queue === 'orders'
          ? orderQueue
          : original_queue === 'inventory'
            ? inventoryQueue
            : null;

    if (!targetQueue) {
      throw new Error(`Unknown queue: ${original_queue}`);
    }

    // Re-add to queue with exponential backoff
    await targetQueue.add(
      {
        integrationId: job.data.integrationId,
        payload: job.data.payload,
        topic: job.data.topic,
        timestamp: new Date(),
      },
      {
        delay: delayMs,
        attempts: 1, // Single attempt before going back to DLQ
        priority: 5, // Lower priority for retried jobs
      }
    );

    return {
      status: 'requeued',
      targetQueue: original_queue,
      nextRetry: new Date(Date.now() + delayMs),
      retryCount: retry_count + 1,
    };
  } catch (err) {
    console.error('[DLQ] Handler error:', err);
    // Don't throw - we don't want DLQ jobs failing
    await handlePermanentFailure(job.data);
    return { status: 'failed_in_dlq', error: (err as Error).message };
  }
}

/**
 * Calculate exponential backoff delay
 * retry_count=1 → 1 hour
 * retry_count=2 → 6 hours
 * retry_count=3 → 24 hours
 */
function calculateBackoffDelay(retryCount: number): number {
  const delays = [
    1 * 60 * 60 * 1000, // 1h
    6 * 60 * 60 * 1000, // 6h
    24 * 60 * 60 * 1000, // 24h
  ];

  return delays[retryCount - 1] || delays[delays.length - 1];
}

/**
 * Handle permanent job failure
 * Log to monitoring service, create alert, etc.
 */
async function handlePermanentFailure(jobData: DLQJobData) {
  const { integrationId, original_queue, error, retry_count } = jobData;

  console.error('[DLQ] Permanent failure:', {
    integrationId,
    queue: original_queue,
    error,
    totalRetries: retry_count,
    timestamp: new Date().toISOString(),
  });

  // TODO: Send to monitoring service (Sentry, DataDog, etc.)
  if (process.env.SENTRY_DSN) {
    // await Sentry.captureException(new Error(`DLQ: ${error}`), {
    //   extra: { jobData }
    // });
  }

  // TODO: Create incident ticket (Linear, Jira, etc.)
  // TODO: Send Slack/email alert to team

  // For now, just log to console and DB
  try {
    // You could store failed jobs in a separate table for manual inspection
    // await prisma.failedJob.create({
    //   data: {
    //     integrationId,
    //     queue: original_queue,
    //     error,
    //     payload: JSON.stringify(jobData),
    //     retryCount: retry_count,
    //   },
    // });
  } catch (err) {
    console.error('[DLQ] Failed to log permanent failure:', err);
  }
}

/**
 * Register DLQ handler
 */
export function registerDLQHandler() {
  retryQueue.process(1, handleDLQJob);
  console.log('[DLQ] Handler registered');
}

/**
 * Cleanup: Listen for global queue events
 */
export function registerQueueEventListeners() {
  [productQueue, orderQueue, inventoryQueue].forEach((queue) => {
    queue.on('failed', async (job, err) => {
      console.error(`[Queue] Job ${job.id} failed:`, err.message);
      // Note: DLQ handling is already done in the job handler
    });

    queue.on('completed', (job) => {
      console.log(`[Queue] Job ${job.id} completed`);
    });
  });
}
