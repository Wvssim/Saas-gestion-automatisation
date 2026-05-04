import { z } from 'zod';

/**
 * Analytics query validation schemas
 */

export const trendsQuerySchema = z.object({
  period: z.enum(['week', 'month', 'year']).default('month'),
});

export const topProductsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const analyticsFilterSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  integrationId: z.string().optional(),
});

export type TrendsQuery = z.infer<typeof trendsQuerySchema>;
export type TopProductsQuery = z.infer<typeof topProductsQuerySchema>;
export type AnalyticsFilter = z.infer<typeof analyticsFilterSchema>;
