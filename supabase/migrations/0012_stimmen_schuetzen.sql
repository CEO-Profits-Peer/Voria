-- ============================================================
-- Stimmen schützen
--
-- Row Level Security kennt KEINE SPALTEN. Die Regel
--
--     posts_write on posts for all using (user_id = auth.uid())
--
-- erlaubt deshalb genau das, was sie verhindern soll: Wer einen
-- eigenen Beitrag bearbeiten darf, darf in derselben Anweisung auch
--
--     vote_count = 9999
--
-- setzen. Kein Fehler, keine Meldung, die Zahl steht einfach da. Und
-- weil der Feed unter 200 Beiträgen nach Stimmen sortieren kann, wäre
-- das nicht bloß Kosmetik, sondern der Weg nach oben.
--
-- Dieselbe Lücke war bei `comments` schon geschlossen (0006), bei
-- `posts` nicht. Das war ein Versehen, kein Unterschied in der Sache.
--
-- WIEDERHOLBAR: `revoke` und `grant` lassen sich mehrfach ausführen.
-- ============================================================

/*
 * Erst alles wegnehmen, dann gezielt zurückgeben.
 *
 * `caption` ist der Begleitsatz beim Teilen — den darf der Verfasser
 * ändern. Alles andere gehört nicht ihm:
 *
 *   vote_count    dem Trigger `bump_vote_count`
 *   entry_id      dem Modell (ein Beitrag IST ein geteilter Tag)
 *   user_id       niemandem, sonst verschenkt man Beiträge
 *   published_at  der Uhr
 *
 * `insert` und `delete` bleiben unberührt — beides steuert weiterhin
 * `posts_write`, und dort ist die Zeile als Ganzes gemeint.
 */

revoke update on posts from anon, authenticated;
grant  update (caption) on posts to authenticated;

/*
 * Der Trigger bleibt arbeitsfähig: `bump_vote_count` ist
 * `security definer` und läuft mit den Rechten seines Besitzers, nicht
 * mit denen des Stimmenden. Ohne das würde ab jetzt jede Zustimmung
 * scheitern — und zwar lautlos, weil der Trigger nach `insert on
 * votes` feuert und sein Fehler die Stimme selbst nicht zurücknimmt.
 *
 * Der Betrieb über den service_role-Schlüssel ist ebenfalls
 * unberührt. Wer im Supabase-Dashboard eine Zahl setzen will, kann
 * das weiterhin.
 */

-- ------------------------------------------------------------
-- Nachweis
-- ------------------------------------------------------------

do $$
declare
  darf text[];
begin
  /*
   * Welche Spalten darf `authenticated` schreiben? Erwartet wird
   * genau eine: caption.
   */
  select array_agg(column_name order by column_name) into darf
  from information_schema.column_privileges
  where table_name = 'posts'
    and grantee = 'authenticated'
    and privilege_type = 'UPDATE';

  if darf is distinct from array['caption'] then
    raise exception
      'authenticated darf auf posts diese Spalten schreiben: % — erwartet war nur caption',
      coalesce(darf::text, 'keine');
  end if;
end;
$$;
