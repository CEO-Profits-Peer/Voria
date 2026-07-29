/**
 * Client-sichere Hälfte von „Deine Welt".
 *
 * Typen und reine Hilfsfunktionen, die sowohl der Server (queries.ts)
 * als auch Client-Komponenten (WeltRaster.tsx) brauchen.
 *
 * Wichtig: Diese Datei darf NIEMALS etwas aus '@/lib/supabase-server'
 * oder 'next/headers' importieren. Sonst zieht ein 'use client'-Modul
 * den Server-Code mit in den Browser-Bundle und der Build bricht ab.
 */

import type { Region } from '@/themes/regions';

export interface RegionStand {
  region: Region;
  laender: string[];
  tage: number;
  reisen: number;
}

export interface Welt {
  regionen: RegionStand[];
  laenderGesamt: number;
  tageGesamt: number;
  reisenGesamt: number;
  ersteReise: string | null;
}

/** Deutsche Ländernamen, ohne zusätzliche Abhängigkeit. */
export function landName(code: string): string {
  try {
    return new Intl.DisplayNames(['de'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}
