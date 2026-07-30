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
