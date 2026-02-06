/*
  # Automated Report Scheduling with pg_cron
  
  1. Enables pg_cron and pg_net extensions
  2. Schedules a daily HTTP POST to the send-daily-report Edge Function
  
  USAGE:
  Run this SQL in your Supabase Dashboard -> SQL Editor
*/

-- 1. Enable required extensions
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2. Schedule the job (Runs daily at 8:00 AM UTC / 3:00 AM EST approx)
-- Adjust the cron expression '0 8 * * *' as needed for your timezone
select cron.schedule(
  'daily-sales-report', -- Job name
  '0 13 * * *',         -- Schedule (13:00 UTC = ~8:00 AM EST)
  $$
  select
    net.http_post(
      url:='https://rnszrscxwkdwvvlsihqc.supabase.co/functions/v1/send-daily-report',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb,
      body:='{"datePreset": "yesterday"}'::jsonb
    ) as request_id;
  $$
);

/*
  IMPORTANT: 
  Replace SERVICE_ROLE_KEY with your actual Supabase Service Role Key.
  You can find this in Project Settings -> API -> service_role secret.
*/
