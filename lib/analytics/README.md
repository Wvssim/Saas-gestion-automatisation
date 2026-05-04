# Analytics Module

Analytics routes complètes pour SellFlow dashboard.

## Routes API

### GET `/api/analytics/overview`
Dashboard metrics (month en cours).

Query: None
Response:
```json
{
  "success": true,
  "data": {
    "totalRevenue": 5000,
    "totalOrders": 25,
    "avgOrderValue": 200,
    "conversionRate": 75.5,
    "revenueTrend": 15.2,
    "ordersTrend": -5.0
  }
}
```

Cache: 5min (s-maxage=300)

### GET `/api/analytics/trends`
Chart data points (revenue + orders per day).

Query:
- `period`: week|month|year (default: month)

Response:
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01",
      "revenue": 450.50,
      "orders": 5
    }
  ]
}
```

Cache: 5min

### GET `/api/analytics/products/top`
Top products par revenue (avec pagination).

Query:
- `limit`: 1-100 (default: 10)

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "prod_123",
      "name": "Product Name",
      "sku": "SKU-001",
      "totalRevenue": 5000,
      "orderCount": 25,
      "avgPrice": 200
    }
  ]
}
```

Cache: 10min (s-maxage=600)

## Business Logic

### Calculations (`lib/analytics/calculations.ts`)

- `calculateRevenue(orders)` → number
- `calculateAOV(orders)` → number
- `calculateConversionRate(orders)` → number
- `calculateTrend(current, previous)` → number
- `groupByDate(orders)` → Record<date, orders[]>
- `generateDateRange(start, end)` → string[]
- `calculatePeriodMetrics(orders)` → metrics object
- `calculateTrendDataPoints(orders, period)` → TrendDataPoint[]
- `getTopProductsByRevenue(products, limit)` → products[]

### Schemas (`lib/analytics/schemas.ts`)

Zod validation schemas pour chaque endpoint.

- `trendsQuerySchema` - period validation
- `topProductsQuerySchema` - limit validation
- `analyticsFilterSchema` - date filters

## Authentication

Tous les endpoints requirent session NextAuth.

Redirect: `/login` si no session.

## Performance

Target: <100ms response time

- Overview: Agrégation month (cached)
- Trends: Period grouping par jour
- Top Products: Raw SQL avec JOIN + GROUP BY

## Error Handling

ApiError classes:
- 401: AuthError (no session)
- 400: ValidationError (invalid params)
- 404: NotFoundError (resource not found)
- 500: InternalError (server error)

Logging: console.error avec contexte.

## Testing

Tests: `tests/analytics.test.ts`

Coverage:
- Revenue calculations
- AOV calculations
- Conversion rate
- Trends calculations
- Date grouping/range
- Period metrics
- Product sorting

Run: `npm test`

## Future Enhancements

- [ ] Real-time metrics updates (WebSocket)
- [ ] Export analytics (CSV, PDF)
- [ ] Advanced filters (date range, status)
- [ ] Comparison periods
- [ ] Forecasting
