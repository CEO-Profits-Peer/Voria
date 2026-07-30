-- ============================================================
-- Voria — Kommentare mit Stimmen
--
-- Entschieden am 30.07.: verschachtelt und ausklappbar, im Fuß der
-- Beitragskarte, nach Stimmen sortiert, NICHT löschbar — nur
-- bearbeitbar, danach sichtbar „bearbeitet".
--
-- Das Nichtlöschen ist eine Produktentscheidung, keine Oberfläche.
-- Deshalb gibt es unten bewusst KEINE delete-Regel: Row Level
-- Security verweigert ohne Regel, ein Löschversuch über die API läuft
-- also ins Leere. Wer das später ändern will, ändert es hier.
-- ============================================================

create table comments (
  id         uuid primary key default uuid_generate_v4(),
  post_id    uuid not null references posts on delete cascade,
  user_id    uuid not null references profiles on delete cascade,
  parent_id  uuid references comments on delete cascade,
  text       text not null check (length(trim(text)) > 0),
  vote_count int  not null default 0,        -- denormalisiert, per Trigger gepflegt
  edited_at  timestamptz,                    -- null = nie bearbeitet
  created_at timestamptz not null default now()
);

create table comment_votes (
  comment_id uuid not null references comments on delete cascade,
  user_id    uuid not null references profiles on delete cascade,
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

-- Die Sortierung des Kommentarbereichs, direkt als Index.
create index on comments (post_id, vote_count desc);
create index on comments (parent_id);

-- ---------- Zugriffsregeln ----------------------------------

alter table comments      enable row level security;
alter table comment_votes enable row level security;

-- Lesen darf jeder, was zu einem Beitrag gehört. `posts_read` ist
-- `using (true)`, das hier ist also heute gleichbedeutend mit `true` —
-- aber es bleibt richtig, falls Beiträge später einmal enger werden.
create policy comments_read on comments for select
  using (exists (select 1 from posts p where p.id = comments.post_id));

create policy comments_insert on comments for insert
  with check (user_id = auth.uid());

create policy comments_update on comments for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- KEINE delete-Regel. Siehe Kopfkommentar.

create policy comment_votes_read on comment_votes for select using (true);

create policy comment_votes_write on comment_votes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- Was beim Bearbeiten geändert werden darf ---------
--
-- Row Level Security kennt keine Spalten. Ohne die folgenden Zeilen
-- dürfte jemand seinen eigenen Kommentar zwar nur als er selbst
-- ändern — aber dabei `vote_count` auf 9999 setzen, denn das ist
-- dieselbe UPDATE-Anweisung. Spaltenrechte sind die einzige Stelle,
-- an der sich das sauber trennen lässt.

revoke update on comments from anon, authenticated;
grant  update (text) on comments to authenticated;

-- ---------- Zähler und Bearbeitungsmarke --------------------

-- `bump_vote_count` aus 0001 schreibt fest nach `posts`. Kommentare
-- brauchen einen eigenen, sonst zählt gar nichts.
create or replace function bump_comment_vote_count() returns trigger
language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    update comments set vote_count = vote_count + 1 where id = new.comment_id;
  elsif tg_op = 'DELETE' then
    update comments set vote_count = greatest(vote_count - 1, 0) where id = old.comment_id;
  end if;
  return null;
end $$;

create trigger comment_votes_count
  after insert or delete on comment_votes
  for each row execute function bump_comment_vote_count();

-- `edited_at` setzt die Datenbank, nicht der Client — sonst könnte man
-- unbemerkt umschreiben.
--
-- Die Prüfung auf den Text ist nicht kosmetisch: der Zähler-Trigger
-- oben führt ein UPDATE auf `comments` aus. Ohne sie bekäme jeder
-- Kommentar bei der ersten Zustimmung ein „bearbeitet" verpasst,
-- obwohl niemand ein Wort angefasst hat.
create or replace function mark_comment_edited() returns trigger
language plpgsql as $$
begin
  if new.text is distinct from old.text then
    new.edited_at = now();
  end if;
  return new;
end $$;

create trigger comments_edited
  before update on comments
  for each row execute function mark_comment_edited();
