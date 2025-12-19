# Comprehensive Testing Guide

This guide covers the complete testing setup for the cake order system, including frontend, backend, integration, and E2E tests.

## Table of Contents

1. [Setup](#setup)
2. [Frontend Testing](#frontend-testing)
3. [Backend Testing](#backend-testing)
4. [Integration Testing](#integration-testing)
5. [E2E Testing](#e2e-testing)
6. [Running Tests](#running-tests)
7. [CI/CD](#cicd)
8. [Best Practices](#best-practices)

## Setup

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

All testing dependencies are already installed. If you need to reinstall:

```bash
# Frontend testing packages
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/ui jsdom msw

# Backend testing packages
cd backend && npm install -D jest @types/jest supertest @types/supertest ts-jest

# E2E testing
npm install -D @playwright/test
```

## Frontend Testing

### Configuration

- **Config File**: `vitest.config.ts`
- **Test Utilities**: `src/test/test-utils.tsx`
- **Mock Server**: `src/test/mocks/server.ts`

### Writing Tests

Tests are located in `src/__tests__/frontend/` and use Vitest with React Testing Library.

#### Example: Component Test

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

#### Example: Form Interaction Test

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import OrderForm from '@/components/OrderForm';

describe('OrderForm', () => {
  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<OrderForm />);
    
    await user.type(screen.getByLabelText('Name'), 'John Doe');
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Order submitted')).toBeInTheDocument();
    });
  });
});
```

### Mocking

#### Mock Supabase

```tsx
import { createMockSupabaseClient } from '@/test/mocks/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: createMockSupabaseClient(),
}));
```

#### Mock API with MSW

```tsx
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

server.use(
  http.get('*/api/orders', () => {
    return HttpResponse.json({ orders: [] });
  })
);
```

### Test Utilities

Use factories for creating test data:

```tsx
import { createMockOrder, createMockUser } from '@/test/mocks/factories';

const order = createMockOrder({ status: 'confirmed' });
const user = createMockUser({ role: 'admin' });
```

## Backend Testing

### Configuration

- **Config File**: `backend/jest.config.js`
- **Test Setup**: `backend/__tests__/setup.js`

### Writing Tests

Tests are located in `backend/__tests__/` and use Jest with Supertest.

#### Example: API Route Test

```javascript
const request = require('supertest');
const app = require('../../server');

describe('POST /api/orders', () => {
  it('creates a new order', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({
        customer_name: 'Test Customer',
        total_amount: 50.00,
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
  });
});
```

#### Example: Middleware Test

```javascript
const { authenticate } = require('../../middleware/auth');
const { createMockRequest, createMockResponse } = require('../helpers/testFactories');

describe('authenticate middleware', () => {
  it('allows authenticated users', async () => {
    const req = createMockRequest({
      headers: { authorization: 'Bearer valid_token' },
    });
    const res = createMockResponse();
    const next = jest.fn();

    await authenticate(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
```

### Mocking Supabase

```javascript
const { createMockSupabaseClient } = require('../helpers/mockSupabase');

jest.mock('../../db/connection', () => ({
  supabase: createMockSupabaseClient(),
}));
```

## Integration Testing

Integration tests verify that multiple components work together.

### Example: Order Flow

```tsx
describe('Order Flow Integration', () => {
  it('completes full order flow', async () => {
    // 1. Create order
    // 2. Process payment
    // 3. Update status
    // 4. Send notifications
  });
});
```

## E2E Testing

E2E tests use Playwright to test the full application in a real browser.

### Configuration

- **Config File**: `playwright.config.ts`
- **Tests**: `e2e/*.spec.ts`

### Writing E2E Tests

```typescript
import { test, expect } from '@playwright/test';

test('customer can place an order', async ({ page }) => {
  await page.goto('/order');
  await page.fill('input[name="customerName"]', 'Test Customer');
  await page.click('button:has-text("Submit")');
  await expect(page.locator('text=Order confirmed')).toBeVisible();
});
```

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in specific browser
npx playwright test --project=chromium
```

## Running Tests

### Frontend Tests

```bash
# Run in watch mode
npm test

# Run once
npm run test:frontend

# Run with UI
npm run test:ui

# Generate coverage
npm run test:coverage
```

### Backend Tests

```bash
cd backend

# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm test -- --watch
```

### All Tests

```bash
# Run all tests (frontend + E2E)
npm run test:all
```

## CI/CD

### GitHub Actions

The CI/CD pipeline is configured in `.github/workflows/test.yml`:

1. **Frontend Tests**: Runs Vitest tests
2. **Backend Tests**: Runs Jest tests
3. **E2E Tests**: Runs Playwright tests
4. **Test Summary**: Aggregates results

### Required Secrets

For backend tests in CI, set these secrets:

- `SUPABASE_TEST_URL`
- `SUPABASE_TEST_ANON_KEY`
- `SUPABASE_TEST_SERVICE_KEY`

### Blocking Merges

The workflow will fail if:
- Any test suite fails
- Coverage drops below thresholds
- Linting fails

## Best Practices

### 1. Test Structure

- **Arrange**: Set up test data and mocks
- **Act**: Perform the action being tested
- **Assert**: Verify the expected outcome

### 2. Test Naming

Use descriptive test names:

```tsx
it('should validate email format and show error for invalid emails', () => {
  // ...
});
```

### 3. Test Isolation

Each test should be independent:

```tsx
beforeEach(() => {
  // Reset mocks and state
  vi.clearAllMocks();
  server.resetHandlers();
});
```

### 4. Coverage Goals

- **Critical paths**: 100% coverage
- **Overall**: 80%+ coverage
- **Payment logic**: 100% coverage
- **Auth logic**: 100% coverage

### 5. Mocking Strategy

- Mock external services (Supabase, Square, Email)
- Use MSW for API mocking
- Create reusable mock factories

### 6. E2E Test Best Practices

- Test critical user flows
- Keep tests fast (< 30s each)
- Use data-testid for reliable selectors
- Clean up test data after tests

### 7. Test Data Management

Use factories for consistent test data:

```tsx
const order = createMockOrder({
  status: 'pending',
  total_amount: 50.00,
});
```

## Test Examples

### Frontend: Order Form Validation

See: `src/__tests__/frontend/Order.test.tsx`

### Frontend: Auth Context

See: `src/__tests__/frontend/AuthContext.test.tsx`

### Backend: Orders API

See: `backend/__tests__/routes/orders.test.js`

### Backend: Auth Middleware

See: `backend/__tests__/middleware/auth.test.js`

### Integration: Order Flow

See: `src/__tests__/integration/order-flow.test.tsx`

### E2E: Customer Order Flow

See: `e2e/order-flow.spec.ts`

### E2E: Admin Dashboard

See: `e2e/admin-dashboard.spec.ts`

## Troubleshooting

### Tests Failing Locally

1. Clear node_modules and reinstall
2. Clear test cache: `npm test -- --clearCache`
3. Check environment variables

### E2E Tests Failing

1. Install browsers: `npx playwright install`
2. Check if dev server is running
3. Increase timeout if needed

### Coverage Not Generating

1. Ensure coverage provider is installed
2. Check vitest.config.ts coverage settings
3. Verify test files are being included

## Next Steps

1. Add more test cases for edge cases
2. Increase coverage to 90%+
3. Add performance tests
4. Add visual regression tests
5. Set up test reporting dashboard
