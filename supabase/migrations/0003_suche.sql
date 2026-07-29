-- ============================================================
-- Suche im eigenen Tagebuch.
--
-- Deutsche Volltextsuche über Titel, Ort und Blocktext. Der Index
-- liegt auf einer generierten Spalte, damit er automatisch mitläuft.
--
-- Row Level Security greift auch hier — man findet nur, was man
-- sehen darf. Ein privater Eintrag taucht in fremden Suchen nicht auf.
-- ============================================================

-- Blocktexte je Eintrag zusammenfassen, damit die Suche einen
-- Anlaufpunkt hat statt über zwei Tabellen zu spannen.
alter table entries
  add column if not exists such_text text not null default '';

create or replace function entry_such_text(e_id uuid) returns text
language sql stable as $$
  select coalesce(string_agg(b.text, ' '), '')
  from blocks b
  where b.entry_id = e_id and b.kind = 'text' and b.text is not null
$$;

-- Bei jeder Blockänderung den Suchtext des Eintrags neu setzen.
create or replace function blocks_such_text_pflegen() returns trigger
language plpgsql security definer as $$
declare
  ziel uuid := coalesce(new.entry_id, old.entry_id);
begin
  update entries set such_text = entry_such_text(ziel) where id = ziel;
  return null;
end $$;

drop trigger if exists blocks_such_text on blocks;
create trigger blocks_such_text
  after insert or update or delete on blocks
  for each row execute function blocks_such_text_pflegen();

-- Der eigentliche Suchvektor.
alter table entries
  drop column if exists suche;

alter table entries
  add column suche tsvector
  generated always as (
    to_tsvector(
      'german',
      coalesce(title, '') || ' ' || coalesce(place_name, '') || ' ' || coalesce(such_text, '')
    )
  ) stored;

create index if not exists entries_suche_idx on entries using gin (suche);

-- Bestehende Einträge einmalig befüllen.
update entries set such_text = entry_such_text(id);
