import { supabase, STORAGE_BUCKET } from './supabase';
import { validateAndCompressImage } from './imageCompression';

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

/**
 * Uploads a reference image to Supabase Storage
 * @param file - The image file to upload
 * @param orderId - Optional order ID for filename generation
 * @returns Upload result with public URL
 */
export async function uploadReferenceImage(
  file: File,
  orderId?: string | number
): Promise<UploadResult> {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase is not configured. Please check your environment variables.',
    };
  }

  try {
    // Validate and compress image
    const validation = await validateAndCompressImage(file);
    if (!validation.isValid || !validation.compressedFile) {
      return {
        success: false,
        error: validation.error || 'Image validation failed',
      };
    }

    const compressedFile = validation.compressedFile;

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filename = orderId
      ? `orders/${orderId}_${timestamp}.${fileExtension}`
      : `orders/temp_${timestamp}.${fileExtension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filename, compressedFile, {
        cacheControl: '3600',
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload image',
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Deletes a reference image from Supabase Storage
 * @param imagePath - The storage path of the image to delete
 * @returns Success status
 */
export async function deleteReferenceImage(imagePath: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase is not configured',
    };
  }

  try {
    // Extract filename from path (remove bucket prefix if present)
    const path = imagePath.startsWith(`${STORAGE_BUCKET}/`)
      ? imagePath.replace(`${STORAGE_BUCKET}/`, '')
      : imagePath;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete image',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Extracts the storage path from a full URL
 * @param url - Full Supabase Storage URL
 * @returns Storage path or null
 */
export function extractStoragePath(url: string): string | null {
  try {
    // Supabase Storage URLs typically look like:
    // https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
    const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

