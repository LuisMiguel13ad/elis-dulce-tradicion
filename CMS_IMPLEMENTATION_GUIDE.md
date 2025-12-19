# Business Configuration and Content Management System

## Overview

A comprehensive CMS system has been implemented for managing all business configuration and content without code changes. The system includes:

1. **Business Settings** - Name, logo, contact info, service area, order settings
2. **Business Hours** - Per-day hours management
3. **FAQs** - Admin CRUD for frequently asked questions
4. **Gallery** - Image upload and management with categories
5. **Announcements** - Site-wide announcement banners
6. **Content Pages** - Dynamic content for About, Contact, etc.
7. **Homepage Content** - Hero, featured products, testimonials, CTAs
8. **SEO Configuration** - Meta tags and structured data per page
9. **Footer Configuration** - Business info, links, social media

## Database Setup

### 1. Run the Schema Migration

```sql
-- Run this file in your Supabase SQL editor
\i backend/db/cms-schema.sql
```

### 2. Seed Initial Data

```sql
-- Run this file to populate with default data
\i backend/db/cms-seed-data.sql
```

## Admin Access

All CMS management is available in the **Owner Dashboard** under the **"Content"** tab:

1. Navigate to `/owner-dashboard`
2. Click the **"Content"** tab
3. Access sub-tabs:
   - **Settings** - Business configuration
   - **Hours** - Business hours management
   - **FAQs** - FAQ management
   - **Gallery** - Image gallery management
   - **Announcements** - Site-wide announcements

## Features

### Business Settings Manager

- Business name (English/Spanish)
- Tagline
- Logo URL
- Contact information (phone, email)
- Address (street, city, state, ZIP)
- Service area (radius or ZIP codes)
- Order settings (minimum lead time, maximum advance)
- About Us content

### Business Hours Manager

- Set hours for each day of the week
- Mark days as closed
- Set open/close times per day

### FAQ Manager

- Create, edit, delete FAQs
- Bilingual support (English/Spanish)
- Display order control
- Active/inactive toggle

### Gallery Manager

- Upload images (via Supabase Storage)
- Categorize images (birthday, wedding, custom, etc.)
- Add captions and descriptions (bilingual)
- Control display order
- Active/inactive toggle

### Announcement Manager

- Create site-wide announcements
- Types: info, warning, success, holiday
- Start/end dates
- Dismissible option
- Active/inactive toggle

## Frontend Integration

### Pages Using CMS Data

1. **FAQ Page** (`/faq`) - Uses FAQs from database
2. **Gallery Page** (`/gallery`) - Can be updated to use CMS gallery items
3. **About Page** (`/about`) - Can use content from `content_pages` table
4. **Footer** - Can be updated to use `footer_config` table

### Announcement Banner

The announcement banner automatically appears at the top of all pages when:
- An announcement is active
- Current date is within start/end date range
- User hasn't dismissed it (if dismissible)

### SEO Configuration

SEO config is stored per page path. To use:

```typescript
import { useSEOConfig } from '@/lib/hooks/useCMS';
import { useEffect } from 'react';

function MyPage() {
  const { data: seoConfig } = useSEOConfig('/my-page');
  
  useEffect(() => {
    if (seoConfig) {
      document.title = seoConfig.meta_title_en || 'Default Title';
      // Update meta tags, OG tags, etc.
    }
  }, [seoConfig]);
}
```

## API Functions

All CMS functions are in `src/lib/cms.ts`:

- `getBusinessSettings()` - Fetch business settings
- `getBusinessHours()` - Fetch business hours
- `getFAQs()` - Fetch active FAQs
- `getGalleryItems(category?)` - Fetch gallery items
- `getActiveAnnouncements()` - Fetch active announcements
- `getContentPage(slug)` - Fetch content page by slug
- `getHomepageContent()` - Fetch homepage sections
- `getSEOConfig(pagePath)` - Fetch SEO config
- `getFooterConfig()` - Fetch footer config

## React Hooks

Use React Query hooks from `src/lib/hooks/useCMS.ts`:

```typescript
import { 
  useBusinessSettings,
  useFAQs,
  useGalleryItems,
  useAnnouncements,
  // ... etc
} from '@/lib/hooks/useCMS';
```

## Next Steps

### 1. Update Gallery Page

Update `src/pages/Gallery.tsx` to use CMS data:

```typescript
import { useGalleryItems } from '@/lib/hooks/useCMS';

const Gallery = () => {
  const { data: items = [] } = useGalleryItems();
  // Use items instead of hardcoded images
};
```

### 2. Update Footer

Update `src/components/Footer.tsx` to use CMS data:

```typescript
import { useFooterConfig, useSocialMediaLinks, useBusinessSettings } from '@/lib/hooks/useCMS';

const Footer = () => {
  const { data: footerConfig } = useFooterConfig();
  const { data: socialLinks } = useSocialMediaLinks();
  const { data: settings } = useBusinessSettings();
  // Use CMS data instead of hardcoded values
};
```

### 3. Update About Page

Update `src/pages/About.tsx` to use content from CMS:

```typescript
import { useContentPage } from '@/lib/hooks/useCMS';

const About = () => {
  const { data: content } = useContentPage('about');
  // Use content.content_en/content_es instead of hardcoded text
};
```

### 4. Add SEO Component

Create `src/components/SEO.tsx`:

```typescript
import { useSEOConfig } from '@/lib/hooks/useCMS';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export function SEO() {
  const location = useLocation();
  const { data: seoConfig } = useSEOConfig(location.pathname);

  useEffect(() => {
    if (seoConfig) {
      document.title = seoConfig.meta_title_en || 'Default';
      // Update meta tags
    }
  }, [seoConfig]);

  return null;
}
```

### 5. Update Homepage

Update `src/pages/Index.tsx` to use `useHomepageContent()` for dynamic hero, featured products, etc.

## RLS Policies

If using Supabase RLS, add policies:

```sql
-- Allow public read access
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON business_settings 
  FOR SELECT USING (true);

-- Owner write access
CREATE POLICY "Owner write access" ON business_settings 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'owner'
    )
  );
```

Repeat for all CMS tables.

## Testing

1. Log in as owner
2. Navigate to Owner Dashboard > Content tab
3. Test each manager:
   - Update business settings
   - Modify business hours
   - Create/edit/delete FAQs
   - Upload gallery images
   - Create announcements
4. Verify changes appear on frontend

## Notes

- All CMS data is cached with React Query for performance
- Images are uploaded to Supabase Storage
- Announcements are dismissible and stored in localStorage
- All content supports bilingual (English/Spanish)
- Display order controls sorting
- Active/inactive toggles control visibility
