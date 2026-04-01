-- Add audio and video path columns to daily_checkins
ALTER TABLE public.daily_checkins ADD COLUMN IF NOT EXISTS audio_path text;
ALTER TABLE public.daily_checkins ADD COLUMN IF NOT EXISTS video_path text;

-- Create storage bucket for checkin media
INSERT INTO storage.buckets (id, name, public)
VALUES ('checkin-media', 'checkin-media', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for checkin-media bucket
CREATE POLICY "Users can upload checkin media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'checkin-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own checkin media"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'checkin-media' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own checkin media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'checkin-media' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow updating daily_checkins (needed for adding media after submission)
CREATE POLICY "Users can update own checkins"
ON public.daily_checkins FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);