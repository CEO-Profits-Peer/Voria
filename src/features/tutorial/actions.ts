'use server';

/**
 * Den Stand der Führung merken.
 *
 * Am Profil und nicht im Browser: Wer sie am Rechner weggeklickt hat,
 * soll sie am Handy nicht wiedersehen.
 */

import { createServerClient } from '@/lib/supabase-server';

export async function tutorialSchritt(schritt: number) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('profiles')
    .update({ tutorial_schritt: schritt })
    .eq('id', user.id);

  if (error) console.error('[tutorialSchritt]', error);
}

/**
 * Durchgelaufen ODER übersprungen — beides ist eine Entscheidung und
 * wird gleich behandelt. Noch einmal zu fragen wäre in beiden Fällen
 * aufdringlich.
 */
export async function tutorialBeenden() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('profiles')
    .update({ tutorial_fertig: true })
    .eq('id', user.id);

  if (error) console.error('[tutorialBeenden]', error);
}

/** Von Hand noch einmal starten — aus den Einstellungen heraus. */
export async function tutorialNeu() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('profiles')
    .update({ tutorial_fertig: false, tutorial_schritt: 0 })
    .eq('id', user.id);

  if (error) console.error('[tutorialNeu]', error);
}
