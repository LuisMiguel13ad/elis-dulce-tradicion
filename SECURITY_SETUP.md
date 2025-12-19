# Security Setup Instructions

## Quick Start

### 1. Install Dependencies

```bash
npm install helmet express-rate-limit validator isomorphic-dompurify
```

### 2. Run Database Migrations

Execute these SQL scripts in your Supabase SQL Editor:

1. **Error Logs Table**:
   ```sql
   -- Run: backend/db/error-logs-schema.sql
   ```

2. **RLS Policies**:
   ```sql
   -- Run: backend/db/rls-policies.sql
   ```

3. **Enable Realtime** (if using real-time features):
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE orders;
   ```

### 3. Configure Environment Variables

Create/update `.env` file:

```env
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Recommended
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_API_KEY=your-strong-admin-api-key
FRONTEND_URL=https://your-frontend-url.com

# Optional
SENTRY_DSN=your-sentry-dsn
NODE_ENV=production
PORT=3001
```

### 4. Verify Setup

Start the server:
```bash
npm run server
```

You should see:
```
✅ Environment variables validated
🎂 Eli's Bakery Backend Running
```

## Security Features Enabled

✅ **Rate Limiting**: Prevents abuse
✅ **Input Sanitization**: XSS prevention
✅ **Authentication**: JWT + API key
✅ **RLS Policies**: Database-level security
✅ **Error Logging**: Security monitoring
✅ **Security Headers**: Helmet.js protection
✅ **CORS**: Origin restrictions
✅ **SQL Injection Prevention**: Parameterized queries

## Testing Security

### Test Rate Limiting
```bash
# Should fail after 10 requests
for i in {1..15}; do
  curl -X POST http://localhost:3001/api/orders \
    -H "Content-Type: application/json" \
    -d '{"test": "data"}'
done
```

### Test Authentication
```bash
# Should fail with 401
curl http://localhost:3001/api/orders

# Should succeed with token
curl http://localhost:3001/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test Input Validation
```bash
# Should fail with validation error
curl -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customer_email": "invalid-email"}'
```

## Monitoring

- Check `error_logs` table for security issues
- Monitor rate limit violations in logs
- Review Sentry errors (if configured)
- Check authentication failures

## Troubleshooting

### "Packages not found" error
Run: `npm install helmet express-rate-limit validator isomorphic-dompurify`

### "RLS policy violation" error
Run the RLS policies SQL script in Supabase

### "Environment variables not set" error
Check your `.env` file and ensure all required variables are set

### Rate limiting too strict
Adjust limits in `backend/middleware/rateLimit.js`

## Next Steps

1. Review `SECURITY_IMPLEMENTATION.md` for detailed documentation
2. Test all security features
3. Configure Sentry for production error tracking
4. Set up monitoring alerts for security events
