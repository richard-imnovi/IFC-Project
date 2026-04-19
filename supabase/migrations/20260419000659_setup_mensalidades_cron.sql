CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $DO$
BEGIN
  -- Unschedule existing job if any to make it idempotent
  BEGIN
    PERFORM cron.unschedule('generate_monthly_mensalidades_job');
  EXCEPTION WHEN OTHERS THEN
    -- Ignore if not exists
  END;

  -- Schedule the job to run at 00:00 on the 1st day of every month
  PERFORM cron.schedule(
    'generate_monthly_mensalidades_job',
    '0 0 1 * *',
    $$
      SELECT net.http_post(
          url:='https://qvmtxsxwfmlnmtgkpglu.supabase.co/functions/v1/generate_monthly_mensalidades',
          headers:='{"Content-Type": "application/json"}'::jsonb
      );
    $$
  );
END $DO$;
