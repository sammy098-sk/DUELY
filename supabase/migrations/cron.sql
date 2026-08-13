-- Enable the pg_cron and pg_net extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the run-reminders Edge Function to run every 12 hours.
-- Replace `<PROJECT_REF>` with your actual Supabase project reference,
-- and `<ANON_KEY>` with your actual Supabase anon or service role key.
SELECT cron.schedule(
  'run-reminders-job',
  '0 */12 * * *', -- Every 12 hours
  $$
    SELECT net.http_post(
      url:='https://<PROJECT_REF>.supabase.co/functions/v1/run-reminders',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer <ANON_KEY>"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
