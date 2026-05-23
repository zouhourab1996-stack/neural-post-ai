DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;

CREATE POLICY "Anyone can submit valid contact form"
ON public.contact_submissions
FOR INSERT
WITH CHECK (
  char_length(trim(name)) BETWEEN 2 AND 120
  AND char_length(trim(email)) BETWEEN 5 AND 254
  AND email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  AND char_length(trim(subject)) BETWEEN 2 AND 200
  AND char_length(trim(message)) BETWEEN 10 AND 5000
);