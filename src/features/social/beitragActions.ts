'use server';

/**
 * Einen Beitrag beginnen — also einen Tag anlegen und dorthin führen.
 *
 * Der Kern der Entscheidung vom 30.07.: Ein Beitrag IST ein geteilter
 * Tag. „Posten" legt deshalb einen Tag an, statt eine zweite
 * Inhaltsart zu erfinden.
 *
 * AN WELCHE REISE? An die zuletzt begonnene. Das ist die Reise, auf
 * der man gerade ist — jemand, der heute etwas posten will, ist mit
 * überwältigender Wahrscheinlichkeit dort unterwegs. Wer es anders
 * will, verschiebt den Tag später; das kostet zwei Klicks statt einer
 * Auswahlliste, die neunundneunzig Mal von hundert dieselbe Antwort
 * bekäme.
 */

import { createServerClient } from '@/lib/supabase-server';
import { tagSichern } from '@/features/log/actions';
import { heuteAlsDatum } from '@/features/log/datum';

/**
 * Gibt den Pfad zum Tag zurück, oder `null` wenn es nicht geht.
 *
 * `null` heißt in aller Regel: Es gibt noch keine Reise. Der Aufrufer
 * sagt das dann — ein stiller Abbruch wäre hier besonders ärgerlich,
 * weil man gerade etwas schreiben wollte.
 */
export async function beitragBeginnen(): Promise<string | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: reise, error } = await supabase
    .from('trips')
    .select('id')
    /* `.eq` trotz RLS: `trips_read` lässt auch fremde öffentliche
       Reisen durch — ohne den Filter landete der Beitrag womöglich
       in der Reise eines Fremden. Siehe Kommentar in log/queries.ts. */
    .eq('user_id', user.id)
    .order('started_on', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[beitragBeginnen]', error);
    return null;
  }
  if (!reise) return null;

  const datum = heuteAlsDatum();

  /*
   * `tagSichern` legt den Tag an ODER gibt den bestehenden zurück.
   * Wer zweimal am Tag auf „Beitrag erstellen" drückt, bekommt also
   * denselben Tag und nicht zwei — `entries` hat einen eindeutigen
   * Schlüssel auf (trip_id, entry_date).
   */
  const id = await tagSichern(reise.id, datum);
  if (!id) return null;

  return `/log/${reise.id}/${datum}`;
}
