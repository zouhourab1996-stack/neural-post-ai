CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA net;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-article-generation') THEN
    PERFORM cron.unschedule('daily-article-generation');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-automation-morning') THEN
    PERFORM cron.unschedule('daily-automation-morning');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-automation-evening') THEN
    PERFORM cron.unschedule('daily-automation-evening');
  END IF;
END $$;

SELECT cron.schedule(
  'daily-article-generation',
  '25 8,18 * * *',
  $$
  SELECT net.http_post(
    url := 'https://bltytefghazluwicnaii.supabase.co/functions/v1/daily-automation',
    body := '{}'::jsonb,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInJlZiI6IkpXVCJ9.eyJpc3MiOiJibHR5dGVmZ2hhemx1d2ljbmFpaSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzY4Njc2OTM5LCJleHAiOjIwODQyNTI5Mzl9.LfH0E7PQ5kD9NpNDK0zSGSNSU3mnGvImeytOF5gqt3w'
    ),
    timeout_milliseconds := 240000
  ) AS request_id;
  $$
);