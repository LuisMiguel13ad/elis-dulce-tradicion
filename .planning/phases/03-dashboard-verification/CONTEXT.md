# Phase 3: Dashboard Verification - Context

**Created:** 2026-02-01
**Purpose:** Pre-planning decisions from gray area discussion

## Decisions Made

### 1. BakerStation Page
**Decision:** Remove the page
**Rationale:** Front Desk already handles baker needs; separate baker view is redundant
**Files to Remove:**
- `src/pages/BakerStation.tsx`
- `src/components/kitchen/BakerTicketCard.tsx` (if only used by BakerStation)

### 2. Unused Layout Components
**Decision:** Delete unused files
**Rationale:** Clean dead code that's not imported anywhere
**Files to Remove:**
- `src/components/dashboard/DashboardLayout.tsx`
- `src/components/dashboard/FrontDeskLayout.tsx`

### 3. MenuManager & InventoryManager
**Decision:** Integrate into Owner Dashboard
**Rationale:** Make these functional components accessible as new tabs
**Implementation:**
- Add "Products" tab to Owner Dashboard → uses MenuManager
- Add "Inventory" tab to Owner Dashboard → uses InventoryManager
- Wire up to sidebar navigation in OwnerSidebar

### 4. Dev/Test Components
**Decision:** Remove for production
**Rationale:** Clean production code without test utilities
**Files to Remove:**
- `src/components/dev/` folder (DevTools.tsx and any other files)
- Test data buttons in DashboardHeader
- References to test-orders utility where only used for dev

## Phase 3 Scope Adjustment

Based on these decisions, Phase 3 now includes:

**Removals (Dead Code Cleanup):**
- BakerStation page
- Unused layout wrappers
- Dev components and test data buttons

**Additions (New Functionality):**
- Products tab in Owner Dashboard (using existing MenuManager)
- Inventory tab in Owner Dashboard (using existing InventoryManager)

**Verifications (Original Requirements):**
- DASH-01: Owner Dashboard analytics display correctly
- DASH-02: Front Desk Dashboard order queue works properly
- DASH-03: Both dashboards receive orders in real-time
- DASH-04: Remove unnecessary/unused components (expanded with above decisions)
- DASH-05: Owner Dashboard has analytics-focused interface

---
*Context recorded: 2026-02-01*
