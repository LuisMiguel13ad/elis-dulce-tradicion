# Order State Machine Implementation

Complete implementation of a robust state machine for order status transitions with validation, permissions, and side effects.

## ✅ Completed Features

### 1. State Machine Definition

**Frontend (`src/lib/orderStateMachine.ts`):**
- XState machine definition
- Type-safe state transitions
- Transition validation functions
- Permission checking
- Available transitions calculation

**Backend (`backend/lib/orderStateMachine.js`):**
- Validation logic
- Side effects determination
- Time metrics calculation
- Business rule enforcement

### 2. State Transition Rules

**Valid States:**
- `pending` - Order created, awaiting confirmation
- `confirmed` - Order confirmed, awaiting start
- `in_progress` - Order being prepared
- `ready` - Order ready for pickup/delivery
- `completed` - Order fulfilled
- `cancelled` - Order cancelled

**Transition Rules:**
- `pending → confirmed` (admin/baker only, requires payment)
- `confirmed → in_progress` (baker only)
- `in_progress → ready` (baker only)
- `ready → completed` (after pickup/delivery)
- `any → cancelled` (requires reason)
- Cannot go backwards (except admin override)

### 3. Role-Based Permissions

- **Customers**: Can only cancel (before in_progress)
- **Bakers**: Can move through workflow states
- **Owners/Admins**: Can override any transition

### 4. Backend Integration

**New Routes (`backend/routes/orderTransitions.js`):**
- `GET /api/v1/orders/:id/available-transitions` - Get valid next states
- `POST /api/v1/orders/:id/transition` - Execute state transition
- `GET /api/v1/orders/:id/transition-history` - Get full transition history

**Updated Routes:**
- Existing `PATCH /api/v1/orders/:id/status` still works for backward compatibility
- New transition endpoint provides validation and side effects

### 5. Side Effects

**Email Notifications:**
- `pending → confirmed`: Order confirmation email
- `confirmed → in_progress`: Order started notification
- `in_progress → ready`: Ready notification
- `ready → completed`: Completion email with review request
- `any → cancelled`: Cancellation email

**Webhooks:**
- `in_progress → ready`: Triggers Make.com webhook

**Other:**
- `ready → completed`: Updates customer stats (total_orders)
- `any → cancelled`: Processes refund if applicable

### 6. Database Schema

**New Columns (`backend/db/migrations/add-order-state-machine-columns.sql`):**
- `orders.time_to_confirm` (INTEGER) - Minutes from creation to confirmation
- `orders.time_to_ready` (INTEGER) - Minutes from confirmation to ready
- `orders.time_to_complete` (INTEGER) - Minutes from ready to completed
- `order_status_history.previous_status` (VARCHAR) - Previous state
- `order_status_history.metadata` (JSONB) - Transition context

### 7. UI Components

**OrderStatusFlow Component (`src/components/order/OrderStatusFlow.tsx`):**
- Visual progress stepper
- Shows current state
- Displays available transitions as action buttons
- Shows transition history timeline
- Color-coded status indicators
- Disabled invalid transitions

### 8. Scheduled State Transitions

**Background Jobs (`backend/jobs/orderStateScheduler.js`):**
- Auto-complete orders 24 hours after ready (hourly)
- Auto-cancel unpaid orders after 30 minutes (every 5 minutes)
- Send reminder if order confirmed but not started after 12 hours (every 6 hours)

### 9. Business Logic Constraints

- Cannot edit order details after `in_progress`
- Cannot cancel after `ready` without admin approval
- Payment must be complete before confirming
- Must have `ready_at` timestamp before completing

### 10. API Client Methods

**New Methods (`src/lib/api.ts`):**
- `getAvailableTransitions(orderId)` - Get valid next states
- `transitionOrderStatus(orderId, targetStatus, reason?, metadata?)` - Execute transition
- `getTransitionHistory(orderId)` - Get full history

## 📁 File Structure

```
src/
├── lib/
│   ├── orderStateMachine.ts          # Frontend state machine
│   └── api.ts                        # API client (updated)
├── types/
│   └── orderState.ts                 # TypeScript types
└── components/
    └── order/
        └── OrderStatusFlow.tsx       # UI component

backend/
├── lib/
│   └── orderStateMachine.js          # Backend validation logic
├── routes/
│   └── orderTransitions.js           # Transition endpoints
├── jobs/
│   └── orderStateScheduler.js        # Scheduled transitions
└── db/
    └── migrations/
        └── add-order-state-machine-columns.sql
```

## 🔧 Usage Examples

### Frontend: Get Available Transitions

```typescript
import { api } from '@/lib/api';

const transitions = await api.getAvailableTransitions(orderId);
console.log(transitions.availableTransitions); // ['confirmed', 'cancelled']
```

### Frontend: Execute Transition

```typescript
import { api } from '@/lib/api';

const result = await api.transitionOrderStatus(
  orderId,
  'confirmed',
  undefined, // reason (optional)
  { source: 'dashboard' } // metadata (optional)
);
```

### Frontend: Using OrderStatusFlow Component

```tsx
import { OrderStatusFlow } from '@/components/order/OrderStatusFlow';

<OrderStatusFlow
  orderId={order.id}
  currentStatus={order.status}
  onStatusChange={(newStatus) => {
    // Handle status change
  }}
  showHistory={true}
  userRole="baker"
/>
```

### Backend: Direct Validation

```javascript
const { validateTransition } = require('../lib/orderStateMachine');

const validation = validateTransition(
  'pending',
  'confirmed',
  order,
  {
    orderId: order.id,
    userId: user.id,
    userRole: 'baker',
    reason: undefined,
  }
);

if (!validation.valid) {
  return res.status(400).json({ error: validation.error });
}
```

## 🧪 Testing

### Test Transition Validation

```typescript
import { validateTransition } from '@/lib/orderStateMachine';

// Should fail: customer cannot confirm
const result = validateTransition(
  'pending',
  'confirmed',
  order,
  { userRole: 'customer' }
);
expect(result.valid).toBe(false);

// Should pass: baker can confirm
const result2 = validateTransition(
  'pending',
  'confirmed',
  { ...order, payment_status: 'paid' },
  { userRole: 'baker' }
);
expect(result2.valid).toBe(true);
```

### Test Available Transitions

```typescript
import { getAvailableTransitions } from '@/lib/orderStateMachine';

const transitions = getAvailableTransitions(
  'pending',
  order,
  'baker'
);
expect(transitions).toContain('confirmed');
expect(transitions).toContain('cancelled');
```

## 📊 State Flow Diagram

```
pending → confirmed → in_progress → ready → completed
   ↓         ↓            ↓           ↓
cancelled cancelled   cancelled   cancelled
```

## 🔐 Permission Matrix

| From → To | Customer | Baker | Owner/Admin |
|-----------|----------|-------|------------|
| pending → confirmed | ❌ | ✅ | ✅ |
| confirmed → in_progress | ❌ | ✅ | ✅ |
| in_progress → ready | ❌ | ✅ | ✅ |
| ready → completed | ❌ | ✅ | ✅ |
| any → cancelled | ✅* | ✅ | ✅ |
| completed → ready | ❌ | ❌ | ✅** |

*Customers can only cancel before in_progress
**Admin override only

## 🚀 Next Steps

1. **Run Migration:**
   ```sql
   -- Execute backend/db/migrations/add-order-state-machine-columns.sql
   ```

2. **Update Existing Code:**
   - Replace direct status updates with transition API
   - Use `OrderStatusFlow` component in dashboards
   - Update email templates for new status transitions

3. **Configure Scheduled Jobs:**
   - Ensure cron jobs are running in production
   - Monitor job execution logs

4. **Testing:**
   - Test all transition scenarios
   - Verify side effects (emails, webhooks)
   - Test scheduled transitions
   - Load test with concurrent transitions

## 📝 Notes

- The state machine is backward compatible with existing status updates
- Scheduled jobs only run in non-test environments
- All transitions are logged in `order_status_history` with full context
- Time metrics are automatically calculated on transitions
- Side effects are executed asynchronously to not block API responses
