-- Enable RLS on system_time table (read-only public access)
ALTER TABLE public.system_time ENABLE ROW LEVEL SECURITY;

-- System time is readable by all authenticated users (singleton config table)
CREATE POLICY "Authenticated users can read system time"
  ON public.system_time FOR SELECT
  TO authenticated
  USING (true);