-- ============================================================
-- Wo die App startet, und ein Kanal für Rückmeldungen
-- ============================================================

-- ---------- Startbereich ------------------------------------
--
-- Voreinstellung ist der Feed: Wer die App öffnet, soll etwas
-- vorfinden, nicht ein leeres Blatt. Der Log ist einen Griff weit weg.
--
-- Der Stille Modus stellt das um — und zwar nach derselben Regel wie
-- bei den Hinweisen: Er ÜBERSCHREIBT diese Spalte, er schreibt sie
-- nicht um. Wer ihn wieder ausschaltet, startet wieder dort, wo er
-- vorher gestartet ist. Deshalb bleibt `startbereich` beim
-- Einschalten unangetastet.

create type startbereich_art as enum ('feed', 'log');

alter table profiles
  add column startbereich startbereich_art not null default 'feed';

-- ---------- Rückmeldungen -----------------------------------
--
-- Bewusst schlicht: eine Tabelle, kein Ticketsystem. Was ankommt,
-- liest der Betreiber im Supabase-Dashboard.

create table feedback (
  id         uuid primary key default uuid_generate_v4(),
  -- Nullable: eine Rückmeldung darf auch von einem gelöschten Konto
  -- übrig bleiben. Sie verliert dann ihren Absender, nicht ihren Inhalt.
  user_id    uuid references profiles on delete set null,
  text       text not null check (length(trim(text)) between 3 and 4000),
  -- Wo der Absender war, als er geschrieben hat. Spart die Rückfrage
  -- „auf welcher Seite denn?".
  pfad       text,
  created_at timestamptz not null default now()
);

create index on feedback (created_at desc);

alter table feedback enable row level security;

/*
 * Schreiben ja, lesen nein.
 *
 * Es gibt ABSICHTLICH keine select-Regel. Rückmeldungen enthalten
 * regelmäßig Dinge, die andere nichts angehen — Fehlerbeschreibungen
 * mit Namen darin, Ärger über jemanden, manchmal eine E-Mail-Adresse.
 * Ohne select-Regel gibt PostgREST nichts heraus, an niemanden.
 * Gelesen wird im Dashboard.
 *
 * `with check` bindet die Zeile an den Absender: niemand kann eine
 * Rückmeldung unter fremdem Namen abgeben.
 */
create policy feedback_write on feedback for insert
  with check (user_id = auth.uid());

-- ------------------------------------------------------------
-- Nachweis
-- ------------------------------------------------------------

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'profiles' and column_name = 'startbereich'
  ) then
    raise exception 'profiles.startbereich wurde nicht angelegt';
  end if;

  if not exists (select 1 from pg_tables where tablename = 'feedback') then
    raise exception 'Tabelle feedback wurde nicht angelegt';
  end if;

  -- Eine select-Regel hier wäre ein Fehler, kein Fortschritt.
  if exists (
    select 1 from pg_policies
    where tablename = 'feedback' and cmd = 'SELECT'
  ) then
    raise exception 'feedback darf keine select-Regel haben — siehe Kommentar';
  end if;
end;
$$;
