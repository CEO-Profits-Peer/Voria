-- ============================================================
-- Voria — Hinweise (Benachrichtigungen)
--
-- Entschieden am 30.07.: Rote Punkte für EREIGNISSE sind erlaubt,
-- rote Punkte für VERHALTEN nicht. Eine Antwort ist ein Ereignis.
-- Eine gerissene Serie wäre Verhalten — deshalb gibt es hier kein
-- Feld dafür und wird es keins geben.
--
-- Vier Arten, mehr nicht:
--   kommentar  — jemand hat deinen Beitrag kommentiert
--   antwort    — jemand hat auf deinen Kommentar geantwortet
--   folger     — jemand folgt dir
--   upload     — jemand, dem du folgst, hat einen Tag geteilt
--
-- Hinweise entstehen ausschließlich per Trigger, nie durch den
-- Client. Deshalb gibt es unten KEINE insert-Regel: niemand soll sich
-- selbst Hinweise schreiben können, und erst recht keine fremden.
-- ============================================================

-- WIEDERHOLBAR — siehe Kopf von 0009_start_und_rueckmeldung.sql.
do $wdh$
begin
  if not exists (select 1 from pg_type where typname = 'hinweis_art') then
    create type hinweis_art as enum ('kommentar', 'antwort', 'folger', 'upload');
  end if;
end;
$wdh$;

create table if not exists notifications (
  id         uuid primary key default uuid_generate_v4(),
  -- Wer ihn bekommt.
  user_id    uuid not null references profiles on delete cascade,
  -- Wer ihn ausgelöst hat. Nie man selbst — siehe Trigger.
  actor_id   uuid not null references profiles on delete cascade,
  art        hinweis_art not null,
  post_id    uuid references posts on delete cascade,
  comment_id uuid references comments on delete cascade,
  read_at    timestamptz,                  -- null = ungelesen
  created_at timestamptz not null default now()
);

-- Die eine Abfrage, die es geben wird: meine ungelesenen, neueste zuerst.
create index if not exists notifications_offen_idx
  on notifications (user_id, read_at, created_at desc);

-- ---------- Einstellungen am Profil --------------------------
--
-- Vier Schalter, nicht einer. Der Stille Modus ist ABSICHTLICH eine
-- eigene Spalte und schreibt die drei anderen NICHT um: Er
-- überschreibt sie, solange er an ist, und beim Ausschalten steht
-- alles wieder so, wie es vorher war. Genau das ist der Unterschied
-- zwischen einem Modus und einem Rundumschlag.

alter table profiles
  add column if not exists hinweis_kommentar boolean not null default true,
  add column if not exists hinweis_folger    boolean not null default true,
  add column if not exists hinweis_upload    boolean not null default true,
  add column if not exists stiller_modus     boolean not null default false;

-- ---------- Zugriffsregeln ----------------------------------

alter table notifications enable row level security;

-- Nur die eigenen, und wirklich nur die eigenen.
drop policy if exists notifications_read on notifications;
create policy notifications_read on notifications for select
  using (user_id = auth.uid());

-- Gelesen markieren darf man seine eigenen. Mehr nicht — und auch
-- hier gilt: Spaltenrechte, weil RLS keine Spalten kennt. Ohne das
-- ließe sich beim Markieren die `art` umschreiben.
drop policy if exists notifications_update on notifications;
create policy notifications_update on notifications for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

revoke update on notifications from anon, authenticated;
grant  update (read_at) on notifications to authenticated;

-- KEINE insert-Regel: Hinweise entstehen nur per Trigger.
-- KEINE delete-Regel: sie verschwinden mit dem, woran sie hängen.

-- ---------- Wer bekommt was ---------------------------------

/*
 * Ein Kommentar erzeugt entweder „antwort" (an den Verfasser des
 * Elternkommentars) oder „kommentar" (an den Verfasser des Beitrags).
 * Nie beides, sonst bekommt man bei einer Antwort auf den eigenen
 * Kommentar unter dem eigenen Beitrag zwei Hinweise für dasselbe.
 *
 * `security definer`, weil der Schreiber keine Rechte auf die
 * Hinweise des Empfängers hat — und haben soll.
 */
create or replace function hinweis_bei_kommentar() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  ziel uuid;
  welche hinweis_art;
begin
  if new.parent_id is not null then
    select user_id into ziel from comments where id = new.parent_id;
    welche := 'antwort';
  else
    select user_id into ziel from posts where id = new.post_id;
    welche := 'kommentar';
  end if;

  -- Sich selbst benachrichtigen ist Lärm, kein Hinweis.
  if ziel is null or ziel = new.user_id then
    return null;
  end if;

  -- Der Schalter wird HIER geprüft, nicht beim Anzeigen. Ein Hinweis,
  -- den niemand sehen will, soll gar nicht erst entstehen.
  if not exists (
    select 1 from profiles
    where id = ziel and hinweis_kommentar and not stiller_modus
  ) then
    return null;
  end if;

  insert into notifications (user_id, actor_id, art, post_id, comment_id)
  values (ziel, new.user_id, welche, new.post_id, new.id);

  return null;
end $$;

drop trigger if exists comments_hinweis on comments;
create trigger comments_hinweis
  after insert on comments
  for each row execute function hinweis_bei_kommentar();

create or replace function hinweis_bei_folgen() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from profiles
    where id = new.followee_id and hinweis_folger and not stiller_modus
  ) then
    return null;
  end if;

  insert into notifications (user_id, actor_id, art)
  values (new.followee_id, new.follower_id, 'folger');

  return null;
end $$;

drop trigger if exists follows_hinweis on follows;
create trigger follows_hinweis
  after insert on follows
  for each row execute function hinweis_bei_folgen();

/*
 * Ein geteilter Tag benachrichtigt alle Folger — eine Zeile je Folger.
 *
 * Das ist Fan-out beim Schreiben. Bei jemandem mit fünfzig Followern
 * sind das fünfzig Zeilen, und das ist völlig in Ordnung. Bekäme Voria
 * jemals Konten mit sechsstelligen Followerzahlen, muss das auf
 * Berechnung beim Lesen umgestellt werden — dann ist es aber auch ein
 * anderes Produkt.
 */
create or replace function hinweis_bei_beitrag() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into notifications (user_id, actor_id, art, post_id)
  select f.follower_id, new.user_id, 'upload', new.id
  from follows f
  join profiles p on p.id = f.follower_id
  where f.followee_id = new.user_id
    and p.hinweis_upload
    and not p.stiller_modus;

  return null;
end $$;

drop trigger if exists posts_hinweis on posts;
create trigger posts_hinweis
  after insert on posts
  for each row execute function hinweis_bei_beitrag();

-- ------------------------------------------------------------
-- Nachweis
-- ------------------------------------------------------------

do $$
declare
  fehlend text[];
begin
  select array_agg(n) into fehlend
  from unnest(array['comments_hinweis', 'follows_hinweis', 'posts_hinweis']) as n
  where not exists (select 1 from pg_trigger where tgname = n);

  if fehlend is not null then
    raise exception 'Diese Trigger fehlen: %', fehlend;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_name = 'profiles' and column_name = 'stiller_modus'
  ) then
    raise exception 'profiles.stiller_modus wurde nicht angelegt';
  end if;
end;
$$;
