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
