'use server';

/**
 * Hinweise als gelesen markieren und die Schalter dafür setzen.
 *
 * Anlegen kann man Hinweise hier nicht — das tun ausschließlich die
 * Trigger aus `0008_hinweise.sql`. Es gibt dafür auch keine
 * `insert`-Regel in der Datenbank.
 */

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase-server';

/**
 * Alles Ungelesene abhaken.
 *
 * Läuft beim Öffnen der Seite. Bewusst kein „als ungelesen markieren"
 * und kein Abhaken je Zeile: Ein Hinweis ist eine Mitteilung, keine
 * Aufgabe. Wer ihn gesehen hat, hat ihn gesehen.
 */
export async function hinweiseGelesen() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .is('read_at', null);

  if (error) console.error('[hinweiseGelesen]', error);

  /*
   * HIER STEHT ABSICHTLICH KEIN `revalidatePath`.
   *
   * Es wäre der Reflex — der Punkt an der Glocke sitzt in der Hülle
   * und würde sonst stehen bleiben. `revalidatePath('/', 'layout')`
   * baut aber auch die Seite darunter neu, und das ist genau diese
   * Seite: Die Markierungen an den neuen Zeilen verschwänden dann
   * eine Sekunde nach dem Öffnen, und man sähe nie, was einen
   * erwartet hat.
   *
   * Der Punkt verschwindet stattdessen beim nächsten Seitenwechsel.
   * Das ist spät genug, um die Liste in Ruhe zu lassen, und früh
   * genug, dass niemand ihn für hängengeblieben hält — man ist ja
   * gerade auf der Seite, die er meint.
   */
}

export type HinweisSchalter =
  | 'hinweis_kommentar'
  | 'hinweis_folger'
  | 'hinweis_upload'
  | 'stiller_modus';

/**
 * Wo Voria startet.
 *
 * Steht hier und nicht bei den Hinweisen, weil es dieselbe Regel
 * teilt: Der Stille Modus überschreibt die Wahl auf den Log, ohne sie
 * umzuschreiben. Entschieden wird das in `middleware.ts`.
 */
export async function startbereichSetzen(wohin: 'feed' | 'log') {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('profiles')
    .update({ startbereich: wohin })
    .eq('id', user.id);

  if (error) console.error('[startbereichSetzen]', error);

  revalidatePath('/du/einstellungen');
}

/**
 * Einen Schalter umlegen.
 *
 * Der Stille Modus ist hier ein Schalter wie die anderen — er schreibt
 * die drei ausdrücklich NICHT um. Solange er an ist, unterdrücken die
 * Trigger alles; wird er ausgeschaltet, stehen die Einzelschalter
 * wieder so, wie sie vorher standen. Wer ihn stattdessen die anderen
 * überschreiben ließe, nähme dem Nutzer seine Einstellungen weg.
 */
export async function schalterSetzen(welcher: HinweisSchalter, an: boolean) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('profiles')
    .update({ [welcher]: an })
    .eq('id', user.id);

  if (error) console.error('[schalterSetzen]', error);

  revalidatePath('/du/einstellungen');
  revalidatePath('/', 'layout');
}
