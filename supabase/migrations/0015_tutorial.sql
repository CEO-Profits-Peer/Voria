-- ============================================================
-- Die Führung für neue Nutzer
--
-- Zwei Spalten, mehr braucht es nicht: Wo jemand stehengeblieben ist,
-- und ob er fertig ist. Beides am Profil und nicht im Browser, damit
-- die Führung nicht auf jedem Gerät von vorn beginnt — wer sie am
-- Rechner weggeklickt hat, will sie am Handy nicht wiedersehen.
--
-- `tutorial_schritt` merkt die Stelle, nicht nur „läuft/läuft nicht":
-- Wer nach dem dritten Schritt weggeht, soll dort weitermachen und
-- nicht wieder bei der Begrüßung landen.
--
-- WIEDERHOLBAR — siehe Kopf von 0009_start_und_rueckmeldung.sql.
-- ============================================================

alter table profiles
  add column if not exists tutorial_schritt int not null default 0,
  -- `true` heißt: durchgelaufen ODER bewusst übersprungen. Beides ist
  -- eine Entscheidung, und beide werden gleich behandelt — noch einmal
  -- fragen wäre in beiden Fällen aufdringlich.
  add column if not exists tutorial_fertig boolean not null default false;

-- ------------------------------------------------------------
-- Nachweis
-- ------------------------------------------------------------

do $$
declare
  fehlend text[];
begin
  select array_agg(n) into fehlend
  from unnest(array['tutorial_schritt', 'tutorial_fertig']) as n
  where not exists (
    select 1 from information_schema.columns
    where table_name = 'profiles' and column_name = n
  );

  if fehlend is not null then
    raise exception 'Diese Spalten fehlen in profiles: %', fehlend;
  end if;
end;
$$;
