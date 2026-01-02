-- EXECUTION OS DATABASE SCHEMA
-- Single-user, immutable, discipline-enforcing backend

-- ============================================
-- 1️⃣ SYSTEM_TIME - Canonical time reference
-- ============================================
CREATE TABLE public.system_time (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_start_date TIMESTAMPTZ NOT NULL DEFAULT '2026-02-01T00:00:00Z',
  system_end_date TIMESTAMPTZ NOT NULL DEFAULT '2027-02-01T00:00:00Z',
  last_tick_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert the singleton system time record
INSERT INTO public.system_time (system_start_date, system_end_date) 
VALUES ('2026-02-01T00:00:00Z', '2027-02-01T00:00:00Z');

-- ============================================
-- 2️⃣ PROFILES - User profile (singleton)
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, last_login_at)
  VALUES (new.id, new.email, now());
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3️⃣ DAILY_RULES - Static rule definitions
-- ============================================
CREATE TABLE public.daily_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  weight INTEGER NOT NULL DEFAULT 5 CHECK (weight >= 1 AND weight <= 10),
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own rules"
  ON public.daily_rules FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- 4️⃣ DAILY_CHECKIN - One immutable record per day
-- ============================================
CREATE TABLE public.daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  submitted_at TIMESTAMPTZ,
  is_missed BOOLEAN NOT NULL DEFAULT false,
  total_score INTEGER NOT NULL DEFAULT 0 CHECK (total_score >= 0 AND total_score <= 100),
  failure_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checkins"
  ON public.daily_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins"
  ON public.daily_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- NO UPDATE/DELETE policies - records are immutable

-- ============================================
-- 5️⃣ DAILY_RULE_EVALUATIONS - Rule results per day
-- ============================================
CREATE TABLE public.daily_rule_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_checkin_id UUID NOT NULL REFERENCES public.daily_checkins(id) ON DELETE CASCADE,
  rule_id UUID NOT NULL REFERENCES public.daily_rules(id) ON DELETE CASCADE,
  value BOOLEAN NOT NULL DEFAULT false,
  numeric_value NUMERIC,
  score_contribution INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(daily_checkin_id, rule_id)
);

ALTER TABLE public.daily_rule_evaluations ENABLE ROW LEVEL SECURITY;

-- Security definer function to check checkin ownership
CREATE OR REPLACE FUNCTION public.owns_checkin(_checkin_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.daily_checkins
    WHERE id = _checkin_id AND user_id = auth.uid()
  )
$$;

CREATE POLICY "Users can view own evaluations"
  ON public.daily_rule_evaluations FOR SELECT
  USING (public.owns_checkin(daily_checkin_id));

CREATE POLICY "Users can insert own evaluations"
  ON public.daily_rule_evaluations FOR INSERT
  WITH CHECK (public.owns_checkin(daily_checkin_id));

-- NO UPDATE/DELETE policies - immutable

-- ============================================
-- 6️⃣ STREAKS - Track continuity
-- ============================================
CREATE TABLE public.streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL DEFAULT 'daily_checkin',
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streaks"
  ON public.streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own streaks"
  ON public.streaks FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- 7️⃣ ASSETS - Images, audio, locked content
-- ============================================
CREATE TYPE public.asset_type AS ENUM ('image', 'audio', 'message');
CREATE TYPE public.asset_category AS ENUM ('past', 'future', 'dream', 'reward', 'legacy');

CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type public.asset_type NOT NULL,
  category public.asset_category NOT NULL,
  name TEXT,
  file_path TEXT,
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own assets"
  ON public.assets FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- 8️⃣ ASSET_UNLOCK_CONDITIONS - Define unlock rules
-- ============================================
CREATE TYPE public.unlock_condition_type AS ENUM ('score', 'streak', 'date', 'manual');

CREATE TABLE public.asset_unlock_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  condition_type public.unlock_condition_type NOT NULL,
  condition_value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.asset_unlock_conditions ENABLE ROW LEVEL SECURITY;

-- Security definer function to check asset ownership
CREATE OR REPLACE FUNCTION public.owns_asset(_asset_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.assets
    WHERE id = _asset_id AND user_id = auth.uid()
  )
$$;

CREATE POLICY "Users can manage own unlock conditions"
  ON public.asset_unlock_conditions FOR ALL
  USING (public.owns_asset(asset_id));

-- ============================================
-- 9️⃣ ASSET_UNLOCK_STATUS - Track unlock events
-- ============================================
CREATE TABLE public.asset_unlock_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE UNIQUE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  unlock_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.asset_unlock_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own unlock status"
  ON public.asset_unlock_status FOR SELECT
  USING (public.owns_asset(asset_id));

CREATE POLICY "Users can insert own unlock status"
  ON public.asset_unlock_status FOR INSERT
  WITH CHECK (public.owns_asset(asset_id));

-- NO UPDATE/DELETE - once unlocked, permanent

-- ============================================
-- 🔟 FAILURE_LOG - Record explicit failures
-- ============================================
CREATE TABLE public.failure_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.failure_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own failure logs"
  ON public.failure_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own failure logs"
  ON public.failure_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- NO UPDATE/DELETE - immutable failure records

-- ============================================
-- BACKEND FUNCTIONS
-- ============================================

-- Calculate score from rule evaluations
CREATE OR REPLACE FUNCTION public.calculate_checkin_score(_checkin_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_weight INTEGER := 0;
  earned_weight INTEGER := 0;
  final_score INTEGER;
BEGIN
  SELECT 
    COALESCE(SUM(r.weight), 0),
    COALESCE(SUM(CASE WHEN e.value THEN r.weight ELSE 0 END), 0)
  INTO total_weight, earned_weight
  FROM public.daily_rule_evaluations e
  JOIN public.daily_rules r ON r.id = e.rule_id
  WHERE e.daily_checkin_id = _checkin_id;

  IF total_weight = 0 THEN
    RETURN 0;
  END IF;

  final_score := ROUND((earned_weight::NUMERIC / total_weight::NUMERIC) * 100);
  
  -- Update the checkin with calculated score
  UPDATE public.daily_checkins 
  SET total_score = final_score 
  WHERE id = _checkin_id;

  RETURN final_score;
END;
$$;

-- Get current streak for user
CREATE OR REPLACE FUNCTION public.get_current_streak(_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  streak_count INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  has_checkin BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM public.daily_checkins 
      WHERE user_id = _user_id 
      AND date = check_date 
      AND is_missed = false
    ) INTO has_checkin;

    IF has_checkin THEN
      streak_count := streak_count + 1;
      check_date := check_date - 1;
    ELSE
      EXIT;
    END IF;
  END LOOP;

  RETURN streak_count;
END;
$$;

-- Get average score over N days
CREATE OR REPLACE FUNCTION public.get_average_score(_user_id UUID, _days INTEGER DEFAULT 7)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(ROUND(AVG(total_score)), 0)::INTEGER
  FROM (
    SELECT total_score 
    FROM public.daily_checkins 
    WHERE user_id = _user_id 
    AND is_missed = false
    ORDER BY date DESC 
    LIMIT _days
  ) recent;
$$;

-- Check if asset should be unlocked
CREATE OR REPLACE FUNCTION public.check_asset_unlock(_asset_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  condition RECORD;
  all_met BOOLEAN := true;
  asset_user_id UUID;
  current_streak INTEGER;
  avg_score INTEGER;
BEGIN
  -- Get asset owner
  SELECT user_id INTO asset_user_id FROM public.assets WHERE id = _asset_id;
  IF asset_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Check if already unlocked
  IF EXISTS (SELECT 1 FROM public.asset_unlock_status WHERE asset_id = _asset_id) THEN
    RETURN true;
  END IF;

  -- Check all conditions
  FOR condition IN 
    SELECT * FROM public.asset_unlock_conditions WHERE asset_id = _asset_id
  LOOP
    CASE condition.condition_type
      WHEN 'score' THEN
        avg_score := public.get_average_score(asset_user_id, COALESCE((condition.condition_value->>'days')::INTEGER, 7));
        IF avg_score < COALESCE((condition.condition_value->>'threshold')::INTEGER, 80) THEN
          all_met := false;
        END IF;
      WHEN 'streak' THEN
        current_streak := public.get_current_streak(asset_user_id);
        IF current_streak < COALESCE((condition.condition_value->>'days')::INTEGER, 7) THEN
          all_met := false;
        END IF;
      WHEN 'date' THEN
        IF CURRENT_DATE < (condition.condition_value->>'unlock_date')::DATE THEN
          all_met := false;
        END IF;
      WHEN 'manual' THEN
        -- Manual unlock requires explicit action
        all_met := false;
    END CASE;
  END LOOP;

  -- If no conditions exist, asset is locked by default
  IF NOT EXISTS (SELECT 1 FROM public.asset_unlock_conditions WHERE asset_id = _asset_id) THEN
    RETURN false;
  END IF;

  RETURN all_met;
END;
$$;

-- Trigger to auto-calculate score after rule evaluations
CREATE OR REPLACE FUNCTION public.trigger_calculate_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.calculate_checkin_score(NEW.daily_checkin_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER after_evaluation_insert
  AFTER INSERT ON public.daily_rule_evaluations
  FOR EACH ROW EXECUTE FUNCTION public.trigger_calculate_score();