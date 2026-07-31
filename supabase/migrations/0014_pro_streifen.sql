-- ============================================================
-- Der PRO-Streifen — wann er zuletzt stand, wie oft weggewischt
--
-- Entschieden am 30.07., und die Zahlen sind die Entscheidung:
--
--   * höchstens ZWEIMAL JE WOCHE
--   * ein Streifen zum Wegwischen, KEIN modaler Dialog
--   * niemals, während jemand schreibt
--   * nach dem DRITTEN Wegwischen drei Monate Ruhe
--
-- Der Anlass war ein Vorschlag, alle ein bis drei Stunden eines zu
-- zeigen. Verworfen: Ein Reisetagebuch wird abends für zehn Minuten
-- geöffnet — ein Zeitgeber in Stunden hieße, dass praktisch jedes
-- Öffnen mit einem Verkaufsgespräch beginnt.
--
-- WIEDERHOLBAR — siehe Kopf von 0009_start_und_rueckmeldung.sql.
-- ============================================================

alter table profiles
  -- Wann der Streifen zuletzt zu sehen war.
  add column if not exists pro_streifen_zuletzt timestamptz,
  -- Wie oft er weggewischt wurde. Wird nie zurückgesetzt: Dreimal
  -- nein ist dreimal nein, auch über Monate verteilt.
  add column if not exists pro_streifen_weg int not null default 0,
  -- Bis wann Ruhe herrscht. Gesetzt beim dritten Wegwischen.
  add column if not exists pro_streifen_ruhe_bis timestamptz;

-- ------------------------------------------------------------
-- Nachweis
-- ------------------------------------------------------------

do $$
declare
  fehlend text[];
begin
  select array_agg(n) into fehlend
  from unnest(array[
    'pro_streifen_zuletzt',
    'pro_streifen_weg',
    'pro_streifen_ruhe_bis'
  ]) as n
  where not exists (
    select 1 from information_schema.columns
    where table_name = 'profiles' and column_name = n
  );

  if fehlend is not null then
    raise exception 'Diese Spalten fehlen in profiles: %', fehlend;
  end if;
end;
$$;
