'use server';

/**
 * Rückmeldungen entgegennehmen.
 *
 * Kein Ticketsystem, keine E-Mail, kein Fremddienst — eine Zeile in
 * einer Tabelle. Gelesen wird im Supabase-Dashboard. Das reicht für
 * die nächsten tausend Nutzer und lässt sich später ersetzen, ohne
 * dass hier etwas hängt.
 */

import { createServerClient } from '@/lib/supabase-server';

export type Ergebnis = { ok: true } | { ok: false; grund: 'leer' | 'lang' | 'fehler' };

export async function rueckmeldungSenden(text: string, pfad: string): Promise<Ergebnis> {
  const sauber = text.trim();

  /*
   * Dieselben Grenzen wie in der Datenbank (`check` in Migration
   * 0009). Doppelt geprüft, weil die Datenbank die Wahrheit ist, die
   * Oberfläche aber sagen können muss, WAS nicht stimmt — ein
   * abgelehnter Insert kommt ohne brauchbaren Satz zurück.
   */
  if (sauber.length < 3) return { ok: false, grund: 'leer' };
  if (sauber.length > 4000) return { ok: false, grund: 'lang' };

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, grund: 'fehler' };

  const { error } = await supabase.from('feedback').insert({
    user_id: user.id,
    text: sauber,
    pfad: pfad.slice(0, 300),
  });

  if (error) {
    // Nicht verschlucken. Ein Formular, das mit 200 zurückkommt und
    // nichts sagt, ist Fehlerklasse zwei aus der Gesamtbeschreibung.
    console.error('[rueckmeldungSenden]', error);
    return { ok: false, grund: 'fehler' };
  }

  return { ok: true };
}
