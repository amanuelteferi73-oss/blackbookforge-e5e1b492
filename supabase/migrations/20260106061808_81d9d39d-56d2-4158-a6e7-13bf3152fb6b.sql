
-- Create floor_weeks table
CREATE TABLE public.floor_weeks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_number INTEGER NOT NULL,
  objective TEXT NOT NULL,
  focus_split TEXT,
  success_condition TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_number)
);

-- Create floor_days table
CREATE TABLE public.floor_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_id UUID NOT NULL REFERENCES public.floor_weeks(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 7),
  title TEXT NOT NULL,
  intent TEXT NOT NULL,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  rules TEXT,
  unlock_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(week_id, day_number)
);

-- Create floor_timers table
CREATE TABLE public.floor_timers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  day_id UUID NOT NULL REFERENCES public.floor_days(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_id)
);

-- Enable RLS on all tables
ALTER TABLE public.floor_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.floor_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.floor_timers ENABLE ROW LEVEL SECURITY;

-- RLS policies for floor_weeks
CREATE POLICY "Users can view own floor weeks"
  ON public.floor_weeks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own floor weeks"
  ON public.floor_weeks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own floor weeks"
  ON public.floor_weeks FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS policies for floor_days (through week ownership)
CREATE POLICY "Users can view own floor days"
  ON public.floor_days FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.floor_weeks 
    WHERE floor_weeks.id = floor_days.week_id 
    AND floor_weeks.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own floor days"
  ON public.floor_days FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.floor_weeks 
    WHERE floor_weeks.id = floor_days.week_id 
    AND floor_weeks.user_id = auth.uid()
  ));

-- RLS policies for floor_timers
CREATE POLICY "Users can view own floor timers"
  ON public.floor_timers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own floor timers"
  ON public.floor_timers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own floor timers"
  ON public.floor_timers FOR UPDATE
  USING (auth.uid() = user_id);
