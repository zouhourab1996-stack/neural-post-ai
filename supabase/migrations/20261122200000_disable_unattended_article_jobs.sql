-- Stop legacy scheduled generation jobs. New articles must pass editorial review.
DO $$
DECLARE
  job_row record;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    FOR job_row IN
      SELECT jobid
      FROM cron.job
      WHERE jobname IN (
        'daily-article-generation',
        'daily-automation-morning',
        'daily-automation-evening'
      )
      OR command ILIKE '%/functions/v1/daily-automation%'
    LOOP
      PERFORM cron.unschedule(job_row.jobid);
    END LOOP;
  END IF;
END
$$;
