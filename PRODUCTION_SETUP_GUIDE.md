# Production Environment Setup Guide

Complete guide for setting up the production environment, DevOps configuration, and deployment pipeline.

## Table of Contents

1. [Environment Configuration](#environment-configuration)
2. [Supabase Production Setup](#supabase-production-setup)
3. [Square Production Setup](#square-production-setup)
4. [Domain and SSL Configuration](#domain-and-ssl-configuration)
5. [CDN and Caching](#cdn-and-caching)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Staging Environment](#staging-environment)
8. [Monitoring Setup](#monitoring-setup)
9. [Backup Strategy](#backup-strategy)
10. [Performance Baseline](#performance-baseline)
11. [Security Headers](#security-headers)
12. [Rate Limiting](#rate-limiting)

---

## Environment Configuration

### Environment Files

- `.env.development` - Local development
- `.env.production` - Production (DO NOT COMMIT)
- `.env.example` - Template with all required variables

### Required Environment Variables

#### Critical (App won't work without these):
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

#### Production Required:
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations
- `VITE_SQUARE_APPLICATION_ID` - Square application ID
- `VITE_SQUARE_LOCATION_ID` - Square location ID
- `SQUARE_ACCESS_TOKEN` - Square access token
- `SQUARE_WEBHOOK_SIGNATURE_KEY` - Webhook signature key
- `RESEND_API_KEY` - Resend API key for emails
- `FROM_EMAIL` - Sender email address
- `FROM_NAME` - Sender name
- `OWNER_EMAIL` - Owner email for notifications
- `FRONTEND_URL` - Production URL (https://yourdomain.com)
- `VITE_GOOGLE_MAPS_API_KEY` - Google Maps API key

#### Recommended:
- `VITE_SENTRY_DSN` - Sentry DSN for error tracking
- `VITE_SENTRY_ENVIRONMENT` - Environment name (production)

### Validation

Run environment validation before deployment:

```bash
node scripts/validate-env.js
```

Or set NODE_ENV:

```bash
NODE_ENV=production node scripts/validate-env.js
```

---

## Supabase Production Setup

### 1. Create Production Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose organization
4. Set project name: `your-bakery-production`
5. Set database password (save securely!)
6. Choose region closest to your users
7. Wait for project to be created

### 2. Run Database Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to production project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

Or manually run SQL files:

```bash
# Run all schema files in order
psql $PRODUCTION_DATABASE_URL -f backend/db/schema.sql
psql $PRODUCTION_DATABASE_URL -f backend/db/cms-schema.sql
psql $PRODUCTION_DATABASE_URL -f backend/db/customer-support-schema.sql
```

### 3. Configure RLS Policies

#### Contact Submissions
```sql
-- Allow public to insert
CREATE POLICY "Public can submit contact forms"
ON contact_submissions FOR INSERT
TO anon
WITH CHECK (true);

-- Only owners can view all
CREATE POLICY "Owners can view all submissions"
ON contact_submissions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'owner'
  )
);
```

#### Order Issues
```sql
-- Allow authenticated users to insert their own issues
CREATE POLICY "Users can report their own order issues"
ON order_issues FOR INSERT
TO authenticated
WITH CHECK (
  customer_id = auth.uid()
);

-- Owners can view all issues
CREATE POLICY "Owners can view all issues"
ON order_issues FOR SELECT
TO authenticated
USING (
  customer_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
    AND user_profiles.role = 'owner'
  )
);
```

### 4. Set Up Storage Buckets

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('cake-images', 'cake-images', true),
  ('contact-attachments', 'contact-attachments', false),
  ('order-issues', 'order-issues', false);

-- Set bucket policies
CREATE POLICY "Public can upload cake images"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'cake-images');

CREATE POLICY "Public can view cake images"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'cake-images');
```

### 5. Enable Realtime

Enable Realtime on these tables:
- `orders` - For order status updates
- `contact_submissions` - For admin notifications
- `order_issues` - For admin notifications

In Supabase Dashboard:
1. Go to Database → Replication
2. Enable replication for each table
3. Select the tables above

### 6. Configure Auth Settings

1. Go to Authentication → URL Configuration
2. Set Site URL: `https://yourdomain.com`
3. Add Redirect URLs:
   - `https://yourdomain.com/auth/callback`
   - `https://yourdomain.com/order-confirmation`
   - `https://staging.yourdomain.com/auth/callback` (for staging)

4. Configure Email Templates:
   - Customize confirmation email
   - Customize password reset email
   - Customize magic link email

### 7. Set Up Automatic Backups

Supabase automatically backs up your database:
- Daily backups retained for 7 days
- Weekly backups retained for 4 weeks
- Point-in-time recovery available

To enable additional backups:
1. Go to Database → Backups
2. Enable Point-in-Time Recovery (PITR)
3. Configure backup retention policy

---

## Square Production Setup

### 1. Switch to Production

1. Go to [Square Developer Dashboard](https://developer.squareup.com)
2. Select your application
3. Go to "Credentials"
4. Copy production credentials:
   - Application ID
   - Access Token
   - Location ID

### 2. Update Environment Variables

```bash
SQUARE_ENVIRONMENT=production
VITE_SQUARE_APPLICATION_ID=your_production_app_id
VITE_SQUARE_LOCATION_ID=your_production_location_id
SQUARE_ACCESS_TOKEN=your_production_access_token
SQUARE_WEBHOOK_SIGNATURE_KEY=your_production_webhook_key
```

### 3. Configure Webhooks

1. Go to Square Dashboard → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/square`
3. Subscribe to events:
   - `payment.updated`
   - `refund.updated`
4. Copy webhook signature key

### 4. Test with Real Payment

⚠️ **Test with a small amount first!**

1. Create a test order
2. Process payment with real card
3. Verify webhook receives event
4. Check order status updates correctly

### 5. Set Up Production Location

1. Go to Square Dashboard → Locations
2. Select your production location
3. Verify location ID matches environment variable
4. Configure location settings (hours, timezone, etc.)

---

## Domain and SSL Configuration

### Vercel

1. Go to Project Settings → Domains
2. Add your domain: `yourdomain.com`
3. Add `www.yourdomain.com` (optional)
4. Follow DNS configuration instructions
5. SSL certificate is automatically provisioned

### Netlify

1. Go to Site Settings → Domain Management
2. Add custom domain: `yourdomain.com`
3. Configure DNS records
4. SSL certificate is automatically provisioned via Let's Encrypt

### DNS Configuration

Add these DNS records:

```
Type    Name    Value
A       @       [Vercel/Netlify IP]
CNAME   www     [Vercel/Netlify CNAME]
```

### Force HTTPS

Both Vercel and Netlify automatically:
- Redirect HTTP to HTTPS
- Provide SSL certificates
- Enforce HTTPS

### WWW Redirect

To redirect www to non-www (or vice versa):

**Vercel** (`vercel.json`):
```json
{
  "redirects": [
    {
      "source": "www.yourdomain.com",
      "destination": "https://yourdomain.com",
      "permanent": true
    }
  ]
}
```

**Netlify** (`netlify.toml`):
```toml
[[redirects]]
  from = "https://www.yourdomain.com/*"
  to = "https://yourdomain.com/:splat"
  status = 301
  force = true
```

---

## CDN and Caching

### Vercel Edge Caching

Vercel automatically provides:
- Global CDN
- Edge caching for static assets
- Automatic image optimization

Configure in `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Netlify CDN

Netlify provides:
- Global CDN
- Automatic asset optimization
- Image transformation

### Image Optimization

Both platforms support:
- Automatic WebP conversion
- Responsive images
- Lazy loading

---

## CI/CD Pipeline

### GitHub Actions Workflows

Three workflows are configured:

1. **CI** (`.github/workflows/ci.yml`)
   - Runs on pull requests
   - Runs tests
   - Verifies build
   - Runs Lighthouse CI

2. **Deploy Staging** (`.github/workflows/deploy-staging.yml`)
   - Runs on push to `develop` branch
   - Deploys to staging environment
   - Runs database migrations

3. **Deploy Production** (`.github/workflows/deploy-production.yml`)
   - Runs on push to `main` branch
   - Requires manual confirmation
   - Runs production migrations
   - Creates GitHub release

### Required GitHub Secrets

Add these secrets in GitHub Settings → Secrets:

```
# Supabase
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
STAGING_SUPABASE_URL
STAGING_SUPABASE_ANON_KEY

# Square
VITE_SQUARE_APPLICATION_ID
VITE_SQUARE_LOCATION_ID
SQUARE_ACCESS_TOKEN
SQUARE_WEBHOOK_SIGNATURE_KEY
STAGING_SQUARE_APPLICATION_ID
STAGING_SQUARE_LOCATION_ID

# Email
RESEND_API_KEY
FROM_EMAIL
FROM_NAME
OWNER_EMAIL

# URLs
FRONTEND_URL
STAGING_FRONTEND_URL

# Deployment
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
VERCEL_STAGING_PROJECT_ID
NETLIFY_AUTH_TOKEN
NETLIFY_SITE_ID
NETLIFY_STAGING_SITE_ID

# Monitoring
VITE_SENTRY_DSN
STAGING_SENTRY_DSN

# Notifications
SLACK_WEBHOOK_URL

# Other
VITE_GOOGLE_MAPS_API_KEY
```

### Deployment Process

1. **Development**:
   ```bash
   git checkout develop
   git pull
   # Make changes
   git commit -m "Feature: ..."
   git push
   # Creates PR to main
   ```

2. **Staging**:
   ```bash
   git checkout develop
   git merge feature-branch
   git push
   # Auto-deploys to staging
   ```

3. **Production**:
   ```bash
   git checkout main
   git merge develop
   git push
   # Auto-deploys to production
   ```

---

## Staging Environment

### Setup

1. Create separate Supabase project for staging
2. Use Square sandbox credentials
3. Deploy to `staging.yourdomain.com`
4. Password protect (optional but recommended)

### Password Protection (Netlify)

1. Go to Site Settings → Access Control
2. Enable "Password Protection"
3. Set password
4. Share with team

### Password Protection (Vercel)

Use Vercel's password protection:
1. Go to Project Settings → Deployment Protection
2. Enable "Password Protection"
3. Set password

### Staging Environment Variables

Use separate credentials:
- Staging Supabase project
- Square sandbox
- Staging Sentry project
- Test email addresses

---

## Monitoring Setup

### Sentry Error Tracking

1. Create account at [sentry.io](https://sentry.io)
2. Create new project (React)
3. Copy DSN
4. Add to environment variables:
   ```
   VITE_SENTRY_DSN=your_sentry_dsn
   VITE_SENTRY_ENVIRONMENT=production
   ```

5. Configure in code:
   ```typescript
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
   });
   ```

### UptimeRobot Monitoring

1. Create account at [uptimerobot.com](https://uptimerobot.com)
2. Add new monitor:
   - Type: HTTPS
   - URL: `https://yourdomain.com`
   - Interval: 5 minutes
3. Configure alerts:
   - Email notifications
   - Slack webhook (optional)

### Alert Channels

Configure alerts for:
- Site downtime
- High error rate
- Slow response times
- Failed deployments

---

## Backup Strategy

### Automatic Backups (Supabase)

Supabase provides:
- Daily backups (7 days retention)
- Weekly backups (4 weeks retention)
- Point-in-time recovery

### Manual Backups

#### Database Export

```bash
# Export database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Compress
gzip backup_$(date +%Y%m%d).sql
```

#### Storage Backup

```bash
# Backup Supabase storage
# Use Supabase CLI or API to download all files
```

### Backup Schedule

- **Daily**: Automatic (Supabase)
- **Weekly**: Manual export of critical data
- **Before major changes**: Full backup

### Restore Procedure

1. **Database Restore**:
   ```bash
   psql $DATABASE_URL < backup_20240101.sql
   ```

2. **Point-in-Time Recovery**:
   - Use Supabase dashboard
   - Select restore point
   - Confirm restore

3. **Test Restore**:
   - Restore to staging environment
   - Verify data integrity
   - Test application functionality

---

## Performance Baseline

### Lighthouse Audit

Run Lighthouse audit:

```bash
npm run build
npm run preview
# In another terminal:
npx lighthouse http://localhost:4173 --view
```

### Performance Budget

Target scores:
- **Performance**: ≥ 85
- **Accessibility**: ≥ 90
- **Best Practices**: ≥ 90
- **SEO**: ≥ 85

### Lighthouse CI

Configured in `.lighthouserc.json`:
- Runs on every PR
- Fails if scores below threshold
- Uploads reports to temporary storage

### Performance Monitoring

Track these metrics:
- First Contentful Paint (FCP): < 2s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Total Blocking Time (TBT): < 300ms
- Speed Index: < 3s

---

## Security Headers

### Configured Headers

All security headers are configured in:
- `vercel.json` (for Vercel)
- `netlify.toml` (for Netlify)

Headers include:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

### Content Security Policy

Configured in `netlify.toml`:

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https: blob: https://*.supabase.co;
connect-src 'self' https://*.supabase.co https://api.squareup.com;
```

### Security Testing

Test headers:
```bash
curl -I https://yourdomain.com
```

Verify all headers are present.

---

## Rate Limiting

### Contact Form

- **Limit**: 3 submissions per hour per IP
- **Implementation**: Database table `contact_rate_limits`
- **Configuration**: `RATE_LIMIT_CONTACT_FORM=3`

### Login Attempts

- **Limit**: 5 attempts per 15 minutes
- **Implementation**: Supabase Auth (built-in)
- **Configuration**: `RATE_LIMIT_LOGIN_ATTEMPTS=5`

### API Requests

- **Limit**: 100 requests per minute per IP
- **Implementation**: Edge function middleware
- **Configuration**: `RATE_LIMIT_API_REQUESTS=100`

### Production Configuration

Set in environment variables:
```bash
RATE_LIMIT_CONTACT_FORM=3
RATE_LIMIT_LOGIN_ATTEMPTS=5
RATE_LIMIT_API_REQUESTS=100
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All environment variables set
- [ ] Database migrations tested in staging
- [ ] Supabase RLS policies configured
- [ ] Storage buckets created and configured
- [ ] Square production credentials verified
- [ ] Webhook endpoints tested
- [ ] SSL certificate active
- [ ] Domain DNS configured
- [ ] Security headers verified
- [ ] Rate limiting configured
- [ ] Monitoring set up (Sentry, UptimeRobot)
- [ ] Backup strategy in place
- [ ] Team access configured
- [ ] Documentation updated

---

## Troubleshooting

### Build Failures

1. Check environment variables
2. Verify Node.js version (18+)
3. Check for TypeScript errors
4. Review build logs

### Deployment Failures

1. Check GitHub Actions logs
2. Verify deployment platform credentials
3. Check environment variable configuration
4. Review error messages

### Database Issues

1. Check Supabase connection
2. Verify RLS policies
3. Check migration status
4. Review database logs

---

## Support

For issues or questions:
1. Check this documentation
2. Review GitHub Actions logs
3. Check deployment platform logs
4. Review Supabase dashboard
5. Contact support if needed

---

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Square Developer Docs](https://developer.squareup.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
