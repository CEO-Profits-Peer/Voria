'use server';

/**
 * Aussehen von PRO speichern.
 *
 * Ob jemand PRO HAT, prüft diese Datei bewusst nicht. Die Einstellung
 * darf auch dann gesetzt werden, wenn kein Abo läuft — sichtbar wird
 * sie erst über `proAussehen()`, und das fragt `istPro()`.
 *
 * Der Grund: Läuft ein Abo aus und kommt später wieder, findet
 * jemand sein Aussehen unverändert vor. Eine Vorliebe zu löschen,
 * weil eine Zahlung ausbleibt, wäre kleinlich — und es widerspräche
 * der Regel, dass PRO begrenzt, was man anlegt, nicht was einem
 * gehört.
 */

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase-server';

/** Genau die drei Spalten aus `0010_pro_design.sql`. */
export type ProFeld = 'pro_design' | 'pro_material' | 'pro_bewegung';

export async function proWahlSetzen(feld: ProFeld, wert: string | boolean | null) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  /*
   * Die Werte werden geprüft, statt durchgereicht zu werden. `feld`
   * kommt aus dem Browser und landet als Spaltenname in der Abfrage —
   * ohne diese Schranke ließe sich damit jede Spalte von `profiles`
   * beschreiben, etwa `username`.
   */
  const erlaubt: Record<ProFeld, (w: unknown) => boolean> = {
    pro_design: (w) => w === null || w === 'nordlicht',
    pro_material: (w) => typeof w === 'boolean',
    pro_bewegung: (w) => typeof w === 'boolean',
  };

  if (!(feld in erlaubt) || !erlaubt[feld](wert)) {
    console.error('[proWahlSetzen] Unerlaubt:', feld, wert);
    return;
  }

  const { error } = await supabase
    .from('profiles')
    .update({ [feld]: wert })
    .eq('id', user.id);

  if (error) console.error('[proWahlSetzen]', error);

  /*
   * `layout`, weil Design und Material am <html> hängen — sie werden
   * in der Wurzel gesetzt, nicht auf der Einstellungsseite. Ohne das
   * bliebe die übrige App im alten Aussehen, bis jemand neu lädt.
   */
  revalidatePath('/', 'layout');
}
