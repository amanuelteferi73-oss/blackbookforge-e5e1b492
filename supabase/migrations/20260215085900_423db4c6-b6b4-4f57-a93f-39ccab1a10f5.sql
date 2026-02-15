
-- Create notification_config table for VAPID keys storage
CREATE TABLE IF NOT EXISTS public.notification_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS enabled but no public policies - only service_role can access
ALTER TABLE public.notification_config ENABLE ROW LEVEL SECURITY;

-- Remove duplicate push subscriptions before adding constraint
DELETE FROM public.push_subscriptions a
USING public.push_subscriptions b
WHERE a.created_at < b.created_at
AND a.user_id = b.user_id
AND a.endpoint = b.endpoint;

-- Add unique constraint for upsert support
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'push_subscriptions_user_endpoint_unique'
  ) THEN
    ALTER TABLE public.push_subscriptions
    ADD CONSTRAINT push_subscriptions_user_endpoint_unique
    UNIQUE (user_id, endpoint);
  END IF;
END $$;

-- Enable pg_cron and pg_net for scheduled notifications
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;
