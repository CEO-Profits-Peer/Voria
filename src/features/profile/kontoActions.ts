'use server';

/**
 * Konto löschen.
 *
 * Der einzige Vorgang in Voria, der sich nicht rückgängig machen
 * lässt. Entsprechend vorsichtig gebaut:
 *
 * 1. Der Benutzername muss abgetippt werden. Kein „Wirklich?" — ein
 *    Bestätigungsdialog wird weggeklickt, ein Name wird gelesen.
 * 2. Erst die Dateien, dann das Konto. Andersherum wäre das Konto weg
 *    und die Fotos lägen für immer im Speicher, ohne dass jemand
 *    wüsste, wem sie gehörten.
 * 3. Schlägt das Löschen der Dateien fehl, bricht der Vorgang ab.
 *    Ein halb gelöschtes Konto ist schlimmer als ein bestehendes.
 */

import { createServerClient, createServiceClient } from '@/lib/supabase-server';
import { storage } from '@/lib/storage';

export type LoeschErgebnis =
  | { ok: true }
  | { ok: false; grund: 'nameFalsch' | 'keinKonto' | 'dateien' | 'fehler' };

export async function kontoLoeschen(bestaetigung: string): Promise<LoeschErgebnis> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, grund: 'keinKonto' };

  const { data: profil } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .maybeSingle();

  if (!profil) return { ok: false, grund: 'keinKonto' };

  /*
   * Der Vergleich läuft SERVERSEITIG. Im Browser wäre er eine
   * Höflichkeit, keine Sperre — wer die Anfrage von Hand schickt,
   * käme sonst am Abtippen vorbei.
   */
  if (bestaetigung.trim() !== profil.username) {
    return { ok: false, grund: 'nameFalsch' };
  }

  // Schritt 1: die Dateien. Alles liegt unter fotos/<nutzer-id>/.
  try {
    await storage.removeAllUnder(`fotos/${user.id}`);
  } catch (fehler) {
    console.error('[kontoLoeschen] Dateien nicht gelöscht:', fehler);
    return { ok: false, grund: 'dateien' };
  }

  /*
   * Schritt 2: das Konto. Nur die Admin-Schnittstelle kann einen
   * Eintrag aus `auth.users` entfernen — das ist einer der wenigen
   * Fälle, für die der service_role-Schlüssel gedacht ist.
   *
   * Von dort räumt `on delete cascade` den Rest: profiles, trips,
   * entries, blocks, photos, posts, votes, comments, follows,
   * notifications. Die Rückmeldungen bleiben, verlieren aber ihren
   * Absender (`on delete set null`) — der Inhalt gehört zur
   * Fehlerbehebung, der Absender nicht mehr.
   */
  const admin = createServiceClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    console.error('[kontoLoeschen] Konto nicht gelöscht:', error);
    return { ok: false, grund: 'fehler' };
  }

  await supabase.auth.signOut();
  return { ok: true };
}
