-- Criar buckets para Media e Documents
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  ('media', 'media', true, 52428800, '{image/*,video/*,application/pdf}'), -- 50MB
  ('documents', 'documents', true, 52428800, '{image/*,application/pdf,application/msword,text/plain}')
on conflict (id) do update set 
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- RLS Policies for "media" bucket
create policy "Public Access" on storage.objects for select using ( bucket_id = 'media' );
create policy "Auth Insert" on storage.objects for insert with check ( bucket_id = 'media' and auth.role() = 'authenticated' );
create policy "Auth Update" on storage.objects for update using ( bucket_id = 'media' and auth.role() = 'authenticated' );
create policy "Auth Delete" on storage.objects for delete using ( bucket_id = 'media' and auth.role() = 'authenticated' );

-- RLS Policies for "documents" bucket
create policy "Public Access Documents" on storage.objects for select using ( bucket_id = 'documents' );
create policy "Auth Insert Documents" on storage.objects for insert with check ( bucket_id = 'documents' and auth.role() = 'authenticated' );
create policy "Auth Update Documents" on storage.objects for update using ( bucket_id = 'documents' and auth.role() = 'authenticated' );
create policy "Auth Delete Documents" on storage.objects for delete using ( bucket_id = 'documents' and auth.role() = 'authenticated' );
