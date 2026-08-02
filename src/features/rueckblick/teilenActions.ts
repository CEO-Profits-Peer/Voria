'use server';

/**
 * Den Jahresrückblick teilen — und wieder zurückziehen.
 *
 * ═══════════════════════════════════════════════════════════════
 * WAS GETEILT WIRD, UND VOR ALLEM: WAS NICHT
 * ═══════════════════════════════════════════════════════════════
 *
 * Der Rückblick in der App zeigt „längste Reise" und „längster Tag"
 * mit Titel und Ort. Das ist selbstgeschriebener Text aus Tagen, die
 * privat sein können — er darf niemals auf einer öffentlichen Seite
 * landen.
 *
 * Deshalb wird hier eine erstarrte Kopie abgelegt, die AUSSCHLIESSLICH
 * Zahlen und Ländercodes enthält. Was in `OeffentlicherRueckblick`
 * nicht steht, kann später auch nicht herausrutschen — selbst dann
 * nicht, wenn der Rückblick in der App irgendwann mehr zeigt.
 *
 * Wer den Link weitergibt, gibt also weiter: wie viele Tage, wie viele
 * Worte, wie viele Fotos, in welchen Ländern. Nichts, was jemand
 * geschrieben hat.
 */

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase-server';
import { ladeRueckblick } from './queries';
import type { RegionOrNeutral } from '@/themes/regions';

/** Genau das und nichts anderes geht nach draußen. */
export interface OeffentlicherRueckblick {
  tage: number;
  worte: number;
  fotos: number;
  laender: string[];
  regionen: RegionOrNeutral[];
  reisen: number;
}

export async function rueckblickTeilen(jahr: number): Promise<string | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const voll = await ladeRueckblick(jahr);

  /*
   * HIER wird ausgewählt, und nur hier. Kein `...voll`, kein
   * Durchreichen des ganzen Objekts — sonst wanderten Titel und Orte
   * mit, sobald jemand oben ein Feld ergänzt.
   */
  const daten: OeffentlicherRueckblick = {
    tage: voll.tage,
    worte: voll.worte,
    fotos: voll.fotos,
    laender: voll.laender,
    regionen: voll.regionen,
    reisen: voll.laengsteReise ? 1 : 0,
  };

  const { data: profil } = await supabase
    .from('profiles')
    .select('username, display_name')
    .eq('id', user.id)
    .maybeSingle();

  const { data, error } = await supabase
    .from('rueckblick_geteilt')
    .upsert(
      {
        user_id: user.id,
        jahr,
        daten,
        /* Der Name steht dabei, damit die Seite nicht anonym wirkt —
           aber der Benutzername genügt, keine E-Mail, kein Bild. */
        anzeigename: profil?.display_name || profil?.username || '',
      },
      { onConflict: 'user_id,jahr' },
    )
    .select('token')
    .maybeSingle();

  if (error || !data) {
    console.error('[rueckblickTeilen]', error);
    return null;
  }

  revalidatePath(`/rueckblick/${jahr}`);
  return data.token;
}

/** Zurückziehen. Der Link führt danach ins Leere — sofort. */
export async function rueckblickZurueckziehen(jahr: number) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('rueckblick_geteilt')
    .delete()
    .eq('user_id', user.id)
    .eq('jahr', jahr);

  if (error) console.error('[rueckblickZurueckziehen]', error);

  revalidatePath(`/rueckblick/${jahr}`);
}

/** Gibt es schon einen Link für dieses Jahr? */
export async function rueckblickToken(jahr: number): Promise<string | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('rueckblick_geteilt')
    .select('token')
    .eq('user_id', user.id)
    .eq('jahr', jahr)
    .maybeSingle();

  return data?.token ?? null;
}
