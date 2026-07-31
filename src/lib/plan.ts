/**
 * Preismodell — Gerüst, PRO abgeschaltet.
 *
 * Deine Entscheidung war: schon einbauen, PRO deaktiviert lassen. Genau
 * das ist hier. Es gibt eine einzige Stelle, die weiß, welchen Plan
 * jemand hat, und alles andere fragt sie.
 *
 * Warum das jetzt schon existiert, obwohl niemand zahlen kann: Sobald
 * an fünf Stellen `if (irgendwas)` steht, um Werbung oder Grenzen zu
 * schalten, wird der Umbau später teuer. Eine Funktion umzustellen ist
 * billig.
 *
 * Seit dem 31.07. fragt `aktuellerPlan()` die Tabelle `subscriptions`.
 * Geschrieben wird sie ausschließlich vom Webhook des
 * Zahlungsanbieters — es gibt keine Schreibregel für angemeldete
 * Nutzer, sonst könnte sich jeder selbst ein Abo eintragen.
 */

import { cache } from 'react';

export type Plan = 'frei' | 'pro';

/** Was ein Plan freischaltet. Grenzen werden noch nicht erzwungen. */
export const GRENZEN = {
  frei: {
    /** Werbung im Feed. */
    werbung: true,
    /** Reisen gleichzeitig. null = ohne Grenze. */
    reisen: null as number | null,
    /** Fotos je Tag. */
    fotosJeTag: 20,
  },
  pro: {
    werbung: false,
    reisen: null as number | null,
    fotosJeTag: 200,
  },
} as const;

/**
 * Plan des angemeldeten Nutzers.
 *
 * `cache()` von React, nicht aus Bequemlichkeit: Diese Funktion wird
 * je Seitenaufruf mehrfach gefragt — von der Hülle für das Aussehen,
 * vom Feed für die Werbung, später von den Grenzen. Ohne die Klammer
 * wären das drei Abfragen für eine Antwort, die sich innerhalb einer
 * Anfrage nicht ändern kann.
 */
export const aktuellerPlan = cache(async (): Promise<Plan> => {
  const { createServerClient } = await import('./supabase-server');
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 'frei';

  const { data, error } = await supabase
    .from('subscriptions')
    .select('status, laeuft_bis')
    .eq('user_id', user.id)
    .maybeSingle();

  /*
   * Im Zweifel FREI. Fällt die Abfrage aus, sieht jemand Werbung und
   * verliert sein Material — ärgerlich, aber harmlos. Andersherum
   * bekäme bei jedem Aussetzer die ganze Welt PRO geschenkt.
   */
  if (error) {
    console.error('[aktuellerPlan]', error);
    return 'frei';
  }
  if (!data) return 'frei';

  /*
   * Bezahlt ist bezahlt — auch nach der Kündigung.
   *
   * Wer heute kündigt, hat bis zum Ende der Periode gezahlt und
   * behält PRO bis dahin. Ein gekündigtes Abo sofort abzuschalten
   * wäre Diebstahl, und `laeuft_bis` steht genau dafür da.
   *
   * `past_due` zählt ebenfalls: Der Anbieter versucht die Abbuchung
   * noch mehrere Tage. Jemandem wegen einer abgelaufenen Karte sofort
   * das Tagebuch umzufärben, wäre die falsche Reaktion auf ein
   * Problem, das sich meist von selbst löst.
   */
  const laufend = data.status === 'active' || data.status === 'trialing' || data.status === 'past_due';
  const nochBezahlt = data.laeuft_bis ? new Date(data.laeuft_bis) > new Date() : false;

  return laufend || nochBezahlt ? 'pro' : 'frei';
});

export async function istPro(): Promise<boolean> {
  return (await aktuellerPlan()) === 'pro';
}

/** Sieht dieser Nutzer Werbung? */
export async function zeigtWerbung(): Promise<boolean> {
  return GRENZEN[await aktuellerPlan()].werbung;
}

/* ============================================================
   Aussehen von PRO
   ============================================================ */

export type ProDesign = 'nordlicht';

export interface ProAussehen {
  /** `null` heißt: die Region entscheidet, so wie ohne PRO. */
  design: ProDesign | null;
  material: boolean;
  bewegung: boolean;
}

/** Ohne PRO trägt niemand Material — auch nicht, wer es eingestellt hat. */
const NICHTS: ProAussehen = { design: null, material: false, bewegung: false };

/**
 * Was am `<html>` stehen soll.
 *
 * DIE PRÜFUNG AUF PRO GEHÖRT HIERHIN, nicht in die Oberfläche. Die
 * Einstellungen bleiben in der Datenbank stehen, auch wenn ein Abo
 * ausläuft — wer später zurückkommt, findet sein Aussehen wieder
 * vor. Sichtbar wird es aber nur, solange `istPro()` wahr ist.
 *
 * Solange `istPro()` fest `false` liefert, gibt diese Funktion also
 * immer `NICHTS` zurück. Das ist richtig so: es gibt noch keine
 * Bezahlung. Zum Ausprobieren reicht es, in `aktuellerPlan()`
 * einmal `'pro'` zurückzugeben.
 */
export async function proAussehen(): Promise<ProAussehen> {
  if (!(await istPro())) return NICHTS;

  const { createServerClient } = await import('./supabase-server');
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NICHTS;

  const { data, error } = await supabase
    .from('profiles')
    .select('pro_design, pro_material, pro_bewegung')
    .eq('id', user.id)
    .maybeSingle();

  // Ohne diese Zeile sähe eine fehlende Migration wie „kein PRO" aus.
  if (error) {
    console.error('[proAussehen]', error);
    return NICHTS;
  }

  return {
    design: (data?.pro_design as ProDesign | null) ?? null,
    material: data?.pro_material ?? true,
    bewegung: data?.pro_bewegung ?? false,
  };
}
