/**
 * Wann der PRO-Streifen erscheinen darf.
 *
 * Die Regeln stehen als Zahlen hier und nirgends sonst — damit sich
 * eine Entscheidung ändern lässt, ohne sie zu suchen.
 *
 * Entschieden am 30.07.:
 *   * höchstens zweimal je Woche
 *   * nie, während jemand schreibt (das entscheidet der Aufrufer:
 *     der Streifen wird schlicht nicht im Log eingebunden)
 *   * nach dem dritten Wegwischen drei Monate Ruhe
 *
 * Die verworfene Alternative war „alle ein bis drei Stunden". Ein
 * Reisetagebuch wird abends für zehn Minuten geöffnet — das hieße,
 * dass praktisch jedes Öffnen mit einem Verkaufsgespräch beginnt.
 */

import { createServerClient } from '@/lib/supabase-server';
import { istPro } from '@/lib/plan';

/** Zweimal je Woche heißt: frühestens alle dreieinhalb Tage. */
const ABSTAND_STUNDEN = 84;

/** Nach so vielen „nein" ist Schluss. */
const GENUG = 3;

/** Und dann für so lange. */
const RUHE_TAGE = 90;

export interface StreifenStand {
  zeigen: boolean;
}

/**
 * Darf der Streifen jetzt erscheinen?
 *
 * Bewusst NICHT im Log aufrufen. Wer schreibt, soll nicht gefragt
 * werden — das ist keine Einstellung, sondern eine Frage des Ortes.
 */
export async function darfStreifenErscheinen(): Promise<StreifenStand> {
  /* Wer PRO hat, bekommt keine Werbung dafür. */
  if (await istPro()) return { zeigen: false };

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { zeigen: false };

  const { data, error } = await supabase
    .from('profiles')
    .select('pro_streifen_zuletzt, pro_streifen_weg, pro_streifen_ruhe_bis')
    .eq('id', user.id)
    .maybeSingle();

  /*
   * Im Zweifel NICHT zeigen. Fällt die Abfrage aus, sieht jemand
   * keinen Hinweis — das kostet vielleicht einen Verkauf. Andersherum
   * bekäme bei jedem Aussetzer jeder den Streifen bei jedem Aufruf,
   * und genau das war die verworfene Variante.
   */
  if (error || !data) {
    if (error) console.error('[darfStreifenErscheinen]', error);
    return { zeigen: false };
  }

  const jetzt = Date.now();

  if (data.pro_streifen_ruhe_bis && new Date(data.pro_streifen_ruhe_bis).getTime() > jetzt) {
    return { zeigen: false };
  }

  if (data.pro_streifen_zuletzt) {
    const her = jetzt - new Date(data.pro_streifen_zuletzt).getTime();
    if (her < ABSTAND_STUNDEN * 3600_000) return { zeigen: false };
  }

  return { zeigen: true };
}

export const STREIFEN_REGELN = { ABSTAND_STUNDEN, GENUG, RUHE_TAGE };
