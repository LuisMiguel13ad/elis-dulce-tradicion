# Authentication Migration Guide

## Quick Reference: Old vs New

### Role Names
| Old | New | Notes |
|-----|-----|-------|
| `'staff'` | `'baker'` | Kitchen staff role |
| `'owner'` | `'owner'` | No change |
| N/A | `'customer'` | New default role |

### User Object Structure
```typescript
// OLD
interface User {
  role: 'owner' | 'staff' | null;
  name: string;
}

// NEW
interface AuthUser {
  id: string;
  email: string;
  profile: {
    id: string;
    role: 'customer' | 'baker' | 'owner';
    full_name: string | null;
    phone: string | null;
    // ...
  } | null;
}
```

### Authentication Methods
```typescript
// OLD
const { login, logout } = useAuth();
login('owner'); // Mock login
logout();

// NEW
const { signIn, signUp, signOut } = useAuth();
await signIn(email, password);
await signUp(email, password, fullName, phone);
await signOut();
```

### Role Checking
```typescript
// OLD
if (user?.role === 'staff') { ... }
if (user?.role === 'owner') { ... }

// NEW
if (user?.profile?.role === 'baker') { ... }
if (user?.profile?.role === 'owner') { ... }
// Or use helper:
if (hasRole('baker')) { ... }
if (hasRole(['baker', 'owner'])) { ... }
```

### Route Protection
```typescript
// OLD
<Route path="/admin" element={<AdminPage />} />
// Manual auth check in component

// NEW
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRole="owner">
      <AdminPage />
    </ProtectedRoute>
  }
/>
```

## Files That Need Updates

If you have custom code, check these patterns:

1. **Role checks**: `user.role` → `user.profile?.role`
2. **Role values**: `'staff'` → `'baker'`
3. **Auth methods**: `login()` → `signIn()`
4. **Route guards**: Use `<ProtectedRoute>` component

## Testing After Migration

1. ✅ Sign up as customer
2. ✅ Sign in as customer
3. ✅ Sign in as baker (use seeded account)
4. ✅ Sign in as owner (use seeded account)
5. ✅ Verify protected routes work
6. ✅ Verify role-based redirects work

