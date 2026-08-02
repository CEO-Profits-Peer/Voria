-- ============================================================
-- Den Jahresrückblick teilen
--
-- In der Gesamtbeschreibung steht, der Rückblick sei „der geplante
-- Anstoß" — etwas, das man herzeigen will, entstanden aus dem, was
-- ohnehin da ist. Seit dem 31.07. wiegt das schwerer: Voria läuft als
-- Nebenprodukt, und die tausend Schreiber kommen nicht durch
-- Marketing herein. Ein Rückblick, den niemand sehen kann, ist als
-- Anstoß wertlos.
--
-- ═══════════════════════════════════════════════════════════════
-- WARUM EINE MOMENTAUFNAHME UND KEINE ABFRAGE
-- ═══════════════════════════════════════════════════════════════
--
-- Der Rückblick in der App enthält TITEL UND ORTE — „längste Reise",
-- „längster Tag". Das ist selbstgeschriebener Text aus Tagen, die
-- privat sein können.
--
-- Würde die öffentliche Seite dieselbe Abfrage benutzen, hinge die
-- Vertraulichkeit daran, dass jemand beim nächsten Umbau daran denkt,
-- ein Feld wegzulassen. Genau daran denkt niemand.
--
-- Deshalb liegt hier eine ERSTARRTE KOPIE: beim Teilen wird
-- ausgerechnet, was gezeigt werden soll, und nur DAS wird abgelegt.
-- Was nicht in `daten` steht, kann auch nicht herausrutschen.
--
-- Abgelegt werden ausschließlich Zahlen und Ländercodes. Keine Titel,
-- keine Orte, keine Texte, keine Fotos.
--
-- WIEDERHOLBAR — siehe Kopf von 0009_start_und_rueckmeldung.sql.
-- ============================================================

create table if not exists rueckblick_geteilt (
  -- Die Kennung IST das Geheimnis. Wer sie hat, darf sehen.
  token      uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references profiles on delete cascade,
  jahr       int  not null,
  /*
   * Die erstarrte Kopie. Was hier nicht drinsteht, wird nie
   * ausgeliefert — auch nicht, wenn der Rückblick in der App später
   * mehr zeigt.
   */
  daten      jsonb not null,
  anzeigename text not null default '',
  angelegt   timestamptz not null default now(),
  -- Ein Jahr, ein Link. Wer erneut teilt, bekommt denselben ersetzt.
  unique (user_id, jahr)
);

alter table rueckblick_geteilt enable row level security;

/*
 * Der Besitzer sieht und verwaltet das Seine. Sonst niemand — es gibt
 * ABSICHTLICH keine öffentliche select-Regel.
 *
 * Der Grund: Mit `using (true)` ließen sich über die REST-Schnittstelle
 * alle Zeilen auflisten, und damit alle Kennungen. Ein Geheimnis, das
 * sich auflisten lässt, ist keines. Der öffentliche Zugriff läuft
 * deshalb über die Funktion unten, die nur bei GENAU passender
 * Kennung antwortet.
 */
drop policy if exists rueckblick_geteilt_eigene on rueckblick_geteilt;
create policy rueckblick_geteilt_eigene on rueckblick_geteilt for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

/*
 * Der öffentliche Weg. `security definer`, weil der Aufrufer keine
 * Sitzung hat — er kennt nur die Kennung.
 *
 * Gibt NUR `daten` und `jahr` zurück, nicht `user_id`: Wer den Link
 * hat, soll den Rückblick sehen, nicht die Nutzerkennung dahinter.
 */
create or replace function rueckblick_oeffentlich(kennung uuid)
returns table (jahr int, anzeigename text, daten jsonb)
language sql
stable
security definer
set search_path = public
as $$
  select r.jahr, r.anzeigename, r.daten
  from rueckblick_geteilt r
  where r.token = kennung
$$;

grant execute on function rueckblick_oeffentlich(uuid) to anon, authenticated;

-- ------------------------------------------------------------
-- Nachweis
-- ------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_tables where tablename = 'rueckblick_geteilt') then
    raise exception 'Tabelle rueckblick_geteilt wurde nicht angelegt';
  end if;

  if not exists (select 1 from pg_proc where proname = 'rueckblick_oeffentlich') then
    raise exception 'rueckblick_oeffentlich wurde nicht angelegt';
  end if;

  /*
   * Eine Regel, die mehr als die eigenen Zeilen zeigt, waere hier der
   * Fehler: Dann liessen sich alle Kennungen auflisten.
   */
  if exists (
    select 1 from pg_policies
    where tablename = 'rueckblick_geteilt'
      and cmd in ('SELECT', 'ALL')
      and qual is not null
      and qual not like '%auth.uid()%'
  ) then
    raise exception
      'rueckblick_geteilt hat eine Leseregel ohne auth.uid() — damit sind alle Kennungen auflistbar';
  end if;
end;
$$;
