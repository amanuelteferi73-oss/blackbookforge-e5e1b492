-- Drop the old constraint
ALTER TABLE public.daily_checkins DROP CONSTRAINT IF EXISTS valid_focus_pillar;

-- Add updated constraint that includes 'floor'
ALTER TABLE public.daily_checkins ADD CONSTRAINT valid_focus_pillar 
  CHECK (
    focus_pillar IS NULL OR 
    focus_pillar = ANY (ARRAY['startup', 'cash', 'school', 'floor'])
  );