/**
 * Backend utility for cleaning up reference images from Supabase Storage
 * This should be called when orders are cancelled or deleted
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for server-side operations
const STORAGE_BUCKET = 'reference-images';

/**
 * Creates a Supabase client with service role key (for server-side operations)
 */
function getSupabaseClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('⚠️ Supabase credentials not configured for image cleanup');
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Extracts the storage path from a full Supabase Storage URL
 * @param {string} url - Full Supabase Storage URL
 * @returns {string|null} Storage path or null
 */
function extractStoragePath(url) {
  try {
    // Supabase Storage URLs typically look like:
    // https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
    const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Deletes a reference image from Supabase Storage
 * @param {string} imagePath - The reference_image_path from the order
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteReferenceImage(imagePath) {
  if (!imagePath) {
    return { success: true }; // No image to delete
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase not configured',
    };
  }

  try {
    // Extract storage path from URL if it's a full URL
    const storagePath = extractStoragePath(imagePath) || imagePath;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath]);

    if (error) {
      console.error('Error deleting image:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete image',
      };
    }

    console.log(`✅ Successfully deleted image: ${storagePath}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting image:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }
}

/**
 * Cleans up images for multiple orders
 * @param {Array<{reference_image_path?: string}>} orders - Array of orders
 * @returns {Promise<void>}
 */
export async function cleanupOrderImages(orders) {
  const cleanupPromises = orders
    .filter((order) => order.reference_image_path)
    .map((order) => deleteReferenceImage(order.reference_image_path));

  await Promise.allSettled(cleanupPromises);
}

