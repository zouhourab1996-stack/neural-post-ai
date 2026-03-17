
-- Enable pg_cron and pg_net extensions for scheduled edge function calls
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule daily automation: run twice daily at 08:00 and 18:00 UTC
-- This calls the daily-automation edge function which generates 2 articles
SELECT cron.schedule(
  'daily-automation-morning',
  '0 8 * * *',
  $$
  SELECT extensions.http_post(
    url := 'https://bltytefghazluwicnaii.supabase.co/functions/v1/daily-automation',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsdHl0ZWZnaGF6bHV3aWNuYWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NzY5MzksImV4cCI6MjA4NDI1MjkzOX0.LfH0E7PQ5kD9NpNDK0zSGSNSU3mnGvImeytOF5gqt3w'
    ),
    body := '{}'::jsonb
  );
  $$
);

SELECT cron.schedule(
  'daily-automation-evening',
  '0 18 * * *',
  $$
  SELECT extensions.http_post(
    url := 'https://bltytefghazluwicnaii.supabase.co/functions/v1/daily-automation',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsdHl0ZWZnaGF6bHV3aWNuYWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NzY5MzksImV4cCI6MjA4NDI1MjkzOX0.LfH0E7PQ5kD9NpNDK0zSGSNSU3mnGvImeytOF5gqt3w'
    ),
    body := '{}'::jsonb
  );
  $$
);
