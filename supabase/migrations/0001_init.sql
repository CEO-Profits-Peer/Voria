-- ============================================================
-- Voria — Datenmodell
--
-- Kernentscheidung: EIN Inhaltsmodell, ZWEI Darstellungen.
-- `blocks` trägt sowohl `position` (Reihenfolge im ruhigen Modus)
-- als auch Layout-Felder (x, y, w, h, rotation, z für Open Space).
-- Der Moduswechsel verliert dadurch nie Daten.
--
-- Zugriffsrechte liegen in Postgres, nicht in der Oberfläche.
-- Ein privater Eintrag ist privat, weil die Datenbank ihn nicht
-- herausgibt — nicht weil die UI ihn versteckt.
-- ============================================================

create extension if not exists "uuid-ossp";

create type visibility as enum ('private', 'followers', 'public');
create type entry_mode as enum ('quiet', 'free');
create type block_kind as enum ('text', 'photo', 'object');

-- ---------- Profile -----------------------------------------

create table profiles (
  id           uuid primary key references auth.users on delete cascade,
  username     text unique not null check (username ~ '^[a-z0-9_]{3,24}$'),
  display_name text not null default '',
  bio          text not null default '',
  avatar_url   text,
  is_private   boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ---------- Reisen ------------------------------------------

create table trips (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles on delete cascade,
  title           text not null default '',
  started_on      date,
  ended_on        date,
  cover_photo_id  uuid,
  region_override text,                      -- schlägt die Berechnung aus den Ländern
  visibility      visibility not null default 'private',
  created_at      timestamptz not null default now(),
  check (ended_on is null or started_on is null or ended_on >= started_on)
);

create index on trips (user_id, started_on desc);

create table trip_countries (
  trip_id      uuid not null references trips on delete cascade,
  country_code char(2) not null,
  days         int not null default 1 check (days > 0),
  primary key (trip_id, country_code)
);

-- ---------- Tage --------------------------------------------

create table entries (
  id         uuid primary key default uuid_generate_v4(),
  trip_id    uuid not null references trips on delete cascade,
  user_id    uuid not null references profiles on delete cascade,
  entry_date date not null,
  title      text,                            -- optional, kein Platzhalter wenn leer
  place_name text,
  lat        double precision,
  lng        double precision,
  mode       entry_mode not null default 'quiet',
  visibility visibility not null default 'private',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, entry_date)
);

create index on entries (user_id, entry_date desc);

-- ---------- Fotos -------------------------------------------

create table photos (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references profiles on delete cascade,
  entry_id      uuid references entries on delete set null,
  r2_key        text not null,                -- Anzeigeversion, AVIF, 2560 px
  r2_key_thumb  text not null,                -- 320 px
  width         int not null,
  height        int not null,
  bytes         int not null,
  blurhash      text,                         -- Ladezustand ohne Sprung
  taken_at      timestamptz,                  -- aus EXIF
  lat           double precision,             -- aus EXIF
  lng           double precision,
  created_at    timestamptz not null default now()
);

create index on photos (user_id, taken_at desc);

alter table trips
  add constraint trips_cover_fk
  foreign key (cover_photo_id) references photos on delete set null;

-- ---------- Blöcke: der Inhalt eines Tages ------------------

create table blocks (
  id       uuid primary key default uuid_generate_v4(),
  entry_id uuid not null references entries on delete cascade,
  kind     block_kind not null,

  -- Reihenfolge — im ruhigen Modus die einzige Anordnung
  position int not null,

  -- Inhalt, je nach kind genau eins davon gesetzt
  text     text,
  photo_id uuid references photos on delete cascade,

  -- Layout — nur im Open Space benutzt, im ruhigen Modus ignoriert
  x        real,
  y        real,
  w        real,
  h        real,
  rotation real not null default 0 check (rotation between -8 and 8),
  z        int  not null default 0,

  created_at timestamptz not null default now(),

  check (
    (kind = 'text'  and text is not null) or
    (kind = 'photo' and photo_id is not null) or
    (kind = 'object')
  )
);

create index on blocks (entry_id, position);

-- ---------- Soziales ----------------------------------------

create table posts (
  id           uuid primary key default uuid_generate_v4(),
  entry_id     uuid not null unique references entries on delete cascade,
  user_id      uuid not null references profiles on delete cascade,
  caption      text not null default '',
  vote_count   int not null default 0,        -- denormalisiert, per Trigger gepflegt
  published_at timestamptz not null default now()
);

create index on posts (published_at desc);

create table votes (
  post_id    uuid not null references posts on delete cascade,
  user_id    uuid not null references profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table follows (
  follower_id uuid not null references profiles on delete cascade,
  followee_id uuid not null references profiles on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, followee_id),
  check (follower_id <> followee_id)
);

-- ============================================================
-- Zugriffsregeln
-- ============================================================

alter table profiles       enable row level security;
alter table trips          enable row level security;
alter table trip_countries enable row level security;
alter table entries        enable row level security;
alter table photos         enable row level security;
alter table blocks         enable row level security;
alter table posts          enable row level security;
alter table votes          enable row level security;
alter table follows        enable row level security;

-- Profile sind sichtbar, solange sie nicht auf privat stehen
create policy profiles_read on profiles for select
  using (not is_private or id = auth.uid());

create policy profiles_write on profiles for all
  using (id = auth.uid()) with check (id = auth.uid());

-- Eigene Reisen immer; fremde nur wenn öffentlich
create policy trips_read on trips for select
  using (user_id = auth.uid() or visibility = 'public');

create policy trips_write on trips for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Einträge: eigene immer, fremde nur öffentlich UND geteilt
create policy entries_read on entries for select
  using (
    user_id = auth.uid()
    or (visibility = 'public' and exists (select 1 from posts where posts.entry_id = entries.id))
  );

create policy entries_write on entries for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Blöcke erben die Sichtbarkeit ihres Eintrags
create policy blocks_read on blocks for select
  using (exists (select 1 from entries e where e.id = blocks.entry_id));

create policy blocks_write on blocks for all
  using (exists (select 1 from entries e where e.id = blocks.entry_id and e.user_id = auth.uid()))
  with check (exists (select 1 from entries e where e.id = blocks.entry_id and e.user_id = auth.uid()));

create policy photos_read on photos for select
  using (
    user_id = auth.uid()
    or exists (select 1 from entries e where e.id = photos.entry_id)
  );

create policy photos_write on photos for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy trip_countries_all on trip_countries for all
  using (exists (select 1 from trips t where t.id = trip_countries.trip_id and t.user_id = auth.uid()))
  with check (exists (select 1 from trips t where t.id = trip_countries.trip_id and t.user_id = auth.uid()));

-- Beiträge sind öffentlich lesbar, schreiben darf nur der Verfasser
create policy posts_read  on posts for select using (true);
create policy posts_write on posts for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy votes_read  on votes for select using (true);
create policy votes_write on votes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy follows_read  on follows for select using (true);
create policy follows_write on follows for all
  using (follower_id = auth.uid()) with check (follower_id = auth.uid());

-- ---------- Zähler pflegen ----------------------------------

create or replace function bump_vote_count() returns trigger
language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    update posts set vote_count = vote_count + 1 where id = new.post_id;
  elsif tg_op = 'DELETE' then
    update posts set vote_count = greatest(vote_count - 1, 0) where id = old.post_id;
  end if;
  return null;
end $$;

create trigger votes_count
  after insert or delete on votes
  for each row execute function bump_vote_count();

create or replace function touch_entry() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger entries_touch
  before update on entries
  for each row execute function touch_entry();
