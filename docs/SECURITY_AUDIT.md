# Security Audit Checklist

Comprehensive security checklist for Eli's Bakery Cafe application. Review and verify each item before production deployment.

## Database Security

### Row Level Security (RLS)

- [ ] **All tables have RLS enabled**
  ```sql
  -- Verify RLS is enabled
  SELECT tablename, rowsecurity 
  FROM pg_tables 
  WHERE schemaname = 'public';
  ```

- [ ] **RLS policies tested for each role**
  - [ ] Customer can only view/edit own data
  - [ ] Baker can view all orders
  - [ ] Owner can view/edit all data
  - [ ] Test with each role in Supabase dashboard

- [ ] **No service role key exposed to frontend**
  - [ ] Verify only `VITE_SUPABASE_ANON_KEY` in frontend `.env`
  - [ ] Service role key only in backend `.env`
  - [ ] No service role key in version control

- [ ] **Sensitive data encrypted at rest**
  - [ ] Supabase default encryption verified
  - [ ] Payment data never stored (PCI compliance)
  - [ ] Passwords hashed (Supabase handles this)

- [ ] **Database backups enabled and tested**
  - [ ] Daily automated backups configured
  - [ ] Test restore procedure documented
  - [ ] Backup retention policy defined

## API Security

### Authentication & Authorization

- [ ] **All endpoints require authentication** (except public routes)
  - [ ] Health check endpoint is public
  - [ ] All other endpoints require auth token
  - [ ] Verify with unauthenticated requests

- [ ] **Role-based authorization implemented**
  - [ ] Customer endpoints check user role
  - [ ] Baker endpoints check baker/owner role
  - [ ] Owner endpoints check owner/admin role
  - [ ] Test with different user roles

- [ ] **Input validation on all endpoints**
  - [ ] Request body validation (Zod schemas)
  - [ ] Query parameter validation
  - [ ] Path parameter validation
  - [ ] File upload validation

- [ ] **SQL injection prevention**
  - [ ] Parameterized queries only (no string concatenation)
  - [ ] No raw SQL with user input
  - [ ] Use Supabase client or pg parameterized queries

- [ ] **XSS prevention**
  - [ ] Sanitize user inputs before display
  - [ ] Use React's built-in XSS protection
  - [ ] Sanitize HTML in user-generated content
  - [ ] Content Security Policy (CSP) headers

- [ ] **CSRF protection**
  - [ ] CSRF tokens for state-changing operations
  - [ ] SameSite cookie attributes
  - [ ] Verify Origin header

- [ ] **Rate limiting enabled**
  - [ ] Express rate limiter configured
  - [ ] Different limits for different endpoints
  - [ ] IP-based rate limiting
  - [ ] User-based rate limiting for authenticated requests

- [ ] **CORS configured properly**
  - [ ] Whitelist only allowed origins
  - [ ] No wildcard (`*`) in production
  - [ ] Credentials handled correctly
  - [ ] Preflight requests handled

- [ ] **Security headers configured (Helmet.js)**
  - [ ] Content-Security-Policy
  - [ ] X-Frame-Options
  - [ ] X-Content-Type-Options
  - [ ] Strict-Transport-Security (HSTS)
  - [ ] X-XSS-Protection
  - [ ] Referrer-Policy

## Authentication Security

### Password Security

- [ ] **Password requirements enforced**
  - [ ] Minimum length (8+ characters)
  - [ ] Complexity requirements (if applicable)
  - [ ] Supabase handles password hashing

- [ ] **JWT tokens expire appropriately**
  - [ ] Access tokens: 15 minutes (Supabase default)
  - [ ] Refresh tokens: 7 days (Supabase default)
  - [ ] Token rotation on refresh

- [ ] **Secure session management**
  - [ ] HttpOnly cookies (if using cookies)
  - [ ] Secure flag in production
  - [ ] SameSite attribute set

- [ ] **Password reset flow secure**
  - [ ] Time-limited reset tokens
  - [ ] Single-use tokens
  - [ ] Tokens expire after use
  - [ ] Email verification required

- [ ] **Account lockout after failed attempts**
  - [ ] Rate limiting on login endpoint
  - [ ] Temporary lockout after N failed attempts
  - [ ] Admin unlock capability

## Payment Security

### PCI Compliance

- [ ] **Never store card details**
  - [ ] No card numbers in database
  - [ ] No CVV stored
  - [ ] No expiration dates stored
  - [ ] Use Square Payment Form (tokenization)

- [ ] **Square SDK used correctly**
  - [ ] Payment form loaded from Square CDN
  - [ ] No raw card data handling
  - [ ] Card data never touches our servers
  - [ ] Payment tokens only

- [ ] **Payment amounts validated server-side**
  - [ ] Verify amount matches order total
  - [ ] Prevent negative amounts
  - [ ] Maximum amount limits
  - [ ] Currency validation

- [ ] **Webhook signatures verified**
  - [ ] Verify Square webhook signature
  - [ ] Reject unsigned webhooks
  - [ ] Log webhook verification failures

- [ ] **Refund authorization required**
  - [ ] Only owner/admin can process refunds
  - [ ] Refund reason required
  - [ ] Refund amount validation
  - [ ] Audit log for refunds

## Data Protection

### Secrets Management

- [ ] **All secrets in environment variables**
  - [ ] No hardcoded API keys
  - [ ] No secrets in code
  - [ ] No secrets in version control history

- [ ] **`.env` files in `.gitignore`**
  - [ ] `.env` listed in `.gitignore`
  - [ ] `.env.local` listed in `.gitignore`
  - [ ] `.env.production` listed in `.gitignore`
  - [ ] Verify with `git check-ignore .env`

- [ ] **API keys rotated regularly**
  - [ ] Rotation schedule defined
  - [ ] Process documented
  - [ ] Old keys revoked after rotation

- [ ] **Sensitive logs not exposed**
  - [ ] No API keys in logs
  - [ ] No passwords in logs
  - [ ] No payment data in logs
  - [ ] Log sanitization for production

- [ ] **Personal data handling complies with GDPR/CCPA**
  - [ ] Data retention policy
  - [ ] Right to deletion
  - [ ] Data export capability
  - [ ] Privacy policy published

## File Upload Security

### Upload Validation

- [ ] **File type validation (whitelist only images)**
  - [ ] Only allow: jpg, jpeg, png, webp
  - [ ] Reject executables, scripts
  - [ ] Check MIME type, not just extension

- [ ] **File size limits enforced (5MB max)**
  - [ ] Client-side validation
  - [ ] Server-side validation
  - [ ] Supabase Storage limits configured

- [ ] **Malware scanning for uploads** (if available)
  - [ ] Consider ClamAV or similar
  - [ ] Or use Supabase Storage scanning

- [ ] **Unique filenames to prevent overwriting**
  - [ ] UUID-based filenames
  - [ ] Timestamp + random string
  - [ ] No user-controlled filenames

- [ ] **Public URL access controlled**
  - [ ] RLS policies on storage buckets
  - [ ] Signed URLs for sensitive files
  - [ ] Time-limited URLs if needed

## Network Security

### HTTPS & SSL

- [ ] **SSL certificates configured**
  - [ ] Valid SSL certificate
  - [ ] Auto-renewal configured
  - [ ] HSTS header enabled
  - [ ] No mixed content warnings

- [ ] **API endpoints use HTTPS only**
  - [ ] HTTP redirects to HTTPS
  - [ ] No HTTP in production
  - [ ] Secure WebSocket (WSS) for realtime

### Firewall & Access Control

- [ ] **Database access restricted**
  - [ ] Only backend can access database
  - [ ] IP whitelist if possible
  - [ ] No direct database access from frontend

- [ ] **API rate limiting by IP**
  - [ ] Prevent DDoS attacks
  - [ ] Different limits for different endpoints
  - [ ] Whitelist for trusted IPs

## Application Security

### Error Handling

- [ ] **No sensitive information in error messages**
  - [ ] Generic error messages to users
  - [ ] Detailed errors only in logs
  - [ ] No stack traces in production

- [ ] **Error logging configured**
  - [ ] Errors logged to secure service
  - [ ] Error tracking (Sentry) configured
  - [ ] Alert on critical errors

### Dependency Security

- [ ] **No known vulnerabilities in dependencies**
  - [ ] `npm audit` shows no critical/high issues
  - [ ] Dependencies updated regularly
  - [ ] Security patches applied promptly

- [ ] **Dependency pinning in production**
  - [ ] Exact versions in `package-lock.json`
  - [ ] No `^` or `~` in production dependencies
  - [ ] Regular dependency updates

## Monitoring & Incident Response

### Security Monitoring

- [ ] **Failed login attempts monitored**
  - [ ] Alert on suspicious patterns
  - [ ] Brute force detection
  - [ ] Account lockout notifications

- [ ] **Unusual activity detection**
  - [ ] Multiple orders from same IP
  - [ ] Rapid status changes
  - [ ] Large refund amounts
  - [ ] Unusual payment patterns

- [ ] **Security incident response plan**
  - [ ] Documented procedures
  - [ ] Contact information
  - [ ] Escalation path
  - [ ] Communication plan

## Compliance

### Legal & Regulatory

- [ ] **Privacy policy published**
  - [ ] GDPR compliant
  - [ ] CCPA compliant (if applicable)
  - [ ] Data collection disclosed
  - [ ] Cookie policy

- [ ] **Terms of service published**
  - [ ] User responsibilities
  - [ ] Service limitations
  - [ ] Refund policy
  - [ ] Liability limitations

- [ ] **Cookie consent** (if applicable)
  - [ ] Cookie banner
  - [ ] Consent management
  - [ ] Opt-out options

## Security Testing

### Penetration Testing

- [ ] **Security testing performed**
  - [ ] OWASP Top 10 reviewed
  - [ ] SQL injection testing
  - [ ] XSS testing
  - [ ] CSRF testing
  - [ ] Authentication bypass testing

- [ ] **Third-party security audit** (recommended)
  - [ ] Professional penetration test
  - [ ] Code security review
  - [ ] Infrastructure security review

## Security Checklist Summary

### Critical (Must Complete Before Launch)

- [ ] All RLS policies tested
- [ ] No service role key in frontend
- [ ] All endpoints authenticated
- [ ] Input validation on all inputs
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers configured
- [ ] Payment security verified
- [ ] File upload security verified
- [ ] SSL certificates configured
- [ ] No secrets in version control
- [ ] Error handling secure
- [ ] Dependencies audited

### Important (Should Complete)

- [ ] Database backups tested
- [ ] Password requirements enforced
- [ ] Account lockout configured
- [ ] Webhook signatures verified
- [ ] File type validation
- [ ] Malware scanning (if available)
- [ ] Security monitoring configured
- [ ] Privacy policy published
- [ ] Terms of service published

### Recommended (Nice to Have)

- [ ] Third-party security audit
- [ ] Automated security scanning
- [ ] Security training for team
- [ ] Bug bounty program
- [ ] Security documentation updated

## Security Review Schedule

- **Before Launch**: Complete all Critical items
- **Monthly**: Review Important items
- **Quarterly**: Review all items
- **Annually**: Full security audit
- **After Incidents**: Immediate review

## Security Contacts

- **Security Lead**: [Name/Email]
- **Incident Response**: [Name/Email]
- **External Security**: [Vendor/Contact]

## Notes

- Review this checklist before each major release
- Update checklist as new security requirements emerge
- Document any exceptions with justification
- Keep security documentation up to date
