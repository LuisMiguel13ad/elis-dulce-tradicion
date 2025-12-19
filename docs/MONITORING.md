# Monitoring and Alerts Setup

Comprehensive guide for setting up monitoring, error tracking, and alerting for Eli's Bakery Cafe.

## Error Tracking

### Sentry Integration

#### Frontend Setup

1. **Install Sentry**:
   ```bash
   npm install @sentry/react @sentry/tracing
   ```

2. **Initialize Sentry** in `src/main.tsx`:
   ```typescript
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     integrations: [
       new Sentry.BrowserTracing(),
       new Sentry.Replay(),
     ],
     tracesSampleRate: 1.0,
     replaysSessionSampleRate: 0.1,
     replaysOnErrorSampleRate: 1.0,
     environment: import.meta.env.MODE,
   });
   ```

3. **Error Boundary**:
   ```typescript
   // src/components/ErrorBoundary.tsx
   import { ErrorBoundary } from "@sentry/react";
   
   <ErrorBoundary fallback={<ErrorFallback />}>
     <App />
   </ErrorBoundary>
   ```

#### Backend Setup

1. **Install Sentry**:
   ```bash
   cd backend
   npm install @sentry/node
   ```

2. **Initialize Sentry** in `backend/server.js`:
   ```javascript
   import * as Sentry from "@sentry/node";
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
     tracesSampleRate: 1.0,
   });
   ```

3. **Error Handler**:
   ```javascript
   app.use(Sentry.Handlers.errorHandler());
   ```

#### Configuration

- **Error Grouping**: Configure in Sentry dashboard
- **Notifications**: Email, Slack, PagerDuty
- **Alert Rules**: 
  - Critical: > 10 errors/minute
  - Warning: > 5 errors/minute
  - Info: All errors logged

### Custom Error Logging

```typescript
// lib/errorLogger.ts
export function logError(error: Error, context?: Record<string, unknown>) {
  console.error('Error:', error, context);
  
  // Send to Sentry
  if (window.Sentry) {
    window.Sentry.captureException(error, {
      contexts: { custom: context },
    });
  }
  
  // Send to backend (optional)
  fetch('/api/errors', {
    method: 'POST',
    body: JSON.stringify({ error: error.message, context }),
  }).catch(() => {});
}
```

## Uptime Monitoring

### UptimeRobot Setup

1. **Create Account**: [uptimerobot.com](https://uptimerobot.com)

2. **Add Monitors**:
   - **Frontend**: `https://your-domain.com`
     - Type: HTTP(s)
     - Interval: 5 minutes
     - Alert contacts: Email, SMS
   
   - **Backend API**: `https://api.your-domain.com/api/health`
     - Type: HTTP(s)
     - Interval: 5 minutes
     - Expected status: 200
     - Expected keyword: "ok"
   
   - **Database**: (if accessible)
     - Type: Port
     - Interval: 5 minutes

3. **Alert Configuration**:
   - **Critical**: Down for > 5 minutes
   - **Warning**: Response time > 2 seconds
   - **Info**: Daily summary

### Health Check Endpoint

```javascript
// backend/routes/health.js
router.get('/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
  };
  
  // Check database connection
  pool.query('SELECT 1')
    .then(() => {
      health.database = 'connected';
      res.json(health);
    })
    .catch((error) => {
      health.database = 'disconnected';
      health.error = error.message;
      res.status(503).json(health);
    });
});
```

## Performance Monitoring

### Web Vitals Tracking

Already implemented in `src/lib/analytics.ts`:

```typescript
import { onCLS, onFID, onLCP, onTTFB } from 'web-vitals';

onCLS(console.log);
onFID(console.log);
onLCP(console.log);
onTTFB(console.log);

// Send to analytics
function sendToAnalytics(metric) {
  // Send to Google Analytics, Sentry, or custom endpoint
  fetch('/api/analytics/web-vitals', {
    method: 'POST',
    body: JSON.stringify(metric),
  });
}
```

### API Response Time Monitoring

```javascript
// backend/middleware/performance.js
export function performanceMiddleware(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log slow requests
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.path} took ${duration}ms`);
    }
    
    // Send to monitoring service
    if (process.env.MONITORING_ENABLED === 'true') {
      fetch(process.env.MONITORING_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify({
          method: req.method,
          path: req.path,
          duration,
          status: res.statusCode,
        }),
      });
    }
  });
  
  next();
}
```

### Database Query Monitoring

```javascript
// backend/db/connection.js
pool.on('query', (query) => {
  const start = Date.now();
  
  query.on('end', () => {
    const duration = Date.now() - start;
    
    // Log slow queries
    if (duration > 500) {
      console.warn(`Slow query (${duration}ms):`, query.text);
    }
  });
});
```

### Lighthouse CI

1. **Install**:
   ```bash
   npm install -D @lhci/cli
   ```

2. **Configure** `lighthouserc.js`:
   ```javascript
   module.exports = {
     ci: {
       collect: {
         url: ['http://localhost:5173'],
         numberOfRuns: 3,
       },
       assert: {
         assertions: {
           'categories:performance': ['error', { minScore: 0.9 }],
           'categories:accessibility': ['error', { minScore: 0.9 }],
           'categories:best-practices': ['error', { minScore: 0.9 }],
           'categories:seo': ['error', { minScore: 0.9 }],
         },
       },
       upload: {
         target: 'temporary-public-storage',
       },
     },
   };
   ```

3. **GitHub Actions**:
   ```yaml
   # .github/workflows/lighthouse.yml
   name: Lighthouse CI
   on: [push, pull_request]
   jobs:
     lighthouse:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
         - run: npm ci
         - run: npm run build
         - run: npm run lighthouse
   ```

## Business Metrics Dashboard

### Key Metrics to Track

1. **Daily Orders Count**
   ```sql
   SELECT COUNT(*) as orders_today
   FROM orders
   WHERE DATE(created_at) = CURRENT_DATE;
   ```

2. **Revenue Tracking**
   ```sql
   SELECT 
     DATE(created_at) as date,
     SUM(total_amount) as revenue,
     COUNT(*) as order_count
   FROM orders
   WHERE payment_status = 'paid'
   GROUP BY DATE(created_at)
   ORDER BY date DESC;
   ```

3. **Conversion Rate**
   ```javascript
   // Track in analytics
   // Visits to orders ratio
   const conversionRate = (orders / visits) * 100;
   ```

4. **Average Order Value**
   ```sql
   SELECT AVG(total_amount) as avg_order_value
   FROM orders
   WHERE payment_status = 'paid';
   ```

5. **Customer Retention Rate**
   ```sql
   SELECT 
     COUNT(DISTINCT user_id) as returning_customers
   FROM orders
   WHERE user_id IN (
     SELECT user_id 
     FROM orders 
     GROUP BY user_id 
     HAVING COUNT(*) > 1
   );
   ```

### Dashboard Implementation

Create dashboard in Supabase or custom:

```typescript
// src/pages/AdminMetrics.tsx
export function AdminMetrics() {
  const { data: metrics } = useQuery({
    queryKey: ['metrics', 'daily'],
    queryFn: async () => {
      const response = await fetch('/api/analytics/daily');
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });
  
  return (
    <div>
      <MetricCard title="Today's Orders" value={metrics?.orders} />
      <MetricCard title="Revenue" value={formatPrice(metrics?.revenue)} />
      <MetricCard title="Conversion Rate" value={`${metrics?.conversion}%`} />
    </div>
  );
}
```

## Alert Configuration

### Critical Alerts

**Payment Failures**:
```javascript
// Alert if payment failure rate > 5%
if (paymentFailureRate > 0.05) {
  sendAlert('critical', 'High payment failure rate detected');
}
```

**System Downtime**:
- UptimeRobot automatically alerts
- Email + SMS notification
- Escalate if down > 15 minutes

**Database Connection Loss**:
```javascript
pool.on('error', (error) => {
  sendAlert('critical', 'Database connection lost', { error });
});
```

### Warning Alerts

**Slow Queries**:
```javascript
if (queryDuration > 2000) {
  sendAlert('warning', 'Slow database query detected', { query, duration });
}
```

**High Error Rate**:
```javascript
if (errorRate > 0.01) { // 1% error rate
  sendAlert('warning', 'High error rate detected', { rate: errorRate });
}
```

**Low Stock**:
```sql
-- Alert if inventory below minimum
SELECT name, quantity, min_quantity
FROM inventory
WHERE quantity < min_quantity;
```

### Info Alerts

**Daily Summary**:
- Orders count
- Revenue
- Top products
- Issues resolved

**Weekly Reports**:
- Growth metrics
- Performance trends
- User feedback summary

## Alert Delivery Methods

### Email Alerts

```javascript
// backend/utils/alerts.js
import { sendEmail } from './email.js';

export async function sendAlert(level, message, details) {
  const recipients = {
    critical: ['admin@bakery.com', 'oncall@bakery.com'],
    warning: ['admin@bakery.com'],
    info: ['admin@bakery.com'],
  };
  
  await sendEmail({
    to: recipients[level],
    subject: `[${level.toUpperCase()}] ${message}`,
    body: `
      Alert: ${message}
      Time: ${new Date().toISOString()}
      Details: ${JSON.stringify(details, null, 2)}
    `,
  });
}
```

### Slack Integration

```javascript
// backend/utils/slack.js
export async function sendSlackAlert(level, message, details) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  
  await fetch(webhookUrl, {
    method: 'POST',
    body: JSON.stringify({
      text: `[${level.toUpperCase()}] ${message}`,
      attachments: [{
        color: level === 'critical' ? 'danger' : level === 'warning' ? 'warning' : 'good',
        fields: Object.entries(details).map(([key, value]) => ({
          title: key,
          value: String(value),
          short: true,
        })),
      }],
    }),
  });
}
```

### SMS Alerts (Twilio)

```javascript
// backend/utils/sms.js
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendSMSAlert(phone, message) {
  await client.messages.create({
    body: `[Bakery Alert] ${message}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
}
```

## Monitoring Dashboard

### Recommended Tools

1. **Sentry**: Error tracking and performance
2. **UptimeRobot**: Uptime monitoring
3. **Google Analytics**: User analytics
4. **Supabase Dashboard**: Database metrics
5. **Custom Dashboard**: Business metrics

### Dashboard Access

- **Admin**: Full access to all metrics
- **Owner**: Business metrics + error logs
- **Developer**: Technical metrics + error details

## Monitoring Checklist

- [ ] Sentry configured (frontend + backend)
- [ ] Error boundaries implemented
- [ ] Uptime monitoring set up
- [ ] Health check endpoint working
- [ ] Web Vitals tracking enabled
- [ ] API performance monitoring
- [ ] Database query monitoring
- [ ] Business metrics dashboard
- [ ] Alert rules configured
- [ ] Email alerts tested
- [ ] Slack integration (if used)
- [ ] SMS alerts (if used)
- [ ] Lighthouse CI configured
- [ ] Monitoring dashboard accessible
- [ ] Team trained on monitoring tools

## Maintenance

- **Daily**: Review error logs
- **Weekly**: Review performance metrics
- **Monthly**: Review business metrics
- **Quarterly**: Full monitoring audit

## Cost Considerations

- **Sentry**: Free tier (5K events/month), then paid
- **UptimeRobot**: Free (50 monitors), then $7/month
- **Google Analytics**: Free
- **Custom Dashboard**: Hosting costs

## Next Steps

1. Set up Sentry account
2. Configure error tracking
3. Set up UptimeRobot
4. Configure alerts
5. Test all alert channels
6. Train team on monitoring tools
