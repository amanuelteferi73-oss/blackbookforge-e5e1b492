-- Add focus_pillar column to daily_checkins
ALTER TABLE public.daily_checkins 
ADD COLUMN focus_pillar text;

-- Add constraint to ensure valid pillar values
ALTER TABLE public.daily_checkins
ADD CONSTRAINT valid_focus_pillar CHECK (
  focus_pillar IS NULL OR focus_pillar IN ('startup', 'cash', 'school')
);