/**
 * „Deine Welt" — was aus den Reisen an Geografie herausfällt.
 *
 * Bewusst keine Kachelkarte. Eine echte Weltkarte bräuchte einen
 * Kartendienst, kostet Ladezeit, funktioniert offline nicht und sieht
 * überall gleich aus. Voria zeigt stattdessen die zwölf Regionen im
 * jeweils eigenen Theme — dieselbe Information, aber als etwas, das
 * nur Voria kann.
 */

// NUR SERVER. Diese Datei importiert next/headers und darf niemals
// aus einer 'use client'-Komponente importiert werden. Gemeinsame
// Typen und Helfer liegen deshalb in ./typen.ts.
import { createServerClient } from '@/lib/supabase-server';
import { regionForCountry, REGIONS, type Region } from '@/themes/regions';
import type { RegionStand, Welt } from './typen';

export type { RegionStand, Welt } from './typen';
export { landName } from './typen';

export async function ladeWelt(): Promise<Welt> {
  const supabase = await createServerClient();

  // Filter auf user_id nötig: trips_read lässt auch fremde
  // ÖFFENTLICHE Reisen durch. „Deine Welt" hätte sonst Länder
  // eingefärbt, in denen andere Leute waren.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      regionen: REGIONS.map((region) => ({ region, laender: [], tage: 0, reisen: 0 })),
      laenderGesamt: 0,
      tageGesamt: 0,
      reisenGesamt: 0,
      ersteReise: null,
    };
  }

  const { data } = await supabase
    .from('trips')
    .select('id, started_on, trip_countries(country_code, days), entries(id)')
    .eq('user_id', user.id);

  const stand = new Map<Region, RegionStand>();
  for (const r of REGIONS) stand.set(r, { region: r, laender: [], tage: 0, reisen: 0 });

  let tageGesamt = 0;
  let ersteReise: string | null = null;
  const alleLaender = new Set<string>();

  for (const reise of data ?? []) {
    const laender = (reise.trip_countries ?? []) as { country_code: string; days: number }[];
    const tage = (reise.entries ?? []).length;
    tageGesamt += tage;

    if (reise.started_on && (!ersteReise || reise.started_on < ersteReise)) {
      ersteReise = reise.started_on;
    }

    const beruehrt = new Set<Region>();
    for (const l of laender) {
      const code = l.country_code.toUpperCase();
      alleLaender.add(code);
      const region = regionForCountry(code);
      if (region === 'neutral') continue;

      const eintrag = stand.get(region)!;
      if (!eintrag.laender.includes(code)) eintrag.laender.push(code);
      eintrag.tage += l.days;
      beruehrt.add(region);
    }
    for (const r of beruehrt) stand.get(r)!.reisen += 1;
  }

  return {
    regionen: [...stand.values()],
    laenderGesamt: alleLaender.size,
    tageGesamt,
    reisenGesamt: (data ?? []).length,
    ersteReise,
  };
}

