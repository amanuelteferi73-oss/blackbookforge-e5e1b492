-- Add selected_pillars column to daily_checkins for multi-pillar support
ALTER TABLE public.daily_checkins 
ADD COLUMN selected_pillars jsonb DEFAULT '[]'::jsonb;

-- Add comment for clarity
COMMENT ON COLUMN public.daily_checkins.selected_pillars IS 'Array of selected pillar types: school, startup, cash, floor';