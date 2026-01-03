-- Add discipline_breach column to daily_checkins
ALTER TABLE public.daily_checkins 
ADD COLUMN IF NOT EXISTS discipline_breach boolean NOT NULL DEFAULT false;

-- Create failed_items table to track every "No" answer
CREATE TABLE public.failed_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_checkin_id uuid NOT NULL REFERENCES public.daily_checkins(id) ON DELETE CASCADE,
  section text NOT NULL,
  question_text text NOT NULL,
  severity text NOT NULL DEFAULT 'standard',
  points_lost integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.failed_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies using the existing owns_checkin function
CREATE POLICY "Users can insert own failed items"
ON public.failed_items
FOR INSERT
WITH CHECK (owns_checkin(daily_checkin_id));

CREATE POLICY "Users can view own failed items"
ON public.failed_items
FOR SELECT
USING (owns_checkin(daily_checkin_id));

-- Create index for faster queries
CREATE INDEX idx_failed_items_checkin ON public.failed_items(daily_checkin_id);