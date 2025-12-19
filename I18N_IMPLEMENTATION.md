# Internationalization (i18n) Implementation Guide

## Overview

The internationalization system has been set up using i18next with React. The system supports English and Spanish languages with full localization support for dates, currency, and pluralization.

## What Has Been Completed

### 1. ✅ Package Installation
- Installed `i18next`, `react-i18next`, and `i18next-browser-languagedetector`

### 2. ✅ i18n Configuration
- Created `src/lib/i18n.ts` with full i18next configuration
- Configured language detection from localStorage and browser
- Set Spanish as default language with English fallback

### 3. ✅ Translation Files
- Created comprehensive translation files:
  - `src/locales/en/translation.json` (English)
  - `src/locales/es/translation.json` (Spanish)
- Organized translations by namespace:
  - `common`: Shared strings (loading, save, cancel, etc.)
  - `navigation`: Menu items and navigation
  - `home`: Homepage content
  - `order`: Order form labels and messages
  - `status`: Order status labels
  - `payment`: Payment screen text
  - `validation`: Validation messages
  - `errors`: Error messages
  - `dashboard`: Admin dashboard labels
  - `auth`: Authentication strings
  - `gallery`, `menu`, `faq`, `about`, `privacy`, `terms`, `notFound`

### 4. ✅ LanguageContext Update
- Updated `src/contexts/LanguageContext.tsx` to use i18next
- Maintains backward compatibility with existing `t()` function signature
- Automatically updates document `lang` attribute
- Includes RTL support preparation (isRTL flag)

### 5. ✅ Language Toggle
- Updated `src/components/LanguageToggle.tsx` to use i18next
- Language preference persists to localStorage automatically
- Document language attribute updates automatically

### 6. ✅ Utility Functions
- Created `src/lib/i18n-utils.ts` with:
  - `formatDate()`: Locale-aware date formatting (MM/DD/YYYY for en, DD/MM/YYYY for es)
  - `formatTime()`: 12hr format for English, 24hr for Spanish
  - `formatCurrency()`: Locale-aware currency formatting using Intl.NumberFormat
  - `formatNumber()`: Locale-aware number formatting

### 7. ✅ Database Migration
- Created `backend/db/add-preferred-language-to-profiles.sql`
- Adds `preferred_language` column to profiles table
- Defaults to 'es' (Spanish)

### 8. ✅ Main Entry Point
- Updated `src/main.tsx` to initialize i18n before app renders

## How to Use

### Basic Translation

Replace old pattern:
```tsx
{t('Spanish text', 'English text')}
```

With new pattern:
```tsx
{t('namespace.key')}
```

Example:
```tsx
// Old
{t('Inicio', 'Home')}

// New
{t('navigation.home')}
```

### Using Translation Keys

```tsx
import { useLanguage } from '@/contexts/LanguageContext';

const MyComponent = () => {
  const { t, language } = useLanguage();
  
  return (
    <div>
      <h1>{t('home.orderNow')}</h1>
      <p>{t('common.loading')}</p>
    </div>
  );
};
```

### Date Formatting

```tsx
import { formatDate, formatTime } from '@/lib/i18n-utils';
import { useLanguage } from '@/contexts/LanguageContext';

const MyComponent = () => {
  const { language } = useLanguage();
  const date = new Date();
  
  return (
    <div>
      <p>Date: {formatDate(date, undefined, language)}</p>
      <p>Time: {formatTime(date, language)}</p>
    </div>
  );
};
```

### Currency Formatting

```tsx
import { formatCurrency } from '@/lib/i18n-utils';
import { useLanguage } from '@/contexts/LanguageContext';

const MyComponent = () => {
  const { language } = useLanguage();
  const price = 45.99;
  
  return <p>Price: {formatCurrency(price, language)}</p>;
};
```

### Pluralization

i18next supports pluralization automatically:

```json
{
  "order": {
    "orderCount_one": "{{count}} order",
    "orderCount_other": "{{count}} orders"
  }
}
```

```tsx
{t('order.orderCount', { count: 1 })}
// English: "1 order"
// Spanish: "1 pedido"

{t('order.orderCount', { count: 5 })}
// English: "5 orders"
// Spanish: "5 pedidos"
```

### Complex Strings with HTML (Trans Component)

For strings with HTML, use the `Trans` component:

```tsx
import { Trans } from 'react-i18next';

<Trans
  i18nKey="home.aboutDescription"
  components={{
    strong: <strong />,
    br: <br />
  }}
/>
```

## Migration Guide for Components

### Step 1: Update Imports
No changes needed - `useLanguage` hook still works the same way.

### Step 2: Replace Translation Calls

**Before:**
```tsx
{t('Spanish text', 'English text')}
```

**After:**
```tsx
{t('namespace.key')}
```

### Step 3: Update Component Files

Example - Footer.tsx:
```tsx
// Before
{t('Tradición familiar desde 1995. Sabores que celebran la vida.', 'Family tradition since 1995. Flavors that celebrate life.')}

// After
{t('home.familyTradition')}
```

## Components That Need Updating

The following components still use the old translation pattern and should be updated:

1. `src/components/Footer.tsx` - Partially updated
2. `src/components/home/FeaturedProducts.tsx`
3. `src/components/home/AboutSection.tsx`
4. `src/components/home/LocationSection.tsx`
5. `src/pages/Order.tsx` - Large file with many translations
6. `src/pages/PaymentCheckout.tsx`
7. `src/components/order/OrderStatusTracker.tsx`
8. `src/pages/Gallery.tsx`
9. `src/pages/Menu.tsx`
10. `src/pages/FAQ.tsx`
11. `src/pages/About.tsx`
12. `src/pages/Privacy.tsx`
13. `src/pages/Terms.tsx`
14. `src/pages/NotFound.tsx`
15. All dashboard components
16. All auth components (Login, Signup)

## Database Migration

Run the migration to add `preferred_language` to profiles:

```sql
-- Run in Supabase SQL Editor
\i backend/db/add-preferred-language-to-profiles.sql
```

Or manually:
```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'es';

CREATE INDEX IF NOT EXISTS idx_profiles_preferred_language 
ON public.profiles(preferred_language);
```

## Language Detection & Persistence

- Language preference is automatically saved to `localStorage` (key: `i18nextLng`)
- Browser language is detected on first visit
- User selection persists across sessions
- Document `lang` attribute updates automatically

## RTL Support (Future)

The system is prepared for RTL languages (e.g., Arabic):
- `isRTL` flag available in LanguageContext
- Document `dir` attribute updates automatically
- CSS logical properties should be used where possible

## Testing

1. Test language switching - should persist across page refreshes
2. Test date formatting - should match locale (MM/DD vs DD/MM)
3. Test time formatting - 12hr vs 24hr
4. Test currency formatting - should use locale-specific format
5. Test document lang attribute - should update when language changes

## Next Steps

1. Update remaining components to use new translation keys
2. Add customer language preference sync with database
3. Update email templates to use customer language preference
4. Add more translation keys as needed
5. Consider adding translation management tool (e.g., i18next-parser)

## Notes

- All existing `t()` calls will continue to work during migration
- Translation keys use dot notation (e.g., `navigation.home`)
- Missing translation keys will show the key name (helpful for debugging)
- Default language is Spanish (`es`)
- Fallback language is English (`en`)
