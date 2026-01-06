-- Drop existing policy
DROP POLICY IF EXISTS "Users can update own punishments for proof" ON public.punishments;

-- Create fixed policy with proper WITH CHECK clause
CREATE POLICY "Users can update own punishments for proof"
  ON public.punishments
  FOR UPDATE
  USING (auth.uid() = user_id AND proof_submitted_at IS NULL)
  WITH CHECK (auth.uid() = user_id);