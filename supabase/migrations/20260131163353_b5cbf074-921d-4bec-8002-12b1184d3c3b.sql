-- Add columns to track timer completion
ALTER TABLE floor_timers 
ADD COLUMN IF NOT EXISTS stopped_at TIMESTAMPTZ NULL,
ADD COLUMN IF NOT EXISTS auto_started BOOLEAN DEFAULT true;