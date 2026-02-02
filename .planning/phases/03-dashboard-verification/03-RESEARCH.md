# Phase 3: Dashboard Verification - Research

**Researched:** 2026-02-01
**Domain:** React Dashboard Cleanup, Analytics Verification, Real-time Testing
**Confidence:** HIGH

## Summary

Phase 3 focuses on verifying dashboard functionality, integrating existing components, and cleaning dead code. The research investigated React dashboard verification strategies, dead code detection tools, real-time order testing patterns, and chart verification approaches.

The existing codebase uses React 18.3, TypeScript 5.8, Recharts 2.15 for analytics, Supabase real-time subscriptions, and shadcn/ui (Radix UI + Tailwind). The Owner Dashboard already has working analytics (revenue metrics, line charts, pie charts) and the Front Desk uses real-time hooks (`useRealtimeOrders`, `useOrdersFeed`) for live order updates.

Based on the CONTEXT decisions, the phase includes removing BakerStation page and unused layouts, removing dev components, and integrating MenuManager and InventoryManager as new tabs in the Owner Dashboard. The research confirms these are straightforward operations using existing patterns.

**Primary recommendation:** Use manual verification checklist for dashboard functionality, employ `knip` or `ts-prune` for dead code detection, verify real-time updates with simulated order events, and integrate components as new tabs using the existing Tabs pattern with OwnerSidebar.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.3.1 | UI framework | Industry standard, hooks-based architecture |
| TypeScript | 5.8.3 | Type safety | Prevents runtime errors, better refactoring |
| Recharts | 2.15.4 | Analytics charts | Declarative, React-native charting, excellent TypeScript support |
| Supabase JS | 2.78.0 | Real-time backend | PostgreSQL + real-time subscriptions, built-in RLS |
| @radix-ui/react-tabs | 1.1.12 | Tab components | Accessible primitives, used by shadcn/ui |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| knip | Latest | Dead code detection | Comprehensive unused code/dependency finder (2023+ recommended tool) |
| ts-prune | Latest | Export analysis | Alternative dead code finder, simpler than knip |
| date-fns | 3.6.0 | Date formatting | Already in project, used for chart date labels |
| sonner | 1.7.4 | Toast notifications | Already in project, used for user feedback |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recharts | Chart.js | Recharts is more React-native, better TypeScript support |
| Manual testing | Playwright/Cypress | Automated tests add complexity, manual sufficient for verification phase |
| knip | ts-unused-exports | knip is more comprehensive, finds unused dependencies too |

**Installation:**
```bash
# Dead code detection (dev dependency, not for runtime)
npm install -D knip

# Or use ts-prune as simpler alternative
npm install -D ts-prune
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── pages/                    # Page-level components
│   ├── OwnerDashboard.tsx   # Main owner view with tabs
│   └── FrontDesk.tsx        # Front desk order queue
├── components/
│   ├── dashboard/           # Dashboard-specific components
│   │   ├── OwnerSidebar.tsx        # Navigation tabs
│   │   ├── DashboardHeader.tsx     # Header with controls
│   │   ├── MenuManager.tsx         # Product management (integrate as tab)
│   │   ├── InventoryManager.tsx    # Inventory (integrate as tab)
│   │   └── OwnerCalendar.tsx       # Calendar view
│   ├── kitchen/             # Front desk components
│   └── ui/                  # shadcn/ui primitives
├── hooks/
│   ├── useRealtimeOrders.ts # Supabase real-time subscription
│   └── useOrdersFeed.ts     # Order feed with real-time updates
└── lib/
    ├── api.ts               # API functions
    └── analytics.ts         # Analytics computation
```

### Pattern 1: Tab-Based Dashboard Navigation
**What:** Use Radix UI Tabs with controlled state to switch between dashboard views without routing
**When to use:** When all views share the same header/sidebar and don't need separate URLs
**Example:**
```typescript
// Source: Existing OwnerDashboard.tsx pattern
const [activeTab, setActiveTab] = useState('overview');

// In OwnerSidebar, pass activeTab to highlight active menu item
<OwnerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

// In main content, use Tabs component
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsContent value="overview">
    {/* Overview content */}
  </TabsContent>
  <TabsContent value="products">
    <MenuManager />
  </TabsContent>
  <TabsContent value="inventory">
    <InventoryManager />
  </TabsContent>
</Tabs>
```

### Pattern 2: Real-time Order Updates Hook
**What:** Custom hook that subscribes to Supabase real-time channel and manages order state
**When to use:** Any component that needs live order updates (Owner Dashboard, Front Desk)
**Example:**
```typescript
// Source: Existing useRealtimeOrders.ts
useRealtimeOrders({
  filterByUserId: false, // false = see all orders (admin/owner)
  onOrderInsert: (order) => {
    toast.info('New Order Received! 🔔');
    refreshOrders(); // Reload dashboard data
  },
  onOrderUpdate: () => refreshOrders(),
  onOrderDelete: () => refreshOrders(),
});
```

### Pattern 3: Analytics Computation Pattern
**What:** Compute metrics locally from raw order data, avoid API calls for derived metrics
**When to use:** When displaying multiple calculated metrics from same dataset
**Example:**
```typescript
// Source: Existing OwnerDashboard.tsx computeMetrics function
const computeMetrics = (orders: Order[]) => {
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const ordersToday = orders.filter(o => o.created_at?.startsWith(todayStr));

  // Single pass through data for multiple metrics
  const revenueToday = ordersToday.reduce((sum, o) =>
    sum + (Number(o.total_amount) || 0), 0);

  setMetrics({
    todayOrders: ordersToday.length,
    todayRevenue: revenueToday,
    averageOrderValue: ordersToday.length > 0 ?
      revenueToday / ordersToday.length : 0,
  });
};
```

### Pattern 4: Recharts Responsive Chart
**What:** Use ResponsiveContainer to make charts adapt to container width
**When to use:** Always, for responsive dashboards
**Example:**
```typescript
// Source: Existing OwnerDashboard.tsx chart pattern
<ResponsiveContainer width="100%" height="100%">
  <LineChart data={revenueData}>
    <CartesianGrid strokeDasharray="3 3" vertical={false} />
    <XAxis dataKey="date" />
    <YAxis tickFormatter={(v) => `$${v}`} />
    <Tooltip />
    <Line
      type="monotone"
      dataKey="revenue"
      stroke="#C6A649"
      strokeWidth={3}
    />
  </LineChart>
</ResponsiveContainer>
```

### Anti-Patterns to Avoid
- **Ghost API calls for metrics:** Don't call backend to compute totals/averages that can be calculated from existing data
- **Multiple real-time subscriptions:** One subscription per component type (owner vs customer), not per order
- **Hardcoded chart dimensions:** Always use ResponsiveContainer, never fixed width/height
- **Ignoring unused exports:** Don't leave unused components that increase bundle size and maintenance burden

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dead code detection | Manual search through imports | `knip` or `ts-prune` | Tools traverse entire dependency graph, find unused exports, deps, types |
| Date formatting for charts | Custom date parsers | `date-fns` (already installed) | Handles timezones, locales, edge cases reliably |
| Real-time subscriptions | WebSocket polling | `useRealtimeOrders` hook (exists) | Already handles reconnection, debouncing, filtering |
| Chart responsiveness | Media queries per chart | `ResponsiveContainer` | Recharts built-in, handles resize events automatically |
| Tab navigation state | Custom useState + props drilling | Radix UI Tabs `value` prop | Handles keyboard nav, ARIA, focus management |
| Order metric calculations | Backend endpoints | Local computation (existing pattern) | Reduces API calls, instant updates, works with real-time data |

**Key insight:** The project already has robust patterns for analytics, real-time updates, and component composition. Don't rebuild these - extend them. New functionality should follow existing patterns (add tabs, use existing hooks, compute metrics locally).

## Common Pitfalls

### Pitfall 1: Deleting Files That Appear Unused But Are Route Targets
**What goes wrong:** Pages like BakerStation.tsx might be referenced in routing config even if not imported elsewhere
**Why it happens:** Routes are often configured in separate files (App.tsx, router config) using string paths
**How to avoid:** Check route definitions before deleting page components; grep for component name strings
**Warning signs:** 404 errors after deployment, routes that worked before now broken

### Pitfall 2: Breaking Real-time Updates During Refactoring
**What goes wrong:** Real-time subscription stops working after code cleanup, new orders don't appear
**Why it happens:** `useRealtimeOrders` depends on callback functions; if dependencies change, subscription restarts
**How to avoid:**
- Don't change callback function references unnecessarily (use `useCallback`)
- Test real-time updates after any cleanup near hooks
- Verify `isConnected` status in component
**Warning signs:** Orders don't appear until page refresh, `isConnected` is false

### Pitfall 3: Chart Data Format Mismatches
**What goes wrong:** Charts render blank or show errors after data structure changes
**Why it happens:** Recharts expects specific data key names; changing order structure breaks `dataKey` references
**How to avoid:**
- Keep data transformation separate from chart rendering
- Test charts with empty data array
- Verify `dataKey` props match actual object keys
**Warning signs:** Console errors about missing properties, charts show but no data points

### Pitfall 4: False Positives in Dead Code Detection
**What goes wrong:** Tool reports exports as unused when they're actually used
**Why it happens:** Some exports are used by external configs, tests, or dynamic imports
**How to avoid:**
- Configure `knip` to ignore test files, config files
- Check if "unused" exports are actually React component props interfaces (often OK to keep)
- Verify imports in non-TS files (JSX, config.js)
**Warning signs:** Tool reports many "unused" exports in known-active components

### Pitfall 5: Tab Integration Breaking Existing Component Props
**What goes wrong:** MenuManager or InventoryManager breaks when moved into tab content
**Why it happens:** Components may rely on specific layout context, URL params, or parent props
**How to avoid:**
- Test each integrated component in isolation first
- Check for dependencies on `useParams`, `useLocation`, or layout-specific contexts
- Verify API calls still work (may need different base URLs)
**Warning signs:** Component renders but doesn't load data, errors about missing context

### Pitfall 6: Removing Dev Tools That Have Production Side Effects
**What goes wrong:** Removing DevTools.tsx breaks something in production
**Why it happens:** Dev component might have registered global event listeners or modified shared state
**How to avoid:**
- Check for `window.dispatchEvent`, global variable assignments
- Verify component only renders when `import.meta.env.DEV` is true
- Test production build after removal
**Warning signs:** Production behaves differently than dev, missing global functions

## Code Examples

Verified patterns from existing codebase:

### Adding New Tab to Owner Dashboard

```typescript
// 1. Update OwnerSidebar.tsx - Add menu item
const menuItems = [
  { id: 'overview', label: t('Resumen', 'Overview'), icon: LayoutDashboard },
  { id: 'orders', label: t('Pedidos', 'Orders'), icon: ShoppingBag },
  { id: 'calendar', label: t('Calendario', 'Calendar'), icon: Calendar },
  { id: 'products', label: t('Productos', 'Products'), icon: Package }, // NEW
  { id: 'inventory', label: t('Inventario', 'Inventory'), icon: Package }, // NEW
  { id: 'reports', label: t('Reportes', 'Reports'), icon: FileText },
];

// 2. Update OwnerDashboard.tsx - Import component
import MenuManager from '@/components/dashboard/MenuManager';

// 3. Add TabsContent in Tabs block
<TabsContent value="products">
  <MenuManager />
</TabsContent>
```

### Testing Real-time Order Updates

```typescript
// Manual test procedure:
// 1. Open Owner Dashboard in one browser tab
// 2. Open Front Desk in another tab (or use API client)
// 3. Create new order via Front Desk
// 4. Verify within 5 seconds:
//    - Owner Dashboard shows toast notification
//    - New order appears in "Recent Orders" section
//    - Metrics update (Revenue Today, Orders Today)
//    - Status pie chart updates

// Automated verification in hook:
useRealtimeOrders({
  onOrderInsert: (order) => {
    console.log('✅ Real-time insert received:', order.order_number);
    // Should trigger within 5 seconds of order creation
  }
});
```

### Verifying Chart Data Rendering

```typescript
// 1. Check chart receives data
console.log('Revenue data for chart:', revenueData);
// Should be array of { date: string, revenue: number }

// 2. Verify ResponsiveContainer renders
<ResponsiveContainer width="100%" height="100%">
  {/* Parent must have explicit height */}
</ResponsiveContainer>

// 3. Test with empty data
setRevenueData([]); // Should show empty chart, not error

// 4. Test with single data point
setRevenueData([{ date: '2026-02-01', revenue: 150 }]);
// Should render one point on line

// 5. Verify tooltip on hover
// Hover over data point, should show formatted tooltip
```

### Running Dead Code Detection

```bash
# Using knip (comprehensive)
npx knip

# Expected output shows unused exports, files, dependencies
# Example output:
# Unused exports (3)
#   src/components/dashboard/DashboardLayout.tsx: DashboardLayout
#   src/components/dashboard/FrontDeskLayout.tsx: FrontDeskLayout
# Unused files (2)
#   src/pages/BakerStation.tsx

# Using ts-prune (simpler)
npx ts-prune

# Review output for false positives before deleting
# Common false positives:
# - React component prop interfaces (OK to keep)
# - Export types used in tests (verify in test files)
```

### Verifying Metrics Computation

```typescript
// Test metrics calculation with known data
const testOrders = [
  { id: 1, created_at: '2026-02-01T10:00:00', total_amount: 50, status: 'pending' },
  { id: 2, created_at: '2026-02-01T11:00:00', total_amount: 75, status: 'ready' },
  { id: 3, created_at: '2026-01-31T10:00:00', total_amount: 100, status: 'delivered' }
];

computeMetrics(testOrders);

// Expected results:
// todayOrders: 2 (only orders from 2026-02-01)
// todayRevenue: 125 (50 + 75)
// averageOrderValue: 62.5 (125 / 2)
// pendingOrders: 1 (only id:1 is pending)

// Verify in UI:
// - "Revenue Today" card shows $125
// - "Orders Today" card shows 2
// - "Avg Ticket" card shows $62.50
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Separate baker dashboard | Single Front Desk for all kitchen staff | User decision (Phase 3) | Simplifies auth, reduces duplicate code |
| Multiple layout wrappers | Direct component composition | Phase 3 cleanup | Removes unnecessary abstractions |
| Ghost metrics API calls | Local computation from raw orders | Already implemented | Faster updates, works with real-time |
| Class components | Function components with hooks | React 16.8+ (2019) | Simpler state management, better composition |
| Manual dead code finding | Automated tools (knip, ts-prune) | 2020+ widespread adoption | Catches unused dependencies, exports, types |

**Deprecated/outdated:**
- `DashboardLayout.tsx`: Unused wrapper, direct composition preferred
- `FrontDeskLayout.tsx`: Unused wrapper, KitchenRedesignedLayout is the active pattern
- `BakerStation.tsx`: Redundant page, Front Desk serves all kitchen roles
- `DevTools.tsx`: Dev-only component, remove for production
- Test data buttons in DashboardHeader: Dev utilities, not for production

## Open Questions

Things that couldn't be fully resolved:

1. **Should MenuManager and InventoryManager be lazy loaded?**
   - What we know: Both components are moderately sized, use Dialog for modals
   - What's unclear: If Owner Dashboard initial load is slow, lazy loading could help
   - Recommendation: Test load time first; if >2s, add `React.lazy()` wrapping

2. **Do any backend routes depend on removed pages?**
   - What we know: BakerStation.tsx will be deleted
   - What's unclear: If backend serves data specifically to /baker-station route
   - Recommendation: Check backend routes, search for "baker" or "BakerStation" in API layer

3. **Are there any lingering references to test-orders utility?**
   - What we know: DevTools.tsx uses `test-orders` for seeding mock data
   - What's unclear: If other components import this utility
   - Recommendation: Run `grep -r "test-orders" src/` before removing DevTools

4. **Should real-time subscription use more aggressive retry logic?**
   - What we know: Current hook has basic reconnection with 1s delay
   - What's unclear: If bakery's network environment needs exponential backoff
   - Recommendation: Monitor production logs; if many "Connection timed out", add exponential backoff

## Sources

### Primary (HIGH confidence)
- Existing codebase files examined:
  - `/src/pages/OwnerDashboard.tsx` - Tab pattern, analytics computation, real-time integration
  - `/src/pages/FrontDesk.tsx` - Order queue filtering, real-time hooks usage
  - `/src/hooks/useRealtimeOrders.ts` - Supabase subscription implementation
  - `/src/hooks/useOrdersFeed.ts` - Order state management with real-time
  - `/src/components/dashboard/OwnerSidebar.tsx` - Navigation menu structure
  - `/src/components/dashboard/MenuManager.tsx` - Product management component (to integrate)
  - `/src/components/dashboard/InventoryManager.tsx` - Inventory component (to integrate)
  - `package.json` - Confirmed versions of all dependencies

### Secondary (MEDIUM confidence)
- [knip - Dead code detection tool](https://effectivetypescript.com/2023/07/29/knip/) - Recommended 2023+ tool for TypeScript dead code
- [ts-prune - Export analyzer](https://effectivetypescript.com/2020/10/20/tsprune/) - Finds unused exports in TypeScript
- [Recharts documentation](https://embeddable.com/blog/what-is-recharts) - React charting library guide
- [shadcn/ui Tabs component](https://ui.shadcn.com/docs/components/tabs) - Radix UI Tabs documentation
- [Radix UI Tabs primitives](https://www.radix-ui.com/primitives/docs/components/tabs) - Accessible tab components
- [React Dashboard Testing Guide](https://nastengraph.substack.com/p/the-complete-guide-to-dashboard-testing) - Dashboard verification strategies
- [Supabase React hooks](https://github.com/awkweb/react-supabase) - Real-time subscription patterns

### Tertiary (LOW confidence - marked for validation)
- [Manual testing checklist for React](https://www.uxpin.com/studio/blog/checklist-for-manual-testing-of-react-components/) - Component verification approaches
- [Clean Code TypeScript](https://github.com/labs42io/clean-code-typescript) - General best practices

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All versions confirmed from package.json, libraries in active use in codebase
- Architecture: HIGH - Patterns extracted directly from existing working code
- Pitfalls: MEDIUM - Based on common React/TypeScript issues, some specific to codebase structure
- Dead code tools: MEDIUM - Tools verified current, but not tested on this specific codebase
- Real-time testing: HIGH - Existing implementation examined, patterns confirmed

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (30 days - stable technologies, minor version updates expected)

**Notes:**
- This is a verification and cleanup phase, not new feature development
- Most patterns already exist and work - research confirms them as sound
- Main technical risk is breaking working real-time subscriptions during cleanup
- Dead code detection tools may have false positives - manual review required before deletion
- Tab integration should be straightforward using existing Tabs pattern
