-- ============================================================
-- Voria PRO — Design und Materialschicht
--
-- Drei Einstellungen am Profil, mehr braucht es nicht. Ob jemand PRO
-- HAT, steht hier bewusst nicht: das entscheidet `istPro()` in
-- src/lib/plan.ts, und später die Abo-Tabelle. Diese Spalten sagen
-- nur, wie es aussehen SOLL, wenn er es hat.
--
-- Dadurch bleibt eine Einstellung erhalten, wenn ein Abo ausläuft und
-- später wiederkommt — die Regel „PRO begrenzt, was man anlegt,
-- niemals was man liest" gilt sinngemäß auch für Vorlieben.
-- ============================================================

-- `null` heißt: die Region entscheidet, so wie heute. Das ist die
-- Voreinstellung, auch für zahlende Nutzer — niemand bekommt ein
-- anderes Aussehen aufgedrängt, nur weil er bezahlt hat.
create type pro_design_art as enum ('nordlicht');

alter table profiles
  add column pro_design    pro_design_art,
  add column pro_material  boolean not null default true,
  -- Bewegung des Nordlichts. Standard AUS: eine dauerhaft laufende
  -- Animation auf der Schreibfläche ist das eine, was Voria sich
  -- nicht leisten sollte — sie kostet auf dem Handy Strom und steht
  -- gegen „die App drängt nicht". Wer sie will, schaltet sie ein.
  add column pro_bewegung  boolean not null default false;

/*
 * Weitere Designs kommen als eigene Werte dazu:
 *
 *   alter type pro_design_art add value 'basalt';
 *   alter type pro_design_art add value 'elfenbein';
 *   alter type pro_design_art add value 'stein';
 *
 * `Schiefer & Ader` bringt zusätzlich `pro_ader` mit — vier
 * Aderfarben sind kein eigenes Design, sondern eine Wahl darin.
 * Bewusst noch nicht angelegt: eine Spalte, die nichts steuert,
 * verwirrt später mehr, als sie heute spart.
 */

-- ------------------------------------------------------------
-- Nachweis
-- ------------------------------------------------------------

do $$
declare
  fehlend text[];
begin
  select array_agg(n) into fehlend
  from unnest(array['pro_design', 'pro_material', 'pro_bewegung']) as n
  where not exists (
    select 1 from information_schema.columns
    where table_name = 'profiles' and column_name = n
  );

  if fehlend is not null then
    raise exception 'Diese Spalten fehlen in profiles: %', fehlend;
  end if;
end;
$$;
