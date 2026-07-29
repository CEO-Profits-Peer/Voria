-- ============================================================
-- Profil beim Registrieren zuverlässig anlegen
-- ------------------------------------------------------------
-- WAS KAPUTT WAR
--
-- `registrieren()` hat erst `auth.signUp()` gerufen und danach die
-- Zeile in `profiles` eingefügt. Das kann nicht funktionieren, wenn
-- die E-Mail-Bestätigung aktiv ist: dann gibt signUp() noch KEINE
-- Sitzung zurück. Der Insert läuft also als `anon`, `auth.uid()` ist
-- NULL, und die Regel
--
--     profiles_write ... with check (id = auth.uid())
--
-- weist ihn ab. Der Rückgabewert wurde nicht geprüft — der Fehler
-- verschwand lautlos.
--
-- FOLGE
--
-- Nach der Bestätigung war der Nutzer angemeldet, hatte aber kein
-- Profil. Sichtbar an zwei Stellen:
--   * die Seitenleiste zeigte „?" statt der Initialen
--   * `trips.user_id references profiles` schlug als Fremdschlüssel
--     fehl → „Neue Reise" tat schlicht nichts
--
-- LÖSUNG
--
-- Das Profil entsteht in der Datenbank, ausgelöst von auth.users.
-- `security definer` umgeht RLS — das ist hier richtig, weil die
-- Funktion nichts entgegennimmt, was ein Nutzer frei bestimmen kann
-- außer dem Benutzernamen, und den prüft der CHECK der Tabelle.
--
-- Damit hängt das Anlegen nicht mehr an einer Sitzung, die es zu
-- diesem Zeitpunkt gar nicht geben kann.
-- ============================================================

-- ---------- Eindeutigen Benutzernamen finden ----------------
-- Kommt der Wunschname doppelt, wird angehängt: anna, anna2, anna3.
-- Ohne das würde der UNIQUE-Index die Registrierung abbrechen.

create or replace function voria_freier_benutzername(wunsch text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  basis   text;
  kandidat text;
  n       int := 1;
begin
  -- Auf erlaubte Zeichen reduzieren, dann auf 24 Zeichen kürzen.
  basis := lower(regexp_replace(coalesce(wunsch, ''), '[^a-z0-9_]', '', 'gi'));
  basis := left(basis, 24);

  -- Zu kurz oder leer: neutraler Name aus Zufall.
  if length(basis) < 3 then
    basis := 'reisender' || floor(random() * 100000)::text;
    basis := left(basis, 24);
  end if;

  kandidat := basis;

  while exists (select 1 from profiles where username = kandidat) loop
    n := n + 1;
    -- Platz für die Ziffern schaffen, damit 24 Zeichen nie gerissen werden.
    kandidat := left(basis, 24 - length(n::text)) || n::text;
  end loop;

  return kandidat;
end;
$$;

-- ---------- Profil bei neuem Konto anlegen ------------------

create or replace function voria_profil_anlegen()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  name text;
begin
  -- Der Benutzername kommt aus den Metadaten, die die
  -- Registrierung mitschickt: options.data.username.
  -- Fällt er weg, dient der Teil vor dem @ als Vorlage.
  name := voria_freier_benutzername(
    coalesce(
      new.raw_user_meta_data ->> 'username',
      split_part(coalesce(new.email, ''), '@', 1)
    )
  );

  insert into profiles (id, username, display_name)
  values (new.id, name, name)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists voria_auth_nutzer_angelegt on auth.users;

create trigger voria_auth_nutzer_angelegt
  after insert on auth.users
  for each row
  execute function voria_profil_anlegen();

-- ---------- Bestehende Konten nachziehen --------------------
-- Wer sich vor dieser Migration registriert hat, hat kein Profil.
-- Diese Konten sind unbenutzbar, solange das so bleibt.

insert into profiles (id, username, display_name)
select
  u.id,
  voria_freier_benutzername(
    coalesce(u.raw_user_meta_data ->> 'username', split_part(coalesce(u.email, ''), '@', 1))
  ),
  coalesce(u.raw_user_meta_data ->> 'username', split_part(coalesce(u.email, ''), '@', 1))
from auth.users u
where not exists (select 1 from profiles p where p.id = u.id);

-- ---------- Nachweis ----------------------------------------
-- Bricht die Migration ab, falls doch ein Konto ohne Profil bleibt.

do $$
declare
  fehlend int;
begin
  select count(*) into fehlend
  from auth.users u
  where not exists (select 1 from profiles p where p.id = u.id);

  if fehlend > 0 then
    raise exception 'Es gibt noch % Konto/Konten ohne Profil.', fehlend;
  end if;
end;
$$;
