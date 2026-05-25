-- Make client-media bucket private
UPDATE storage.buckets
SET public = false
WHERE id = 'client-media';
