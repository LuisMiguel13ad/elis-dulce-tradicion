# Testing Patterns

**Analysis Date:** 2026-01-30

## Test Framework

**Runner:**
- Vitest (^latest in package.json)
- Config: `vitest.config.ts`
- Environment: jsdom (browser simulation)

**Assertion Library:**
- @testing-library/jest-dom (extends expect API)
- Testing library assertions (getByText, getByRole, etc.)

**Run Commands:**
```bash
npm run test              # Run tests with Vitest
npm run test:ui          # Open Vitest UI
npm run test:frontend    # Vitest run (CI mode)
npm run test:coverage    # Generate coverage report
npm run test:e2e         # Run Playwright tests (if configured)
npm run test:e2e:ui      # Open Playwright UI
npm run test:all         # Run both frontend and e2e
```

## Test File Organization

**Location:**
- Co-located with source: `src/__tests__/` directory structure mirrors src organization
- Subdirectories by category: `frontend/`, `integration/`

**Naming:**
- Pattern: `*.test.tsx` or `*.test.ts` for component/unit tests
- Pattern: `*.spec.ts` also supported (from vitest config exclusions)

**Structure:**
```
src/__tests__/
├── frontend/
│   ├── AuthContext.test.tsx
│   ├── OrderTracking.test.tsx
│   ├── Menu.test.tsx
│   └── Order.test.tsx
├── integration/
│   └── order-flow.test.tsx
└── orderStateMachine.test.ts
```

**Setup Files:**
- `src/test/setup.ts` - global test configuration
- `src/test/test-utils.tsx` - custom render function and test helpers
- `src/test/mocks/` - mock servers and factory functions

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';

describe('Component Name', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders element', () => {
    render(<Component />);
    expect(screen.getByText(/text/i)).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<Component />);
    await user.click(screen.getByRole('button', { name: /click/i }));
    expect(/* assertion */);
  });
});
```

**Patterns:**
- `describe()` for grouping related tests
- `it()` or `test()` for individual test cases
- `beforeEach()` for per-test setup and mock clearing
- `afterEach()` for cleanup (handled in global setup for React)
- Async/await patterns for user interactions

## Mocking

**Framework:** MSW (Mock Service Worker) for API mocking + Vitest's vi for module mocking

**API Mocking with MSW:**
```typescript
// src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get(`${API_BASE}/orders`, () => {
    return HttpResponse.json({
      orders: [],
      total: 0,
    });
  }),

  http.post(`${API_BASE}/orders`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 1,
      ...body,
      status: 'pending',
      created_at: new Date().toISOString(),
    });
  }),
];
```

**Server Setup:**
```typescript
// src/test/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

**Global Setup (src/test/setup.ts):**
```typescript
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());
```

**Module Mocking:**
```typescript
// Mock context hooks
vi.mock('@/contexts/AuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      user: null,
      loading: false,
    }),
  };
});

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});
```

**Supabase Mocking:**
```typescript
// src/test/mocks/supabase.ts
export const createMockSupabaseClient = () => ({
  auth: {
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { user: { id: 'user_123', email: 'test@example.com' }, session: {...} },
      error: null,
    }),
    signUp: vi.fn().mockResolvedValue({...}),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    getUser: vi.fn().mockResolvedValue({...}),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: null },
      unsubscribe: vi.fn(),
    })),
  },
  from: vi.fn((table: string) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: mockData[table]?.[0] || null,
      error: null,
    }),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    then: vi.fn((callback) => {
      const result = {
        data: mockData[table] || [],
        error: null,
      };
      return Promise.resolve(result).then(callback);
    }),
  })),
  storage: {...},
  channel: vi.fn(() => ({...})),
});
```

**What to Mock:**
- External API calls (via MSW handlers)
- Navigation (useNavigate, useParams)
- Context hooks when testing components that use them
- Authentication state
- Date/time operations (if testing time-dependent logic)

**What NOT to Mock:**
- Internal component logic
- DOM APIs (covered by jsdom)
- React utilities (React, hooks)
- Testing library functions

## Fixtures and Factories

**Test Data:**
```typescript
// src/test/mocks/factories.ts
export const createMockUser = (overrides = {}) => ({
  id: 'user_123',
  email: 'test@example.com',
  profile: {
    id: 'user_123',
    role: 'customer' as const,
    full_name: 'Test User',
    phone: '610-555-1234',
    preferred_language: 'en',
    ...overrides,
  },
});

export const createMockOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 1,
  order_number: 'ORD-2024-001',
  status: 'pending',
  customer_name: 'Test Customer',
  customer_phone: '610-555-1234',
  customer_language: 'en',
  date_needed: new Date(Date.now() + 86400000).toISOString().split('T')[0],
  time_needed: '14:00',
  cake_size: 'medium',
  filling: 'chocolate',
  theme: 'birthday',
  dedication: 'Happy Birthday!',
  delivery_option: 'pickup',
  total_amount: 50.00,
  payment_status: 'pending',
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createMockAddress = (overrides = {}) => ({
  id: 1,
  address: '123 Main St',
  apartment: 'Apt 4B',
  zip_code: '19020',
  city: 'Norristown',
  state: 'PA',
  is_default: true,
  ...overrides,
});
```

**Location:**
- `src/test/mocks/factories.ts` - factory functions for creating test data
- Factories used to create consistent test data with easy customization

**Usage Pattern:**
```typescript
const mockOrder = createMockOrder({ status: 'confirmed', customer_name: 'Jane Doe' });
const mockUser = createMockUser({ role: 'baker' });
```

## Coverage

**Requirements:**
- Targets configured in `vitest.config.ts`:
  - Lines: 80%
  - Functions: 80%
  - Branches: 80%
  - Statements: 80%

**View Coverage:**
```bash
npm run test:coverage
```

**Coverage Report Output:**
- Provider: v8 (built-in)
- Reporters: text, json, html
- Exclusions:
  - node_modules/
  - src/test/
  - **/*.d.ts
  - **/*.config.*
  - **/mockData
  - **/*.test.{ts,tsx}
  - **/*.spec.{ts,tsx}

## Test Types

**Unit Tests:**
- Scope: Individual functions, hooks, components in isolation
- Approach: Mock external dependencies (APIs, contexts)
- Example: `AuthContext.test.tsx` tests hook functionality with mocked Supabase
- Files: `src/__tests__/frontend/*.test.tsx`

**Integration Tests:**
- Scope: Multiple components/features working together
- Approach: Use real component logic, mock external APIs
- Example: `order-flow.test.tsx` tests complete order creation → payment → tracking flow
- Files: `src/__tests__/integration/*.test.tsx`
- Status: Partially implemented (framework structure with conceptual tests)

**E2E Tests:**
- Framework: Playwright (configured but not fully implemented)
- Commands: `npm run test:e2e`, `npm run test:e2e:ui`
- Status: Not yet populated with tests

## Common Patterns

**Async Testing:**
```typescript
it('loads data asynchronously', async () => {
  render(<Component />);

  const element = await screen.findByText(/loaded/i);
  expect(element).toBeInTheDocument();
});

it('handles user async actions', async () => {
  const user = userEvent.setup();
  render(<Component />);

  await user.type(screen.getByRole('textbox'), 'value');
  await user.click(screen.getByRole('button'));

  await waitFor(() => {
    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });
});
```

**Error Testing:**
```typescript
it('handles errors gracefully', async () => {
  // Mock error response
  server.use(
    http.post('*/api/endpoint', () => {
      return HttpResponse.json(
        { error: 'Server error' },
        { status: 500 }
      );
    })
  );

  render(<Component />);
  // Trigger operation that should fail

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

**Custom Render Function:**
```typescript
// src/test/test-utils.tsx provides customRender with all required providers
const customRender = (
  ui: ReactElement,
  { queryClient, ...renderOptions }: CustomRenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllTheProviders queryClient={queryClient}>{children}</AllTheProviders>
  );
  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Usage: import { render } from '@/test/test-utils'
// This automatically wraps component with QueryClientProvider, ThemeProvider,
// LanguageProvider, AuthProvider, TooltipProvider, BrowserRouter
```

**MSW Handler Override:**
```typescript
it('uses custom handler for this test', async () => {
  server.use(
    http.post('*/api/pricing/calculate', () => {
      return HttpResponse.json({
        basePrice: 50,
        fillingCost: 5,
        themeCost: 10,
        deliveryFee: 0,
        tax: 0,
        subtotal: 65,
        discount: 0,
        total: 65,
      });
    })
  );

  render(<Component />);
  // Test with custom pricing
});
```

## Test Infrastructure

**Global Setup (src/test/setup.ts):**
- MSW server lifecycle (beforeAll, afterEach, afterAll)
- React Testing Library cleanup
- window.matchMedia mock for responsive design tests
- IntersectionObserver mock
- ResizeObserver mock

**Query Client Config (test-utils.tsx):**
- Queries: retry disabled, cache time 0 (clean state per test)
- Mutations: retry disabled
- Enables isolation between tests

---

*Testing analysis: 2026-01-30*
