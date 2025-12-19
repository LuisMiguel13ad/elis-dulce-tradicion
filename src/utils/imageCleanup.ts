import { deleteReferenceImage, extractStoragePath } from '@/lib/storage';
import { api } from '@/lib/api';

/**
 * Deletes a reference image when an order is cancelled or deleted
 * @param orderId - The order ID
 * @param imagePath - The reference_image_path from the order
 */
export async function cleanupOrderImage(
  orderId: string | number,
  imagePath?: string | null
): Promise<void> {
  if (!imagePath) {
    return; // No image to clean up
  }

  try {
    // Extract storage path from URL if it's a full URL
    const storagePath = extractStoragePath(imagePath) || imagePath;

    const result = await deleteReferenceImage(storagePath);
    if (!result.success) {
      console.error(`Failed to delete image for order ${orderId}:`, result.error);
      // Don't throw - cleanup failures shouldn't block order operations
    } else {
      console.log(`Successfully deleted image for order ${orderId}`);
    }
  } catch (error) {
    console.error(`Error cleaning up image for order ${orderId}:`, error);
    // Don't throw - cleanup failures shouldn't block order operations
  }
}

/**
 * Cleans up images for multiple orders
 * @param orders - Array of orders with reference_image_path
 */
export async function cleanupOrderImages(
  orders: Array<{ id: string | number; reference_image_path?: string | null }>
): Promise<void> {
  const cleanupPromises = orders
    .filter((order) => order.reference_image_path)
    .map((order) => cleanupOrderImage(order.id, order.reference_image_path));

  await Promise.allSettled(cleanupPromises);
}

/**
 * Hook to clean up image when order is cancelled
 * Call this from your order cancellation handler
 */
export async function handleOrderCancellation(
  orderId: string | number
): Promise<void> {
  try {
    // Fetch order to get image path
    const order = await api.getOrder(orderId);
    if (order?.reference_image_path) {
      await cleanupOrderImage(orderId, order.reference_image_path);
    }
  } catch (error) {
    console.error(`Error fetching order for cleanup:`, error);
  }
}

