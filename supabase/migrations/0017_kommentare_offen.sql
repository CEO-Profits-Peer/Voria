-- ============================================================
-- Kommentare je Beitrag zulassen oder nicht
--
-- Die erste echte Wahl beim Teilen, die über „wer sieht das" hinausgeht.
--
-- WARUM JE BEITRAG UND NICHT JE KONTO
--
-- Dieselbe Begründung wie bei der Sichtbarkeit: Ein Tag über einen
-- gestorbenen Großvater und ein Tag über einen verpassten Bus sind
-- nicht dieselbe Sache. Wer für den einen keine Kommentare will, will
-- sie für den anderen vielleicht schon. Eine Einstellung am Konto
-- würde diese Unterscheidung unmöglich machen.
--
-- Voreinstellung: offen. Wer nichts entscheidet, bekommt das, was
-- bisher galt — sonst würde diese Migration bestehende Beiträge
-- stillschweigend zumachen.
--
-- WIEDERHOLBAR — siehe Kopf von 0009_start_und_rueckmeldung.sql.
-- ============================================================

alter table posts
  add column if not exists kommentare_offen boolean not null default true;

/*
 * Spaltenrechte nachziehen. `0012` hat `update` auf `posts` bis auf
 * `caption` entzogen — ohne diese Zeile könnte niemand den neuen
 * Schalter umlegen, und zwar lautlos: Die Anweisung liefe durch, nur
 * ohne Wirkung.
 *
 * `vote_count` bleibt draußen. Das war der Grund für 0012.
 */
grant update (caption, kommentare_offen) on posts to authenticated;

/*
 * Geschlossen heißt geschlossen — auch für den, der die Anfrage von
 * Hand schickt. Row Level Security auf `comments` prüft das jetzt
 * beim Schreiben; die Oberfläche allein wäre eine Höflichkeit.
 */
drop policy if exists comments_write on comments;
create policy comments_write on comments for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from posts p
      where p.id = comments.post_id and p.kommentare_offen
    )
  );

-- ------------------------------------------------------------
-- Nachweis
-- ------------------------------------------------------------

do $$
declare
  darf text[];
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'posts' and column_name = 'kommentare_offen'
  ) then
    raise exception 'posts.kommentare_offen wurde nicht angelegt';
  end if;

  -- Genau zwei Spalten, nicht mehr. vote_count gehoert dem Trigger.
  select array_agg(column_name order by column_name) into darf
  from information_schema.column_privileges
  where table_name = 'posts'
    and grantee = 'authenticated'
    and privilege_type = 'UPDATE';

  if darf is distinct from array['caption', 'kommentare_offen'] then
    raise exception
      'authenticated darf auf posts diese Spalten schreiben: % — erwartet waren caption und kommentare_offen',
      coalesce(darf::text, 'keine');
  end if;
end;
$$;
