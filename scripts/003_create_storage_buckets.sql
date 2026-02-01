-- Create Storage Buckets for File Upload

-- Create the user-files bucket for storing user uploads
INSERT INTO storage.buckets (id, name, owner, public, avif_autodetection, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
  'user-files',
  'user-files',
  NULL,
  true,  -- Make publicly accessible so users can view their files
  false,
  5242880,  -- 5MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[],
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Create policies for the user-files bucket

-- Policy 1: Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload files to their own folder" ON storage.objects
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' 
    AND bucket_id = 'user-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 2: Allow authenticated users to read their own files
CREATE POLICY "Users can read their own files" ON storage.objects
  FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND bucket_id = 'user-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 3: Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND bucket_id = 'user-files'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy 4: Allow public read access to all files in user-files bucket (so images display)
CREATE POLICY "Public read access to user files" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'user-files');
