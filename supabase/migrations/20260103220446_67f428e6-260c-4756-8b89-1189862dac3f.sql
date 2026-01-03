-- Create punishments table for storing assigned punishments
CREATE TABLE public.punishments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  daily_checkin_id UUID NOT NULL REFERENCES public.daily_checkins(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  score INTEGER NOT NULL,
  punishment_index INTEGER NOT NULL,
  punishment_text TEXT NOT NULL,
  failed_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  proof_feeling TEXT,
  proof_commitment TEXT,
  proof_submitted_at TIMESTAMP WITH TIME ZONE,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_punishment_per_day UNIQUE (user_id, date)
);

-- Enable RLS
ALTER TABLE public.punishments ENABLE ROW LEVEL SECURITY;

-- Users can only view their own punishments
CREATE POLICY "Users can view own punishments" 
ON public.punishments 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own punishments
CREATE POLICY "Users can insert own punishments" 
ON public.punishments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own punishments (only for proof submission)
CREATE POLICY "Users can update own punishments for proof" 
ON public.punishments 
FOR UPDATE 
USING (auth.uid() = user_id AND proof_submitted_at IS NULL);