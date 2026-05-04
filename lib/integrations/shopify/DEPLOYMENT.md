# Shopify Integration Deployment Checklist

## Pre-Deployment

### Environment Variables
- [ ] `SHOPIFY_API_KEY` configured
- [ ] `SHOPIFY_API_SECRET` configured
- [ ] `SHOPIFY_API_VERSION` set to "2024-01" (or latest)
- [ ] `NEXTAUTH_URL` set correctly (for OAuth redirect)
- [ ] `ENCRYPTION_KEY` generated (`openssl rand -base64 32`)
- [ ] Database credentials valid

### Shopify App Setup
- [ ] Create app in https://admin.shopify.com/settings/apps-and-integrations/development
- [ ] Set OAuth redirect URI: `https://yourdomain.com/api/integrations/shopify/callback`
- [ ] Configure scopes:
  - `read_products`
  - `read_orders`
  - `read_inventory`
  - `read_locations`
- [ ] Copy API key + secret to environment
- [ ] Test with dev store first

### Database
- [ ] Run migration: `npx prisma migrate deploy`
- [ ] Verify tables created:
  - `integrations` (apiKey column exists)
  - `oauth_states` (new table)
  - `products`, `orders` (existing)

### Code Review
- [ ] Verify all imports work
- [ ] Check TypeScript compilation: `npm run build`
- [ ] Review error handling paths
- [ ] Audit OAuth state verification logic
- [ ] Check rate limit calculations

### Testing
- [ ] Unit tests pass: `npm run test`
- [ ] Manual OAuth flow test
  - [ ] Click "Connect Shopify"
  - [ ] Enter valid store URL
  - [ ] Authorize in Shopify
  - [ ] Verify callback succeeds
  - [ ] Check integration in DB
  - [ ] Verify products/orders synced
- [ ] Test rate limiting (if possible)
- [ ] Test error scenarios:
  - [ ] Invalid store URL
  - [ ] Invalid API key
  - [ ] Network timeout
  - [ ] Shopify API down

## Deployment Steps

### 1. Deploy code
```bash
git push origin shopify-integration
# (or merge to main/deploy branch)
```

### 2. Run migrations on production
```bash
npx prisma migrate deploy --skip-generate
```

### 3. Verify endpoints
```bash
curl -X POST https://yourdomain.com/api/integrations/shopify/connect \
  -H "Content-Type: application/json" \
  -d '{"storeUrl":"test.myshopify.com"}'
```

Should return OAuth URL.

### 4. Monitor logs
- [ ] Check application logs for errors
- [ ] Monitor database for oauth_states cleanup
- [ ] Track sync job completion

## Post-Deployment

### Monitoring
- [ ] Set up alerts for:
  - API errors (500s in `/api/integrations/shopify/*`)
  - Sync failures (logged errors)
  - Rate limit warnings
  - OAuth state mismatches (security)

### Analytics
- [ ] Track successful connections
- [ ] Monitor sync durations
- [ ] Alert on products/orders not syncing

### Maintenance
- [ ] Clean up expired oauth_states:
  ```sql
  DELETE FROM oauth_states WHERE expires_at < now();
  ```
  Schedule weekly via cron job

### Fallback Plan
If critical issues:
1. Disable integration (`enabled = false`)
2. Investigate in logs
3. Fix and redeploy
4. Manual sync retry if needed

## Performance Tuning

### If sync is slow:
1. Check rate limit logs
2. Consider pagination size (default: 50 products, 100 orders)
3. Enable parallel syncs with job queue (Bull/RabbitMQ)

### If memory usage high:
1. Reduce products per page (default: 50)
2. Stream large product lists
3. Implement batching

### If database slow:
1. Add index on `integrationId_externalId` (should exist)
2. Monitor query performance
3. Consider read replica for analytics

## Rollback

If deployment fails:

```bash
# Revert code
git revert <commit-hash>

# Rollback migration (if needed)
npx prisma migrate resolve --rolled-back <migration-name>
```

Note: Do NOT delete oauth_states table as users may have active OAuth flows.

## Version Upgrades

### Shopify API version upgrade (e.g., 2024-01 → 2025-01):
1. Update `SHOPIFY_API_VERSION` env var
2. Test in dev with new version
3. Verify GraphQL queries still work
4. Deploy to production
5. Monitor for 24h

Backward compatibility: Queries should work with multiple API versions.

## Security Checklist

- [ ] API keys encrypted in database (@db.Encrypted)
- [ ] OAuth state validated (CSRF protection)
- [ ] State tokens expire in 10 minutes
- [ ] Access tokens never logged
- [ ] HTTPS only (no HTTP callbacks)
- [ ] Database credentials in secrets manager
- [ ] Rate limiting prevents brute force

## Documentation

- [ ] README.md updated with deployment notes
- [ ] Team aware of sync schedules
- [ ] Alert recipients configured
- [ ] Runbook for common issues
