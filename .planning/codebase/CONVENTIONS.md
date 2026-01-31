# Coding Conventions

**Analysis Date:** 2026-01-30

## Naming Patterns

**Files:**
- React components: PascalCase (e.g., `OrderProgress.tsx`, `FilterPanel.tsx`)
- Custom hooks: camelCase with `use` prefix (e.g., `useShare.ts`, `useAuth.ts`)
- Utility functions: camelCase (e.g., `printTicket.ts`, `imageCleanup.ts`)
- Type definitions: PascalCase for types/interfaces (e.g., `OrderStatus`, `UserRole`)
- Config files: kebab-case or camelCase (e.g., `vitest.config.ts`, `eslint.config.js`)

**Functions:**
- Exported functions: camelCase (e.g., `validateOrderDateTime`, `formatHoursUntilEvent`, `createMockOrder`)
- Event handlers in components: camelCase prefixed with `handle` (e.g., `handleSubmit`, `handleQuickFilter`, `handleSavePreset`)
- Internal utilities: camelCase (e.g., `shareOrder`, `isSupported`)

**Variables:**
- State variables: camelCase (e.g., `isOpen`, `formData`, `isLoading`, `currentStep`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE`, `QUICK_FILTERS`, `MOCK_PRODUCTS`)
- Boolean flags: prefixed with `is` or `has` (e.g., `isAuthenticated`, `hasRole`, `isSpanish`)
- Object literals containing translations: camelCase with descriptive keys (e.g., `labelES`, `labelEN`)

**Types:**
- Types: PascalCase (e.g., `Order`, `UserRole`, `OrderStatus`)
- Interfaces: PascalCase (e.g., `AuthContextType`, `OrderProgressProps`, `FilterPanelProps`)
- Props interfaces: Component name + `Props` suffix (e.g., `OrderProgressProps`, `FilterPanelProps`)
- Union types: PascalCase (e.g., `OrderStatus`, `DeliveryOption`)

## Code Style

**Formatting:**
- No explicit formatter configured (Prettier not detected)
- Code style inferred from existing files:
  - Import statements use double quotes for module names
  - Component attributes use double quotes
  - String literals use single quotes in most cases
  - Consistent spacing around operators
  - Semicolons used consistently

**Linting:**
- Tool: ESLint with TypeScript support (v9.32.0)
- Config: `eslint.config.js` using flat config format
- Key rules:
  - `react-hooks/recommended` enforced
  - `react-refresh/only-export-components` set to warn
  - `@typescript-eslint/no-unused-vars` disabled (enforced at runtime)
- TypeScript config (`tsconfig.app.json`):
  - `strict: false` - allows flexible type checking
  - `noUnusedLocals: false`, `noUnusedParameters: false` - unused vars not enforced
  - `noImplicitAny: false` - allows implicit any types
  - Path alias: `@/*` maps to `./src/*`

## Import Organization

**Order:**
1. React and React ecosystem imports (react, react-router-dom, react-hook-form)
2. Third-party libraries (@tanstack, @radix-ui, next-themes, sonner, framer-motion, etc.)
3. Type imports (import type X from Y)
4. Local context/provider imports (@/contexts/*)
5. Local component imports (@/components/*)
6. Local hook imports (@/hooks/*, @/lib/hooks/*)
7. Local utility imports (@/lib/*, @/utils/*)
8. Local type imports (when mixed with values)
9. Inline styles/CSS imports (last)

**Example from codebase:**
```typescript
// App.tsx pattern
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import ScrollToTop from "@/components/ScrollToTop";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
```

**Path Aliases:**
- `@/*` - maps to `./src/*` for clean, absolute-style imports
- Used throughout codebase for contexts, components, types, hooks, lib, utils

## Error Handling

**Patterns:**
- Try-catch blocks with error instance checking:
  ```typescript
  try {
    // operation
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return { success: false, error: message };
  }
  ```
- Graceful fallbacks in auth loading (3s timeout for profile fetch)
- Promise.race() used for timeout patterns:
  ```typescript
  const timeoutPromise = new Promise<{ timeout: true }>((resolve) => {
    setTimeout(() => resolve({ timeout: true }), 3000);
  });
  const result = await Promise.race([profilePromise, timeoutPromise]);
  ```
- Silent cleanup failures (e.g., image cleanup doesn't block operations)
- Return objects with success/error flags for operation results:
  ```typescript
  return { success: true, error?: string, role?: UserRole };
  ```

**Console Usage:**
- `console.error()` - for actual errors with context
- `console.warn()` - for timeout/fallback scenarios
- `console.log()` - for test data seeding, explicitly commented implementations
- Errors generally logged before returning error state to UI

## Logging

**Framework:** console object (browser native)

**Patterns:**
- Auth errors logged with context: `console.error('Error loading user profile:', error)`
- Async operation failures with context: `console.error('Error cancelling order:', error)`
- Test/debug information: `console.log()` for seeding scripts
- Soft failures (cleanup) logged but not thrown: errors allow operation to continue
- No centralized logging service detected

## Comments

**When to Comment:**
- Functions with complex logic (e.g., timeout patterns, Promise.race usage)
- Component purpose documented at top (JSDoc style):
  ```typescript
  /**
   * Filter Panel Component
   * Collapsible filter panel with quick filters and preset saving
   */
  ```
- Implementation status clarifications for disabled code:
  ```typescript
  // Implementation disabled to support new PrintPreviewModal
  // If you need the old logic, check git history.
  ```
- Non-obvious algorithmic steps (e.g., hours calculation)
- TODOs and FIXMEs not found in codebase

**JSDoc/TSDoc:**
- Minimal use, but observed in utility functions
- Function descriptions: single-line JSDoc before function
- Parameter descriptions: not commonly used (types are self-documenting)
- Example:
  ```typescript
  /**
   * Hook for Web Share API
   */
  export function useShare() { ... }

  /**
   * Validates that the order date/time is more than 24 hours in the future
   */
  export function validateOrderDateTime(...) { ... }
  ```

## Function Design

**Size:**
- Small, focused functions preferred (50-100 lines typical)
- Larger components up to 974 lines observed (`Order.tsx`)
- Utility functions: 30-80 lines typical

**Parameters:**
- Destructured props interfaces for components
- Object parameters over multiple positional params (e.g., override object in factory functions)
- Default parameters used (e.g., `overrides = {}`)
- Type annotations required for all parameters (TypeScript strict enough)

**Return Values:**
- Components: JSX.Element or React.ReactElement
- Hooks: objects with named properties (e.g., `{ user, isLoading, signIn, signOut }`)
- Utilities: specific types or discriminated unions
- Operation results: objects with success/error flags:
  ```typescript
  { isValid: boolean; error?: string; hoursUntilEvent?: number }
  ```

## Module Design

**Exports:**
- Named exports for functions/components (avoid default exports in lib files)
- Default export for React page components (e.g., `export default App`)
- Context providers exported as named exports:
  ```typescript
  export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => { ... }
  export const useAuth = () => { ... }
  ```

**Barrel Files:**
- Not heavily used
- Type aggregation in `src/types/index.ts` for common types
- No component barrel files observed

**File Organization:**
- One main component per file (with small helpers)
- Context files pair provider with hook: `AuthContext.tsx` has both
- Test utilities grouped in `src/test/` directory
- Mock data in `src/test/mocks/` subdirectories by type

---

*Convention analysis: 2026-01-30*
