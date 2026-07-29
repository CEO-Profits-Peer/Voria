-- ============================================================
-- Speicher-Bucket für Fotos.
--
-- Öffentlich lesbar, aber nur der Eigentümer darf schreiben —
-- der Pfad beginnt mit fotos/<nutzer-id>/, und genau darauf
-- prüft die Regel.
--
-- Hochgeladen werden ausschließlich komprimierte Anzeigefassungen
-- (AVIF, 2560 px, rund 300 KB). Originale bleiben auf dem Gerät.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'photos',
  'photos',
  true,
  8388608,  -- 8 MB reichen weit; komprimiert sind es ~300 KB
  array['image/avif', 'image/webp', 'image/jpeg']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Lesen darf jeder — die Bilder hängen in öffentlichen Beiträgen.
-- Wer den Pfad nicht kennt, findet nichts: die Pfade enthalten UUIDs.
drop policy if exists "fotos lesen" on storage.objects;
create policy "fotos lesen" on storage.objects
  for select using (bucket_id = 'photos');

-- Schreiben nur in den eigenen Ordner.
drop policy if exists "fotos schreiben" on storage.objects;
create policy "fotos schreiben" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = 'fotos'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "fotos ersetzen" on storage.objects;
create policy "fotos ersetzen" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "fotos loeschen" on storage.objects;
create policy "fotos loeschen" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[2] = auth.uid()::text
  );
