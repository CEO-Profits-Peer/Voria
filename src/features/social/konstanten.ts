/**
 * Werte, die Server UND Browser brauchen.
 *
 * DIESE DATEI DARF NICHTS IMPORTIEREN. Sie steht getrennt, weil
 * `queries.ts` über `createServerClient` an `next/headers` hängt — eine
 * Client-Komponente, die von dort auch nur eine Zahl holt, zieht den
 * gesamten Server-Client ins Browser-Bündel und der Build bricht ab mit
 *
 *   You're importing a component that needs "next/headers"
 *
 * Die Meldung nennt dabei `pages/`, das es in diesem Projekt gar nicht
 * gibt — sie führt also in die Irre. Genau dieser Fehler hat den ersten
 * Build dieses Projekts abgebrochen (`FORTSCHRITT.md`, Nummer 1).
 *
 * `tsc --noEmit` bemerkt das nicht. Nur `npm run build`.
 */

/**
 * Wie viele Beiträge der Feed auf einmal lädt.
 *
 * Zehn, nicht fünfzig: sonst lädt der erste Aufruf Fotos für Karten,
 * die niemand ansieht. Nachgeladen wird, sobald der Leser die erste
 * Karte des letzten Stapels erreicht — dann liegen noch neun vor ihm,
 * und das Nachladen fällt nicht auf.
 */
export const SEITE = 10;

/**
 * Die beiden Reiter über dem Feed.
 *
 * `fuerdich` ist der offene Feed samt Kaltstart-Regel. `folgeich`
 * zeigt ausschließlich Beiträge von Gefolgten, immer chronologisch —
 * dort ist die Auswahl schon getroffen, eine Gewichtung obendrauf
 * würde nur verbergen, was man ausdrücklich sehen wollte.
 */
export type Reiter = 'fuerdich' | 'folgeich' | 'entdecken';

/** Aus dem Adressfeld, das dort alles stehen kann. */
export function alsReiter(wert: string | undefined): Reiter {
  return wert === 'folgeich' || wert === 'entdecken' ? wert : 'fuerdich';
}

/**
 * „Entdecken" holt einen größeren Vorrat, weil danach in TypeScript
 * gefiltert wird — welche Region ein Beitrag trägt, rechnet
 * `regionForTrip` aus den Ländern seiner Reise aus, und das kann die
 * Datenbankfunktion nicht.
 *
 * Bei einem größeren Bestand gehört diese Rechnung als abgeleitete
 * Spalte nach Postgres. Solange es zweistellig viele Beiträge sind,
 * wäre das Aufwand ohne Gegenwert.
 */
export const ENTDECKEN_VORRAT = 60;
