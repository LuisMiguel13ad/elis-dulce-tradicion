-- Database Webhook for Automated Notifications
-- This script sets up a trigger to automatically call Edge Functions when an order status changes.

-- 1. Create the function that calls the Edge Function
CREATE OR REPLACE FUNCTION public.handle_status_notification()
RETURNS TRIGGER AS $$
DECLARE
  edge_url TEXT;
  service_role_key TEXT;
  payload JSONB;
BEGIN
  -- Get secrets (Assuming they are set in the vault or as env vars accessible to postgres)
  -- For webhooks, Supabase natively supports HTTP hooks, but we use a trigger function
  -- for more complex logic (like switching between 'ready' and default status updates).

  -- 1. Determine which function to call
  IF NEW.status = 'ready' THEN
    edge_url := 'https://rnszrscxwkdwvvlsihqc.supabase.co/functions/v1/send-ready-notification';
  ELSE
    edge_url := 'https://rnszrscxwkdwvvlsihqc.supabase.co/functions/v1/send-status-update';
  END IF;

  -- 2. Build the payload matching the StatusUpdateData / ReadyNotificationData interfaces
  payload := jsonb_build_object(
    'order', jsonb_build_object(
      'order_number', NEW.order_number,
      'customer_name', NEW.customer_name,
      'customer_email', NEW.customer_email,
      'customer_language', NEW.customer_language,
      'new_status', NEW.status,
      'old_status', OLD.status,
      'date_needed', NEW.date_needed,
      'time_needed', NEW.time_needed,
      'delivery_option', NEW.delivery_option,
      'delivery_address', NEW.delivery_address,
      'delivery_apartment', NEW.delivery_apartment,
      'total_amount', NEW.total_amount
    ),
    'oldStatus', OLD.status
  );

  -- 3. Perform the HTTP request using pg_net (Supabase's standard for webhooks)
  -- This is non-blocking and reliable.
  PERFORM net.http_post(
    url := edge_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('vault.anon_key', true) -- Or use a secret from the vault
    ),
    body := payload
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS on_order_status_change ON public.orders;
CREATE TRIGGER on_order_status_change
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.handle_status_notification();
