
-- Create storage bucket for post photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-photos', 'Post Photos', true);

-- Set up policy to allow authenticated users to upload to the bucket
CREATE POLICY "Anyone can view post photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'post-photos');

CREATE POLICY "Authenticated users can upload post photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'post-photos' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update their own photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'post-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'post-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
