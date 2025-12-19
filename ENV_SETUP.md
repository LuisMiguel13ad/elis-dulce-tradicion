# Environment Variables Setup

## Quick Start

1. Create a `.env` file in the root directory
2. Copy the variables below and fill in your values

## Required Variables

```env
# Supabase (Authentication & Storage)
# Get these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Optional Variables

```env
# Square Payment Processing
VITE_SQUARE_APPLICATION_ID=your-square-application-id
VITE_SQUARE_LOCATION_ID=your-square-location-id
VITE_SQUARE_ENVIRONMENT=sandbox

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# API Configuration
VITE_API_URL=http://localhost:3000/api

# Dashboard PIN
VITE_DASHBOARD_PIN=1234
```

## Getting Supabase Credentials

1. Go to https://supabase.com
2. Create a project or select an existing one
3. Go to Settings > API
4. Copy:
   - Project URL → `VITE_SUPABASE_URL`
   - anon/public key → `VITE_SUPABASE_ANON_KEY`

## Note

The site will work without Supabase variables, but features like:
- User authentication
- Image uploads
- CMS features
- Real-time updates

will be disabled. The site will still display and function for basic browsing.
