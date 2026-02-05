/**
 * Helper utility for calling Supabase Edge Functions
 */

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const CRON_SECRET = process.env.CRON_SECRET;

interface EdgeFunctionResponse {
  success: boolean;
  error?: string;
  messageId?: string;
  skipped?: boolean;
  reason?: string;
}

/**
 * Call a Supabase Edge Function with retry logic
 */
async function callEdgeFunction(
  functionName: string,
  payload: any,
  retries = 3
): Promise<EdgeFunctionResponse> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('⚠️ Supabase credentials not configured. Skipping edge function call.');
    return { success: false, error: 'Supabase not configured' };
  }

  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Edge function call failed (attempt ${attempt}/${retries}):`, error);

      if (attempt === retries) {
        // Last attempt failed
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }

      // Wait before retry (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return { success: false, error: 'Max retries exceeded' };
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(order: any): Promise<EdgeFunctionResponse> {
  return callEdgeFunction('send-order-confirmation', { order });
}

/**
 * Send status update email
 */
export async function sendStatusUpdateEmail(
  order: any,
  oldStatus?: string
): Promise<EdgeFunctionResponse> {
  return callEdgeFunction('send-status-update', { order, oldStatus });
}

/**
 * Send ready notification email
 */
export async function sendReadyNotificationEmail(order: any): Promise<EdgeFunctionResponse> {
  return callEdgeFunction('send-ready-notification', { order });
}

/**
 * Call an edge function using cron secret auth (for scheduled jobs)
 */
async function callEdgeFunctionWithCronSecret(
  functionName: string,
  payload: any,
  retries = 3
): Promise<EdgeFunctionResponse> {
  if (!SUPABASE_URL) {
    console.warn('⚠️ SUPABASE_URL not configured. Skipping edge function call.');
    return { success: false, error: 'Supabase not configured' };
  }
  if (!CRON_SECRET) {
    console.warn('⚠️ CRON_SECRET not configured. Skipping cron edge function call.');
    return { success: false, error: 'CRON_SECRET not configured' };
  }

  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cron-secret': CRON_SECRET,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Cron edge function call failed (attempt ${attempt}/${retries}):`, error);

      if (attempt === retries) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }

      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return { success: false, error: 'Max retries exceeded' };
}

/**
 * Send daily report email (triggered by cron job)
 */
export async function sendDailyReportEmail(): Promise<EdgeFunctionResponse> {
  return callEdgeFunctionWithCronSecret('send-daily-report', { datePreset: 'yesterday' });
}

/**
 * Check if user wants to receive email notifications
 * This should be called before sending emails
 */
export async function shouldSendEmail(
  customerEmail: string,
  notificationType: 'order_updates' | 'ready_notifications' | 'promotions'
): Promise<boolean> {
  // For now, always return true (default)
  // In the future, query the profiles table to check preferences
  // This requires a database connection, so it's better to check in the edge function
  return true;
}
