'use server';

import { createServerClient } from '@/lib/supabase-server';
import { regionForCountry, type RegionOrNeutral } from '@/themes/regions';

export interface Treffer {
  id: string;
  reiseId: string;
  reiseTitel: string;
  datum: string;
  titel: string | null;
  ort: string | null;
  auszug: string | null;
  region: RegionOrNeutral;
}

/**
 * Volltextsuche mit deutschen Wortstämmen — „Regen" findet auch
 * „regnete". Row Level Security sorgt dafür, dass nur eigene und
 * öffentliche Einträge zurückkommen.
 */
export async function suchen(wort: string): Promise<Treffer[]> {
  if (wort.trim().length < 2) return [];

  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('entries')
    .select(
      'id, trip_id, entry_date, title, place_name, such_text, trips(title, region_override, trip_countries(country_code))',
    )
    .textSearch('suche', wort, { type: 'websearch', config: 'german' })
    .order('entry_date', { ascending: false })
    .limit(40);

  if (error || !data) return [];

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return (data as any[]).map((e) => ({
    id: e.id,
    reiseId: e.trip_id,
    reiseTitel: e.trips?.title || 'Ohne Titel',
    datum: e.entry_date,
    titel: e.title,
    ort: e.place_name,
    auszug: auszugUm(e.such_text ?? '', wort),
    region:
      (e.trips?.region_override as RegionOrNeutral | null) ??
      regionForCountry(e.trips?.trip_countries?.[0]?.country_code),
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */
}

/** Ein kurzer Ausschnitt rund um den Fund, an Wortgrenzen geschnitten. */
function auszugUm(text: string, wort: string): string | null {
  if (!text) return null;
  const suchbegriff = wort.split(/\s+/)[0].toLowerCase();
  const stelle = text.toLowerCase().indexOf(suchbegriff);

  if (stelle < 0) return text.slice(0, 140).trim() + (text.length > 140 ? ' …' : '');

  const von = Math.max(0, stelle - 60);
  const bis = Math.min(text.length, stelle + 100);
  return (von > 0 ? '… ' : '') + text.slice(von, bis).trim() + (bis < text.length ? ' …' : '');
}
