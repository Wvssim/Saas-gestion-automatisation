// Calculations
export {
  calculateRevenue,
  calculateAOV,
  calculateConversionRate,
  calculateTrend,
  groupByDate,
  generateDateRange,
  calculatePeriodMetrics,
  calculateTrendDataPoints,
  getTopProductsByRevenue,
  getPeriodDates,
} from './calculations';

// Schemas
export {
  trendsQuerySchema,
  topProductsQuerySchema,
  analyticsFilterSchema,
} from './schemas';

export type {
  TrendsQuery,
  TopProductsQuery,
  AnalyticsFilter,
} from './schemas';

// Hooks
export {
  useAnalyticsOverview,
  useAnalyticsTrends,
  useTopProducts,
} from './hooks';
