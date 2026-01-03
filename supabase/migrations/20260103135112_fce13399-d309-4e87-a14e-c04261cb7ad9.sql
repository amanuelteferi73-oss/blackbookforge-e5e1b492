-- Create storage bucket for vault proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('vault-proofs', 'vault-proofs', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for vault-proofs bucket
CREATE POLICY "Users can upload their own proofs"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'vault-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own proofs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'vault-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own proofs"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'vault-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);