-- ============================================================
-- Was schon gelesen wurde
--
-- Ziel: Wer den Feed morgen wieder öffnet, soll oben nicht dasselbe
-- finden wie heute.
--
-- BEWUSST NICHT AUSGEBLENDET, SONDERN NACH HINTEN SORTIERT.
-- Voria hat heute zwei Beiträge. Würden gelesene verschwinden, wäre
-- der Feed nach dem ersten Durchgang leer — und ein leerer Feed ist
-- das eine, was der Kaltstart nicht verträgt. Gelesenes rutscht
-- deshalb nur ans Ende.
-- ============================================================

create table post_views (
  user_id  uuid not null references profiles on delete cascade,
  post_id  uuid not null references posts    on delete cascade,
  seen_at  timestamptz not null default now(),
  primary key (user_id, post_id)
);

-- Die eine Frage, die gestellt wird: „was hat DIESER Nutzer gesehen".
create index on post_views (user_id);

alter table post_views enable row level security;

/*
 * Lesen und schreiben nur die eigenen Zeilen.
 *
 * Kein `update`: ein einmal Gelesenes wird nicht ungelesen. Kein
 * `delete`: es gibt keinen Grund, und ohne die Regel kann auch
 * niemand fremde Stände löschen.
 *
 * Wer wessen Beitrag gesehen hat, ist eine heikle Information —
 * deshalb steht `user_id = auth.uid()` auch beim Lesen.
 */
create policy post_views_read on post_views for select
  using (user_id = auth.uid());

create policy post_views_write on post_views for insert
  with check (user_id = auth.uid());

-- ------------------------------------------------------------
-- Der Feed als Datenbankfunktion
-- ------------------------------------------------------------
--
-- WARUM NICHT WEITER ÜBER PostgREST:
--
-- „Ungelesenes zuerst" ist eine Sortierung über eine Verknüpfung mit
-- einer anderen Tabelle. Das kann PostgREST nicht — `order` kennt nur
-- Spalten der Haupttabelle. Dieselbe Lage wie bei `similarity()` in
-- Migration 0007.
--
-- `security invoker`: Row Level Security auf `posts` greift weiter.
-- Mit `definer` kämen private Beiträge durch, und die Liste sähe
-- dabei nur „voller" aus.

create or replace function feed_laden(
  versatz       int  default 0,
  hoechstens    int  default 10,
  nur_gefolgte  boolean default false,
  chronologisch boolean default true
)
returns setof posts
language sql
stable
security invoker
set search_path = public
as $$
  select p.*
  from posts p
  where
    /*
     * Eigene Beiträge bleiben drin. Sie auszuschließen wäre plausibel,
     * würde bei zwei Beiträgen im Bestand aber den Feed leeren — und
     * es wäre eine Änderung am Verhalten, die niemand verlangt hat.
     */
    not nur_gefolgte
    or exists (
      select 1 from follows f
      where f.follower_id = auth.uid() and f.followee_id = p.user_id
    )
  order by
    -- Ungelesenes zuerst. `exists` statt `left join`, damit die
    -- Zeilenzahl sich nicht verdoppeln kann.
    (exists (
      select 1 from post_views v
      where v.user_id = auth.uid() and v.post_id = p.id
    )),
    case when chronologisch then p.published_at end desc nulls last,
    case when not chronologisch then p.vote_count end desc nulls last,
    -- Eindeutig machen. Ohne das entscheidet Postgres bei Gleichstand
    -- frei, und über zwei Abfragen hinweg unterschiedlich — dann steht
    -- ein Beitrag zweimal im Feed und ein anderer nie.
    p.id desc
  limit hoechstens
  offset versatz
$$;

grant execute on function feed_laden(int, int, boolean, boolean) to authenticated;

-- ------------------------------------------------------------
-- Nachweis
-- ------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_tables where tablename = 'post_views') then
    raise exception 'Tabelle post_views wurde nicht angelegt';
  end if;

  if not exists (select 1 from pg_proc where proname = 'feed_laden') then
    raise exception 'feed_laden wurde nicht angelegt';
  end if;

  -- Ein `update`-Recht hier wäre ein Fehler, kein Fortschritt.
  if exists (
    select 1 from pg_policies
    where tablename = 'post_views' and cmd in ('UPDATE', 'DELETE')
  ) then
    raise exception 'post_views darf keine update- oder delete-Regel haben';
  end if;
end;
$$;
