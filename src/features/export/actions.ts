'use server';

/**
 * Die Brücke vom Browser zur Abfrage.
 *
 * `queries.ts` hängt über `createServerClient` an `next/headers` und
 * ist aus einer Client-Komponente deshalb unerreichbar — dieselbe
 * Grenze wie bei `konstanten.ts` im Feed. Eine Server-Action darf
 * beides sehen und reicht nur das Ergebnis weiter.
 */

import { ladeAllesZumMitnehmen, type ExportDaten } from './queries';

export async function holeExportDaten(): Promise<ExportDaten | null> {
  return ladeAllesZumMitnehmen();
}
