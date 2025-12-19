# Supabase Storage Setup Guide

This guide will help you set up Supabase Storage for reference image uploads.

## Prerequisites

1. A Supabase project (create one at https://supabase.com)
2. Your Supabase project URL and anon key

## Step 1: Environment Variables

Add these to your `.env` file (and `.env.production` for production):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these in your Supabase Dashboard:
- Go to Settings > API
- Copy the "Project URL" → `VITE_SUPABASE_URL`
- Copy the "anon public" key → `VITE_SUPABASE_ANON_KEY`

## Step 2: Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure the bucket:
   - **Name**: `reference-images`
   - **Public bucket**: ✅ **Checked** (this allows public read access)
   - **File size limit**: `5242880` (5MB in bytes)
   - **Allowed MIME types**: `image/jpeg,image/jpg,image/png,image/webp`
5. Click **"Create bucket"**

## Step 3: Set Up Storage Policies

Run the SQL from `backend/db/supabase-storage-setup.sql` in your Supabase SQL Editor:

1. Go to **SQL Editor** in your Supabase Dashboard
2. Click **"New query"**
3. Copy and paste the contents of `backend/db/supabase-storage-setup.sql`
4. Click **"Run"** to execute the policies

This will set up:
- ✅ Public read access (anyone can view images)
- ✅ Authenticated upload access
- ✅ User deletion permissions

## Step 4: Install Dependencies

Run this command to install the required packages:

```bash
npm install @supabase/supabase-js browser-image-compression
```

## Step 5: Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to the order page
3. Try uploading an image in Step 2 of the order form
4. Check your Supabase Storage dashboard to verify the image was uploaded

## Troubleshooting

### "Supabase is not configured" error

- Check that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in your `.env` file
- Restart your dev server after adding environment variables
- Make sure the variable names start with `VITE_` (required for Vite)

### "Failed to upload image" error

- Verify the bucket exists and is named exactly `reference-images`
- Check that storage policies are set up correctly
- Verify the bucket is set to "Public"
- Check browser console for detailed error messages

### Images not showing

- Verify the bucket is public
- Check that the "Public read access" policy is active
- Verify the image URL is being stored correctly in the database

### File size errors

- The max file size is 5MB
- Images are automatically compressed before upload
- If issues persist, check the bucket's file size limit setting

## Security Notes

- The anon key is safe to expose in client-side code (it's designed for this)
- Storage policies control access, not the key itself
- For production, consider implementing additional server-side validation
- The cleanup utility should be called when orders are deleted/cancelled

## File Naming Convention

Images are stored with the pattern:
- `orders/{orderId}_{timestamp}.{ext}` for confirmed orders
- `orders/temp_{timestamp}.{ext}` for temporary uploads

This makes it easy to:
- Organize images by order
- Clean up orphaned images
- Track upload timestamps

