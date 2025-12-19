# Search, Filter, and Sort Implementation

Complete implementation of comprehensive search, filtering, and sorting across the application.

## ✅ Completed Features

### 1. Search Components

**SearchBar Component (`src/components/shared/SearchBar.tsx`):**
- Debounced input (300ms default, configurable)
- Clear button with X icon
- Search suggestions dropdown
- Recent searches (last 5, stored in localStorage)
- Keyboard navigation (arrow keys, enter, escape)
- Loading indicator
- "No results found" state

### 2. Filter Components

**OrderFilters Component (`src/components/order/OrderFilters.tsx`):**
- Multi-select status filter
- Multi-select payment status filter
- Delivery option radio buttons
- Date range filter (today, this week, this month, custom)
- Active filter count badge
- Removable filter chips
- "Clear all" button

**FilterPanel Component (`src/components/order/FilterPanel.tsx`):**
- Collapsible panel (drawer on mobile, sidebar on desktop)
- Quick filters for common views
- Save filter preset (localStorage)
- Grouped by category

### 3. Sort Controls

**SortControls Component (`src/components/order/SortControls.tsx`):**
- Sort by: date_needed, created_at, order_number, total_amount, customer_name
- Visual indicator (arrow icon) for active sort
- Persists preference in localStorage
- Dropdown menu interface

### 4. Backend Search Endpoint

**Route (`backend/routes/orderSearch.js`):**
- `GET /api/v1/orders/search` with query parameters:
  - `q` - Search query
  - `status` - Comma-separated statuses
  - `paymentStatus` - Comma-separated payment statuses
  - `deliveryOption` - pickup/delivery/all
  - `cakeSize` - Comma-separated sizes
  - `dateFrom` / `dateTo` - Date range
  - `dateNeededFilter` - Quick date filters
  - `sortField` / `sortDirection` - Sorting
  - `page` / `limit` - Pagination

**Features:**
- PostgreSQL full-text search with tsvector
- Multiple search strategies (exact, partial, fuzzy)
- Pagination with total count
- Highlighted search terms in results
- Combined filters with AND logic

### 5. Database Optimizations

**Migration (`backend/db/migrations/add-order-search-optimization.sql`):**
- `search_vector` tsvector column
- GIN index for full-text search
- Automatic trigger to maintain search_vector
- Indexes on commonly filtered columns:
  - `customer_name`
  - `cake_size`
  - `status`
  - `payment_status`
  - `delivery_option`
  - `date_needed`
  - `created_at`
  - `order_number`
  - `customer_phone`
  - `customer_email`
- Composite indexes for common filter combinations

### 6. URL State Management

**Hook (`src/hooks/useOrderSearch.ts`):**
- Syncs filters, search, and sorting to URL query params
- Parses URL on page load to restore state
- Bookmarkable filtered views
- Shareable URLs

**Example URL:**
```
/orders?q=john&status=pending,confirmed&sortField=date_needed&sortDirection=desc&page=1
```

### 7. Export Functionality

**ExportButton Component (`src/components/order/ExportButton.tsx`):**
- Exports filtered orders to CSV
- Includes all relevant columns
- Applies current filters and sorting
- Filename with timestamp
- Progress indicator

### 8. API Integration

**API Methods (`src/lib/api.ts`):**
- `searchOrders(params)` - Comprehensive search with all filters

## 📁 File Structure

```
src/
├── components/
│   ├── shared/
│   │   └── SearchBar.tsx              # Search input with suggestions
│   └── order/
│       ├── OrderFilters.tsx           # Filter controls
│       ├── FilterPanel.tsx            # Collapsible filter panel
│       ├── SortControls.tsx           # Sort dropdown
│       └── ExportButton.tsx           # CSV export
├── hooks/
│   └── useOrderSearch.ts              # Search hook with URL state
└── lib/
    └── api.ts                         # API client (updated)

backend/
├── routes/
│   └── orderSearch.js                 # Search endpoint
└── db/
    └── migrations/
        └── add-order-search-optimization.sql
```

## 🔧 Usage Examples

### Using SearchBar

```tsx
import { SearchBar } from '@/components/shared/SearchBar';

<SearchBar
  onSearch={(query) => {
    // Handle search
  }}
  placeholder="Search orders..."
  debounceMs={300}
  showRecentSearches={true}
/>
```

### Using OrderFilters

```tsx
import { OrderFilters } from '@/components/order/OrderFilters';

<OrderFilters
  filters={filters}
  onFiltersChange={(newFilters) => {
    setFilters(newFilters);
  }}
  onClearAll={() => setFilters({})}
/>
```

### Using useOrderSearch Hook

```tsx
import { useOrderSearch } from '@/hooks/useOrderSearch';

const {
  searchQuery,
  filters,
  sortConfig,
  data: orders,
  pagination,
  isLoading,
  handleSearch,
  handleFiltersChange,
  handleSortChange,
  handlePageChange,
} = useOrderSearch({
  defaultFilters: {},
  defaultSort: { field: 'created_at', direction: 'desc' },
  pageSize: 20,
});
```

### Backend Search Query

```javascript
// Example search request
GET /api/v1/orders/search?q=john&status=pending,confirmed&dateFrom=2024-01-01&sortField=date_needed&sortDirection=desc&page=1&limit=20
```

## 📊 Search Strategies

1. **Order Number**: Exact match (case-insensitive)
2. **Customer Name**: Fuzzy match using ILIKE
3. **Customer Phone**: Partial match
4. **Customer Email**: Partial match
5. **Dedication**: Full-text search
6. **Combined**: Searches across all fields simultaneously

## 🎯 Filter Options

### Status Filter
- Multi-select checkboxes
- Options: pending, confirmed, in_progress, ready, completed, cancelled

### Payment Status Filter
- Multi-select checkboxes
- Options: paid, pending, refunded, failed

### Delivery Option Filter
- Radio buttons
- Options: All, Pickup, Delivery

### Date Filter
- Quick filters: Today, This Week, This Month
- Custom date range picker

## 🔍 Performance Optimizations

1. **Database Indexes**: All commonly filtered columns indexed
2. **Full-Text Search**: GIN index on search_vector
3. **Pagination**: Cursor-based for large result sets
4. **Caching**: React Query with 30s stale time
5. **Debouncing**: 300ms delay on search input
6. **Selective Columns**: Only fetch necessary columns in list view

## 🚀 Next Steps

1. **Run Migration:**
   ```sql
   -- Execute: backend/db/migrations/add-order-search-optimization.sql
   ```

2. **Integrate into Dashboards:**
   - Add SearchBar, OrderFilters, SortControls to OwnerDashboard
   - Add SearchBar to CustomerDashboard (own orders only)
   - Add quick filters to KitchenDisplay

3. **Test Search:**
   - Test all search strategies
   - Test filter combinations
   - Test pagination
   - Test URL state management

4. **Optional Enhancements:**
   - Redis caching for common searches
   - Search analytics tracking
   - Virtualized lists for large result sets
   - Advanced search operators (AND, OR, NOT)

## 📝 Notes

- Search is case-insensitive
- Filters use AND logic (all must match)
- URL state is automatically synced
- Recent searches persist in localStorage
- Sort preferences persist in localStorage
- Export includes all visible/filtered orders
