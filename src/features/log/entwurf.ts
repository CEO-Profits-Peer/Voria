/**
 * Der Text ist nie weg.
 *
 * ═══════════════════════════════════════════════════════════════
 * DAS PROBLEM, DAS DAS HIER LÖST
 * ═══════════════════════════════════════════════════════════════
 *
 * In `docs/GESAMTBESCHREIBUNG.md` steht:
 *
 *   „Ein Reisetagebuch wird genau dann benutzt, wenn kein Netz da
 *    ist — abends im Hostel, im Zug, auf einer Fähre. Eine App, die
 *    dann eine Fehlerseite zeigt, hat versagt."
 *
 * Der Service Worker hielt bisher nur das LESEN offline am Laufen.
 * Beim Schreiben lief es so: tippen, 900 ms warten, `textSpeichern`
 * scheitert still, `catch` gibt es keinen — und der Absatz ist beim
 * nächsten Laden fort. Ohne Meldung, ohne Spur.
 *
 * ═══════════════════════════════════════════════════════════════
 * DER ANSATZ: ERST AUFS GERÄT, DANN INS NETZ
 * ═══════════════════════════════════════════════════════════════
 *
 * Jeder Anschlag geht sofort in den lokalen Speicher — das kostet
 * nichts und kann nicht fehlschlagen. Erst danach versucht die App zu
 * senden. Klappt das, wird der Entwurf gelöscht. Klappt es nicht,
 * bleibt er liegen und wird beim nächsten Öffnen wieder eingesetzt.
 *
 * Warum `localStorage` und nicht IndexedDB: Es geht um Text, nicht um
 * Fotos. `localStorage` ist synchron, überall vorhanden und kennt
 * keine Migrationen. Für Fotos wäre es falsch — die liegen ohnehin
 * schon auf dem Gerät, bis der Upload durch ist.
 *
 * WAS DAS HIER NICHT IST: eine Synchronisierung. Zwei Geräte, die
 * denselben Tag offline ändern, laufen weiterhin auseinander. Das
 * steht als offene Frage in `docs/ENTSCHEIDUNGEN.md` und ist ein
 * eigenes Stück Arbeit.
 */

const VORSATZ = 'voria-entwurf:';

export interface Entwurf {
  text: string;
  /** Millisekunden seit 1970. Entscheidet, wer gewinnt. */
  wann: number;
}

/** Ein Schlüssel je Eintrag und Block. */
function schluessel(eintragId: string, blockId: string | null): string {
  return `${VORSATZ}${eintragId}:${blockId ?? 'neu'}`;
}

/**
 * Sofort ablegen. Wird bei JEDEM Anschlag gerufen, muss also billig
 * und darf niemals werfen — ein voller Speicher oder ein privates
 * Fenster ohne Schreibrecht sind kein Grund, das Tippen zu stören.
 */
export function entwurfMerken(eintragId: string, blockId: string | null, text: string): void {
  try {
    const wert: Entwurf = { text, wann: Date.now() };
    localStorage.setItem(schluessel(eintragId, blockId), JSON.stringify(wert));
  } catch {
    /* Bewusst still. Siehe oben. */
  }
}

/** Nach erfolgreichem Sichern wegräumen. */
export function entwurfVergessen(eintragId: string, blockId: string | null): void {
  try {
    localStorage.removeItem(schluessel(eintragId, blockId));
  } catch {
    /* dito */
  }
}

/**
 * Was beim Öffnen im Feld stehen soll.
 *
 * Der Entwurf gewinnt, wenn es einen gibt und er sich vom Server
 * unterscheidet. Begründung: Ein Entwurf liegt nur dann noch da, wenn
 * das Sichern NICHT durchgekommen ist — er ist damit zwangsläufig der
 * jüngere Stand.
 *
 * Ist er identisch, wird er weggeräumt: Dann hat der Server ihn doch
 * bekommen, und ein Entwurf, der nichts Neues enthält, soll nicht
 * ewig liegen bleiben.
 */
export function entwurfOderServer(
  eintragId: string,
  blockId: string | null,
  vomServer: string,
): { text: string; wiederhergestellt: boolean } {
  try {
    const roh = localStorage.getItem(schluessel(eintragId, blockId));
    if (!roh) return { text: vomServer, wiederhergestellt: false };

    const entwurf = JSON.parse(roh) as Entwurf;
    if (typeof entwurf?.text !== 'string') return { text: vomServer, wiederhergestellt: false };

    if (entwurf.text === vomServer) {
      entwurfVergessen(eintragId, blockId);
      return { text: vomServer, wiederhergestellt: false };
    }

    return { text: entwurf.text, wiederhergestellt: true };
  } catch {
    return { text: vomServer, wiederhergestellt: false };
  }
}

/**
 * Liegt überhaupt noch etwas Ungesendetes herum?
 *
 * Für einen Hinweis an anderer Stelle gedacht — etwa „ein Tag wartet
 * noch darauf, gesichert zu werden".
 */
export function offeneEntwuerfe(): number {
  try {
    let n = 0;
    for (let i = 0; i < localStorage.length; i++) {
      if (localStorage.key(i)?.startsWith(VORSATZ)) n++;
    }
    return n;
  } catch {
    return 0;
  }
}
