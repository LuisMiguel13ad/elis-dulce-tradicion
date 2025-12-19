# Code Consistency Review

This document outlines the coding standards, naming conventions, and patterns used throughout the codebase to ensure consistency and maintainability.

## Naming Conventions

### Components

**Pattern**: PascalCase

```typescript
// ✅ Correct
export const OrderCard = () => { ... }
export const SearchBar = () => { ... }
export default OrderHistory;

// ❌ Incorrect
export const orderCard = () => { ... }
export const search_bar = () => { ... }
```

**File Names**: Match component name
- `OrderCard.tsx`
- `SearchBar.tsx`
- `OrderHistory.tsx`

### Hooks

**Pattern**: camelCase starting with 'use'

```typescript
// ✅ Correct
export const useOrderStatus = () => { ... }
export const useOrderSearch = () => { ... }
export function useAuth() { ... }

// ❌ Incorrect
export const OrderStatus = () => { ... }
export const use_order_status = () => { ... }
```

**File Names**: Match hook name
- `useOrderStatus.ts`
- `useOrderSearch.ts`
- `useAuth.tsx`

### Utilities

**Pattern**: camelCase

```typescript
// ✅ Correct
export const formatPrice = (amount: number) => { ... }
export const validateEmail = (email: string) => { ... }
export function calculateTotal(items: Item[]) { ... }

// ❌ Incorrect
export const FormatPrice = () => { ... }
export const format_price = () => { ... }
```

**File Names**: Match function name
- `formatPrice.ts`
- `validateEmail.ts`
- `calculateTotal.ts`

### Constants

**Pattern**: UPPER_SNAKE_CASE

```typescript
// ✅ Correct
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const API_BASE_URL = 'https://api.example.com';
export const ORDER_STATUSES = ['pending', 'confirmed', ...] as const;

// ❌ Incorrect
export const maxFileSize = 5 * 1024 * 1024;
export const apiBaseUrl = 'https://api.example.com';
```

### Types & Interfaces

**Pattern**: PascalCase

```typescript
// ✅ Correct
export interface Order {
  id: number;
  order_number: string;
  // ...
}

export type OrderStatus = 'pending' | 'confirmed' | 'in_progress';

export type UserRole = 'customer' | 'baker' | 'owner';

// ❌ Incorrect
export interface order { ... }
export type order_status = 'pending' | 'confirmed';
```

### Enums

**Pattern**: PascalCase with PascalCase values

```typescript
// ✅ Correct
export enum OrderStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  InProgress = 'in_progress',
}

// ❌ Incorrect
export enum orderStatus {
  pending = 'pending',
}
```

## Component Structure

### Standard Component Template

```typescript
// 1. React imports
import { useState, useEffect } from 'react';

// 2. External libraries
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// 3. Internal modules (components)
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 4. Internal modules (hooks)
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

// 5. Internal modules (utilities)
import { formatPrice } from '@/lib/pricing';
import { api } from '@/lib/api';

// 6. Types
import type { Order } from '@/types/order';

// 7. Styles (if needed)
import './ComponentName.css';

// 8. Type definitions
interface ComponentNameProps {
  orderId: number;
  onComplete?: () => void;
}

// 9. Component definition
export const ComponentName = ({ orderId, onComplete }: ComponentNameProps) => {
  // Hooks
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Order | null>(null);
  
  // Effects
  useEffect(() => {
    // ...
  }, [orderId]);
  
  // Handlers
  const handleClick = () => {
    // ...
  };
  
  // Render
  return (
    <Card>
      {/* ... */}
    </Card>
  );
};

// 10. Export
export default ComponentName;
```

## Error Handling Pattern

### Frontend Error Handling

```typescript
// ✅ Standard pattern
try {
  setIsLoading(true);
  const result = await api.getOrder(orderId);
  setData(result);
} catch (error) {
  console.error('Error fetching order:', error);
  toast.error(
    t('Error al cargar orden', 'Error loading order'),
    {
      description: error instanceof Error ? error.message : 'Unknown error',
    }
  );
} finally {
  setIsLoading(false);
}
```

### Backend Error Handling

```typescript
// ✅ Standard pattern
router.get('/orders/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const order = await getOrderById(parseInt(id));
    
    if (!order) {
      return sendError(res, 'Order not found', 404);
    }
    
    return sendSuccess(res, order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return sendError(res, 'Failed to fetch order', 500);
  }
}));
```

### Error Response Format

**Success Response**:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-12-09T12:00:00.000Z",
    "requestId": "req_123"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Order with ID 123 not found",
    "details": { ... }
  }
}
```

## TypeScript Usage

### No 'any' Types

```typescript
// ✅ Correct
const handleSubmit = (data: OrderFormData) => { ... }
const orders: Order[] = [];

// Use 'unknown' if type is truly unknown
const handleUnknown = (data: unknown) => {
  if (typeof data === 'string') {
    // TypeScript knows data is string here
  }
}

// ❌ Incorrect
const handleSubmit = (data: any) => { ... }
const orders: any[] = [];
```

### Type Definitions

**Centralized Types**:
- `src/types/order.ts` - Order types
- `src/types/auth.ts` - Authentication types
- `src/types/user.ts` - User types

**Export Pattern**:
```typescript
// types/order.ts
export interface Order {
  id: number;
  order_number: string;
  // ...
}

export type OrderStatus = 'pending' | 'confirmed' | 'in_progress';

export type OrderFormData = {
  cake_size: string;
  filling: string;
  // ...
};
```

### Type Guards

```typescript
// ✅ Type guard function
function isOrder(obj: unknown): obj is Order {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'order_number' in obj
  );
}

// Usage
const data: unknown = await fetchOrder();
if (isOrder(data)) {
  // TypeScript knows data is Order here
  console.log(data.order_number);
}
```

## API Response Format

### Consistent Response Structure

**Success**:
```typescript
{
  success: true,
  data: T,
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp?: string;
    requestId?: string;
  }
}
```

**Error**:
```typescript
{
  success: false,
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  }
}
```

### API Client Pattern

```typescript
// lib/api.ts
class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: 'Request failed',
        }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
}
```

## File Organization

### Directory Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── order/          # Order-related components
│   ├── customer/       # Customer-related components
│   └── shared/         # Shared components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
├── contexts/           # React contexts
├── pages/              # Page components
└── utils/              # General utilities
```

### Import Order

1. React imports
2. External libraries
3. Internal components
4. Internal hooks
5. Internal utilities
6. Types
7. Styles

### Import Aliases

```typescript
// ✅ Use path aliases
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/pricing';

// ❌ Avoid relative paths for deep imports
import { Button } from '../../../components/ui/button';
```

## Code Quality Standards

### Function Length

- **Maximum**: 50 lines
- **Preferred**: 20-30 lines
- **Split** if function does multiple things

### Component Complexity

- **Maximum**: 200 lines
- **Preferred**: 100-150 lines
- **Split** into smaller components if needed

### Nested Conditionals

```typescript
// ✅ Early returns
if (!user) return null;
if (!order) return <EmptyState />;

// ❌ Deep nesting
if (user) {
  if (order) {
    if (order.status === 'ready') {
      // ...
    }
  }
}
```

### Comments

```typescript
// ✅ Good comments
/**
 * Calculates the total price including taxes and fees
 * @param items - Array of order items
 * @param taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @returns Total price in cents
 */
function calculateTotal(items: Item[], taxRate: number): number {
  // ...
}

// ❌ Obvious comments
// Set isLoading to true
setIsLoading(true);
```

## Testing Patterns

### Component Tests

```typescript
describe('OrderCard', () => {
  it('renders order information', () => {
    const order = createMockOrder();
    render(<OrderCard order={order} />);
    expect(screen.getByText(order.order_number)).toBeInTheDocument();
  });
});
```

### API Tests

```typescript
describe('GET /orders/:id', () => {
  it('returns order when found', async () => {
    const order = await createTestOrder();
    const response = await request(app)
      .get(`/api/orders/${order.id}`)
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(order.id);
  });
});
```

## Consistency Checklist

- [x] Components use PascalCase
- [x] Hooks use camelCase with 'use' prefix
- [x] Utilities use camelCase
- [x] Constants use UPPER_SNAKE_CASE
- [x] Types use PascalCase
- [x] No 'any' types (use 'unknown' if needed)
- [x] Consistent error handling
- [x] Consistent API response format
- [x] Consistent import order
- [x] Consistent file organization
- [x] Consistent component structure
- [x] Consistent naming patterns

## Enforcement

### ESLint Rules

```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "variableLike",
        "format": ["camelCase", "PascalCase", "UPPER_CASE"]
      }
    ]
  }
}
```

### Prettier Configuration

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

## Review Process

Before merging code:

1. ✅ Follows naming conventions
2. ✅ No 'any' types
3. ✅ Consistent error handling
4. ✅ Proper TypeScript types
5. ✅ Consistent component structure
6. ✅ No console.logs in production code
7. ✅ Proper error messages
8. ✅ Accessible (ARIA labels, keyboard navigation)
9. ✅ Responsive design
10. ✅ Performance optimized
