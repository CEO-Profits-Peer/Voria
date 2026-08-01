-- ============================================================
-- Geteilte Beiträge bekommen ihr Regionen-Theme
--
-- DAS PROBLEM
--
-- `trip_countries_all` verlangt `t.user_id = auth.uid()`. Wer nicht
-- angemeldet ist, bekommt die Länder einer Reise deshalb nicht — und
-- ohne Länder rechnet `regionForCountry` keine Region aus. Ein
-- geteilter Beitrag erschien dadurch ohne Material, ohne Ornament,
-- ohne Farbe.
--
-- WARUM DAS JETZT MEHR WIEGT ALS VORHER
--
-- Es stand als „kosmetisch, aber falsch" in ANSTEHEND.md. Seit der
-- Richtungsänderung vom 31.07. ist `/b/<id>` aber der einzige Weg,
-- auf dem Voria neue Leute erreicht — und das Regionen-Theme ist
-- genau das, was Voria von einem Notizzettel unterscheidet. Es
-- ausgerechnet dort wegzulassen, wo Fremde zum ersten Mal hinsehen,
-- ist keine Kosmetik mehr.
--
-- DIE LÖSUNG
--
-- Eine ZUSÄTZLICHE Leseregel. Die bestehende bleibt unangetastet:
-- Regeln in Postgres sind ODER-verknüpft, wer also schon durfte, darf
-- weiterhin. Neu dazu kommt nur der Fall „diese Reise hat einen
-- öffentlich geteilten Tag".
--
-- WAS DAMIT SICHTBAR WIRD, und was nicht: Preisgegeben werden die
-- Ländercodes einer Reise, von der ohnehin ein Tag öffentlich steht.
-- Reisen ohne geteilten Tag bleiben vollständig verborgen — auch
-- deren Länder.
--
-- WIEDERHOLBAR — siehe Kopf von 0009_start_und_rueckmeldung.sql.
-- ============================================================

drop policy if exists trip_countries_geteilt on trip_countries;
create policy trip_countries_geteilt on trip_countries for select
  using (
    exists (
      select 1
      from entries e
      join posts p on p.entry_id = e.id
      where e.trip_id = trip_countries.trip_id
        and e.visibility = 'public'
    )
  );

/*
 * Dasselbe für `trips` selbst: `regionForTrip` liest auch
 * `region_override`. Ohne diese Regel käme die Reise leer zurück und
 * eine von Hand gesetzte Region ginge verloren.
 *
 * `trips_read` erlaubt heute `visibility = 'public'` — das ist die
 * Sichtbarkeit der REISE, nicht des Tages, und die steht bei
 * niemandem auf öffentlich. Deshalb reicht sie hier nicht.
 */
drop policy if exists trips_geteilt on trips;
create policy trips_geteilt on trips for select
  using (
    exists (
      select 1
      from entries e
      join posts p on p.entry_id = e.id
      where e.trip_id = trips.id
        and e.visibility = 'public'
    )
  );

-- ------------------------------------------------------------
-- Nachweis
-- ------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'trip_countries' and policyname = 'trip_countries_geteilt'
  ) then
    raise exception 'trip_countries_geteilt wurde nicht angelegt';
  end if;

  if not exists (
    select 1 from pg_policies
    where tablename = 'trips' and policyname = 'trips_geteilt'
  ) then
    raise exception 'trips_geteilt wurde nicht angelegt';
  end if;

  /*
   * Die neuen Regeln dürfen NUR lesen. Eine Schreibregel hier wäre
   * ein Loch: Wer einen Tag teilt, gäbe sonst die ganze Reise zum
   * Bearbeiten frei.
   */
  if exists (
    select 1 from pg_policies
    where policyname in ('trip_countries_geteilt', 'trips_geteilt')
      and cmd <> 'SELECT'
  ) then
    raise exception 'Die neuen Regeln duerfen ausschliesslich lesen';
  end if;
end;
$$;
