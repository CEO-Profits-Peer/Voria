-- ============================================================
-- Leute finden
-- ------------------------------------------------------------
-- Namen werden nicht gebeugt, deshalb hier kein Volltextindex wie
-- bei den Tagen. Gesucht wird mit
--
--     username ilike '%wort%'  oder  display_name ilike '%wort%'
--
-- Ein führender Platzhalter macht jeden B-Baum-Index nutzlos —
-- Postgres müsste jede Zeile lesen. Bei zwanzig Profilen fällt das
-- nicht auf, bei zwanzigtausend schon, und die Suche läuft bei jedem
-- Tastendruck.
--
-- Trigramme lösen das: Postgres zerlegt „marrakesch" in „mar", „arr",
-- „rra" … und indiziert die Dreierstücke. Damit ist auch eine Suche
-- mitten im Wort schnell.
-- ============================================================

create extension if not exists pg_trgm;

create index if not exists profiles_username_trgm
  on profiles using gin (username gin_trgm_ops);

create index if not exists profiles_display_name_trgm
  on profiles using gin (display_name gin_trgm_ops);

-- ------------------------------------------------------------
-- Follower zählen ist eine häufige Abfrage: einmal auf jedem Profil,
-- einmal pro Suchtreffer. Ohne Index scannt Postgres dafür die ganze
-- Tabelle.
--
-- Der Primärschlüssel ist (follower_id, followee_id) und hilft nur
-- beim ersten Feld. Für „wer folgt DIESER Person" fehlt die
-- Gegenrichtung.
-- ------------------------------------------------------------

create index if not exists follows_followee_idx on follows (followee_id);

-- ------------------------------------------------------------
-- Nachweis: sind die Indizes da?
-- ------------------------------------------------------------

do $$
declare
  fehlend text[];
begin
  select array_agg(n) into fehlend
  from unnest(array[
    'profiles_username_trgm',
    'profiles_display_name_trgm',
    'follows_followee_idx'
  ]) as n
  where not exists (select 1 from pg_indexes where indexname = n);

  if fehlend is not null then
    raise exception 'Diese Indizes fehlen: %', fehlend;
  end if;
end;
$$;
