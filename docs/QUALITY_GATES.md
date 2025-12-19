# Quality Gates

Quality gates that must pass before code is merged or deployed to production.

## Test Coverage Requirements

### Minimum Coverage

- **Critical Paths**: > 90% coverage
  - Order creation flow
  - Payment processing
  - Authentication
  - Status transitions

- **Overall Coverage**: > 80% coverage
  - All new code must have tests
  - Bug fixes must include regression tests

### Coverage Check

```bash
# Frontend
npm run test:coverage

# Backend
cd backend && npm run test:coverage
```

### Coverage Reports

- Reports generated in `coverage/` directory
- Review coverage before merging PRs
- Fail CI if coverage drops below threshold

## Performance Benchmarks

### Frontend Performance

- **Lighthouse Score**: > 90 for all categories
  - Performance: > 90
  - Accessibility: > 90
  - Best Practices: > 90
  - SEO: > 90

- **Web Vitals**:
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1

- **Bundle Size**: < 400KB gzipped
  - Monitor bundle size in CI
  - Alert if size increases > 10%

### Backend Performance

- **API Response Time**: < 500ms (p95)
  - Health check: < 50ms
  - Order creation: < 1000ms
  - Search queries: < 500ms

- **Database Query Time**: < 200ms (p95)
  - Simple queries: < 50ms
  - Complex queries: < 500ms
  - Alert on queries > 2s

### Performance Testing

```bash
# Lighthouse CI
npm run lighthouse

# Load testing (optional)
npm run load-test
```

## Security Requirements

### Security Audit

- **No Critical Vulnerabilities**: 0 critical issues
- **No High Vulnerabilities**: 0 high issues
- **Moderate Vulnerabilities**: < 5 moderate issues

### Security Checks

```bash
# Frontend
npm audit

# Backend
cd backend && npm audit
```

### Security Checklist

- [ ] All dependencies audited
- [ ] No secrets in code
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers set

See [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) for complete checklist.

## Code Quality Standards

### Linting

- **ESLint**: No errors, warnings allowed
- **TypeScript**: No type errors
- **Prettier**: All files formatted

```bash
# Check linting
npm run lint

# Auto-fix
npm run lint:fix
```

### Type Safety

- **No `any` types**: Use `unknown` if type is truly unknown
- **Type coverage**: > 95% of code typed
- **Strict mode**: TypeScript strict mode enabled

### Code Review Requirements

- [ ] At least 1 approval required
- [ ] All CI checks passing
- [ ] No merge conflicts
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] Breaking changes documented

## Build Requirements

### Build Success

- **Frontend Build**: Must succeed without errors
- **Backend Build**: Must succeed without errors
- **Type Checking**: Must pass
- **Linting**: Must pass

```bash
# Frontend
npm run build

# Backend
cd backend && npm run build
```

### Build Artifacts

- Frontend: `dist/` directory
- Backend: Compiled JavaScript
- No build warnings (errors are blockers)

## Documentation Requirements

### Code Documentation

- **New Features**: Must include JSDoc comments
- **Complex Logic**: Must include inline comments
- **API Endpoints**: Must include Swagger documentation
- **Breaking Changes**: Must be documented in CHANGELOG

### Documentation Checklist

- [ ] README updated (if needed)
- [ ] API documentation updated
- [ ] Setup guide updated (if needed)
- [ ] Migration guide updated (if schema changes)
- [ ] Security documentation updated (if security changes)

## Database Requirements

### Migration Requirements

- [ ] Migration files follow naming convention
- [ ] Migrations are reversible (documented)
- [ ] Migrations tested on staging
- [ ] No data loss in migrations
- [ ] Indexes added for new queries

### Database Performance

- [ ] All queries use indexes
- [ ] No N+1 query problems
- [ ] Foreign keys properly defined
- [ ] RLS policies tested

## Accessibility Requirements

### WCAG 2.1 Compliance

- **Level AA**: Minimum requirement
- **Keyboard Navigation**: All features accessible via keyboard
- **Screen Readers**: Proper ARIA labels
- **Color Contrast**: Meets WCAG standards

### Accessibility Testing

```bash
# Automated testing
npm run test:a11y

# Manual testing checklist
# - Tab through all interactive elements
# - Test with screen reader
# - Verify color contrast
# - Test on mobile devices
```

## Browser Compatibility

### Supported Browsers

- **Chrome**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Edge**: Latest 2 versions
- **Mobile**: iOS Safari, Chrome Android

### Testing Requirements

- [ ] Tested on all supported browsers
- [ ] No console errors
- [ ] Responsive design verified
- [ ] Mobile experience tested

## Quality Gate Checklist

Before merging to main:

- [ ] All tests passing
- [ ] Test coverage > 80%
- [ ] No linting errors
- [ ] No type errors
- [ ] Build succeeds
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Documentation updated
- [ ] Code review approved
- [ ] Accessibility verified
- [ ] Browser compatibility verified

Before deploying to production:

- [ ] All quality gates passed
- [ ] Staging environment tested
- [ ] Database migrations tested
- [ ] Rollback plan documented
- [ ] Monitoring configured
- [ ] Alerts configured
- [ ] Launch checklist completed

## CI/CD Integration

### GitHub Actions

Quality gates should be enforced in CI:

```yaml
# .github/workflows/quality-gates.yml
name: Quality Gates
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run test:coverage
      - run: npm audit
      - run: npm run build
      - run: npm run lighthouse
```

### Blocking vs Non-Blocking

**Blocking** (Must pass):
- Test failures
- Build failures
- Type errors
- Critical security vulnerabilities
- Linting errors

**Non-Blocking** (Warnings):
- Moderate security vulnerabilities
- Performance regressions (< 10%)
- Coverage drops (< 5%)

## Quality Metrics Dashboard

Track quality metrics over time:

- Test coverage trend
- Performance metrics
- Security vulnerabilities
- Build success rate
- Code review time

## Continuous Improvement

- **Weekly**: Review quality metrics
- **Monthly**: Update quality gates
- **Quarterly**: Full quality audit
- **Annually**: Review and update standards

## Exceptions

Exceptions to quality gates must be:
- Documented with justification
- Approved by tech lead
- Time-limited with plan to fix
- Tracked in issue tracker

## Quality Gate Status

**Current Status**: ✅ All gates passing

**Last Audit**: 2024-12-09

**Next Review**: 2025-01-09
