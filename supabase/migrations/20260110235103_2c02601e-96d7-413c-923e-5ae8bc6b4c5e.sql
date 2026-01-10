-- Add daily_achievement column to daily_checkins table
ALTER TABLE public.daily_checkins 
ADD COLUMN daily_achievement text;