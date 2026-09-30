-- Adjuntos de manuales (fotos y PDFs) + bucket de Storage.
-- Ejecutar en el SQL Editor de Supabase.

alter table public.manuals
  add column if not exists attachments jsonb not null default '[]'::jsonb;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'manual-files',
  'manual-files',
  true,
  8388608,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
    'application/pdf'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Lectura publica. La app sube/borra con service_role (bypass RLS).
drop policy if exists "manual_files_public_read" on storage.objects;
create policy "manual_files_public_read"
  on storage.objects for select
  using (bucket_id = 'manual-files');
