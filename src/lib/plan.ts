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
 * WICHTIG: `istPro()` gibt heute immer `false` zurück. Es gibt keine
 * Bezahlung, keine Tabelle, keinen Webhook. Wenn das kommt, wird HIER
 * aus dem `false` eine Abfrage — und sonst nirgends etwas.
 */

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
 * Bewusst `async`, obwohl heute nichts abgefragt wird — sonst müsste
 * jeder Aufrufer umgeschrieben werden, sobald eine Datenbankabfrage
 * dazukommt.
 */
export async function aktuellerPlan(): Promise<Plan> {
  return 'frei';
}

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
