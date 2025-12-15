# Operations & Monitoring Guide

This document outlines the monitoring and operations setup for MealPrepRecipes.

## 1. Health Check Endpoint

A health check endpoint is available for uptime monitoring services.

### Endpoint
```
GET https://babewfd.vercel.app/api/health
```

### Response Format
```json
{
  "status": "healthy",
  "timestamp": "2024-12-15T12:00:00.000Z",
  "version": "abc1234",
  "checks": {
    "database": "ok",
    "auth": "ok"
  },
  "responseTime": 150
}
```

### Status Values
| Status | HTTP Code | Meaning |
|--------|-----------|---------|
| healthy | 200 | All systems operational |
| degraded | 200 | Some systems have issues |
| unhealthy | 503 | Critical systems down |

## 2. Uptime Monitoring Setup

### Recommended Services
- **BetterUptime** (free tier available) - https://betteruptime.com
- **UptimeRobot** (free tier) - https://uptimerobot.com
- **Pingdom** (paid) - https://pingdom.com

### Configuration (BetterUptime Example)

1. Create account at https://betteruptime.com
2. Add new monitor:
   - **URL**: `https://babewfd.vercel.app/api/health`
   - **Check interval**: 3 minutes
   - **Request type**: GET
   - **Expected status code**: 200

3. Configure alerts:
   - Email notifications
   - Slack integration (optional)
   - SMS for critical alerts (optional)

4. Create status page (optional):
   - Public URL for users to check status
   - Shows uptime history

### Multiple Monitors (Recommended)
| Monitor | URL | Interval |
|---------|-----|----------|
| Health Check | `/api/health` | 3 min |
| Homepage | `/` | 5 min |
| App Dashboard | `/app` | 5 min |
| API Stripe Webhook | `/api/stripe/webhook` | 10 min |

## 3. Sentry Error Monitoring

### Configuration
Sentry is configured in:
- `sentry.client.config.ts` - Browser errors
- `sentry.server.config.ts` - Server errors
- `sentry.edge.config.ts` - Edge function errors

### Features Enabled
- **Error tracking**: All unhandled exceptions
- **Session replay**: 10% of sessions, 100% of error sessions
- **Performance monitoring**: 10% of transactions in production
- **Release tracking**: Tied to Git commit SHA
- **Environment separation**: development/preview/production

### Sentry Dashboard Alerts Setup

1. Go to **Sentry Dashboard** > **Alerts**
2. Create the following alert rules:

#### High Error Volume Alert
- **Condition**: Error count > 50 in 1 hour
- **Action**: Email + Slack
- **Priority**: High

#### New Error Alert
- **Condition**: First seen error
- **Action**: Email
- **Priority**: Medium

#### Error Spike Alert
- **Condition**: Error rate increases by 300%
- **Action**: Email + Slack
- **Priority**: High

#### Slow Transaction Alert
- **Condition**: p95 latency > 3 seconds
- **Action**: Email
- **Priority**: Medium

### Ignored Errors
The following errors are filtered out (non-actionable):
- ResizeObserver loop errors
- Browser extension errors
- Network fetch failures (user's connection)
- AbortError (user navigation)

## 4. Supabase Backup Verification

### Automatic Backups
Supabase provides automatic daily backups on paid plans.

### Backup Settings (Supabase Dashboard)
1. Go to **Project Settings** > **Database**
2. View backup status under "Backups"

### Backup Retention
| Plan | Retention |
|------|-----------|
| Free | No backups |
| Pro | 7 days |
| Team | 14 days |
| Enterprise | 30 days |

### Manual Backup Verification

#### Weekly Verification Process
1. Go to Supabase Dashboard > **Database** > **Backups**
2. Verify latest backup timestamp
3. Check backup size is reasonable
4. Document in operations log

#### Monthly Restore Test
1. Create a test project in Supabase
2. Restore from backup to test project
3. Verify data integrity:
   ```sql
   -- Check table row counts
   SELECT 'profiles' as table_name, COUNT(*) FROM profiles
   UNION ALL
   SELECT 'recipes', COUNT(*) FROM recipes
   UNION ALL
   SELECT 'households', COUNT(*) FROM households;
   ```
4. Delete test project after verification

### Point-in-Time Recovery (PITR)
Available on Pro plan and above:
- Restore to any point in last 7 days
- Useful for accidental data deletion

### Database Export (Manual Backup)
For additional safety, periodically export:
```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Or using pg_dump
pg_dump postgresql://[connection-string] > backup.sql
```

## 5. Vercel Deployment Monitoring

### Build Notifications
1. Go to Vercel Dashboard > **Project** > **Settings** > **Notifications**
2. Enable:
   - Deployment failed notifications
   - Build error notifications

### Performance Monitoring
1. Vercel Analytics (built-in)
   - Real-time visitor count
   - Page load performance
   - Core Web Vitals

2. Speed Insights
   - LCP, FID, CLS tracking
   - Geographic performance data

### Log Monitoring
1. Go to Vercel Dashboard > **Deployments** > **Logs**
2. Filter by:
   - Error level
   - Time range
   - Function name

## 6. Stripe Monitoring

### Webhook Health
1. Go to Stripe Dashboard > **Developers** > **Webhooks**
2. Monitor:
   - Delivery success rate
   - Failed deliveries
   - Average response time

### Payment Alerts
Configure in Stripe Dashboard > **Settings** > **Alerts**:
- Failed payment notifications
- High refund rate alerts
- Unusual activity alerts

## 7. Incident Response

### Severity Levels
| Level | Description | Response Time |
|-------|-------------|---------------|
| P1 | Site completely down | 15 minutes |
| P2 | Major feature broken | 1 hour |
| P3 | Minor feature broken | 4 hours |
| P4 | Cosmetic issue | 24 hours |

### Incident Checklist
1. [ ] Acknowledge alert
2. [ ] Check health endpoint status
3. [ ] Check Sentry for related errors
4. [ ] Check Vercel deployment logs
5. [ ] Check Supabase status
6. [ ] Implement fix or rollback
7. [ ] Verify resolution
8. [ ] Document incident

### Rollback Procedure
```bash
# List recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

## 8. Regular Maintenance Schedule

### Daily
- Review Sentry error dashboard
- Check uptime monitor status

### Weekly
- Review Supabase backup status
- Check Stripe webhook health
- Review performance metrics

### Monthly
- Test backup restoration
- Review and rotate API keys if needed
- Audit user permissions
- Review error trends

### Quarterly
- Full security audit
- Performance optimization review
- Dependency updates
- Cost optimization review
