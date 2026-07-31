-- ============================================================
-- Leute finden, auch bei Tippfehlern
--
-- Migration 0005 hat die Trigramm-Indizes gelegt, die Abfrage nutzte
-- sie aber nur zur Beschleunigung von `ilike '%wort%'`. Das ist schnell
-- und trotzdem streng: „marakesh" findet „Marrakesch" NICHT, weil die
-- Zeichenkette buchstäblich vorkommen muss.
--
-- Namen tippt man aber falsch. Genau dafür gibt es pg_trgm — der Index
-- lag schon da, nur die Frage war die falsche.
--
-- ZWEI GRÜNDE, WARUM DAS EINE FUNKTION IN POSTGRES IST UND KEINE
-- ERWEITERTE ABFRAGE IM CODE:
--
-- 1. `similarity()` lässt sich über PostgREST nicht filtern oder
--    sortieren. Die Ähnlichkeit ist aber genau das, wonach sortiert
--    werden muss.
-- 2. Die alte Fassung baute `or=(username.ilike.%x%,…)` als
--    Zeichenkette zusammen, die serverseitig geparst wird. Hier sind
--    die Werte gebundene Parameter — die Eingabe kann die Bedingung
--    nicht mehr umschreiben.
-- ============================================================

-- SECURITY INVOKER ist hier keine Formalie, sondern der Kern:
-- Die Funktion läuft mit den Rechten des Aufrufers, also greift
-- `profiles_read` weiterhin. Mit SECURITY DEFINER käme jedes private
-- Profil zurück, und niemand würde es merken — die Suche sähe nur
-- „besser" aus.
create or replace function leute_suchen(wort text, hoechstens int default 20)
returns setof profiles
language sql
stable
security invoker
set search_path = public
as $$
  select p.*
  from profiles p
  where
    -- Der buchstäbliche Treffer mitten im Wort …
    p.username ilike '%' || wort || '%'
    or p.display_name ilike '%' || wort || '%'
    -- … und der ähnliche. Der Operator `%` nutzt den GIN-Index aus
    -- 0005 und richtet sich nach pg_trgm.similarity_threshold (0.3).
    -- `similarity() > 0.3` wäre gleichbedeutend, würde den Index aber
    -- nicht anfassen und jede Zeile lesen.
    or p.username % wort
    or p.display_name % wort
  order by
    -- Was am Anfang passt, ist wahrscheinlich gemeint: „anna" zeigt
    -- `anna` vor `marianna`.
    (p.username ilike wort || '%' or p.display_name ilike wort || '%') desc,
    -- Danach der bessere Treffer. Das ist die Sortierung, die über
    -- PostgREST allein nicht möglich war.
    greatest(similarity(p.username, wort), similarity(p.display_name, wort)) desc,
    p.username
  limit hoechstens
$$;

grant execute on function leute_suchen(text, int) to anon, authenticated;

-- ------------------------------------------------------------
-- Nachweis: findet sie einen Tippfehler?
-- ------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from pg_proc where proname = 'leute_suchen'
  ) then
    raise exception 'leute_suchen wurde nicht angelegt';
  end if;

  -- Ähnlichkeit muss über der Schwelle liegen, sonst ist die ganze
  -- Migration wirkungslos und niemand merkt es.
  -- Ein einzelnes %, nicht %%. Zwei davon wären ein maskiertes
  -- Prozentzeichen, also null Platzhalter bei einem Argument —
  -- und RAISE bricht dann mit „too many parameters" ab.
  if similarity('marrakesch', 'marakesh') <= 0.3 then
    raise exception
      'pg_trgm findet den Tippfehler nicht — Schwelle pruefen (%)',
      similarity('marrakesch', 'marakesh');
  end if;
end;
$$;
