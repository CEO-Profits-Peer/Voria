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

/* ============================================================
   Leute suchen
   ============================================================ */

export interface Person {
  id: string;
  benutzername: string;
  name: string;
  bio: string | null;
  bild: string | null;
  folgtBereits: boolean;
  folgen: number;
}

/**
 * Zeichen entfernen, die die Filtersyntax von PostgREST zerlegen.
 *
 * `or=(username.ilike.%x%,display_name.ilike.%x%)` ist eine
 * Zeichenkette, die serverseitig geparst wird. Ein Komma oder eine
 * Klammer aus der Eingabe würde die Bedingung umschreiben — nicht
 * gefährlich für die Datenbank, weil Row Level Security darüber liegt,
 * aber die Suche liefert dann Unsinn oder einen Fehler.
 *
 * Deshalb bleiben nur Buchstaben, Ziffern, Unterstrich, Punkt,
 * Bindestrich und Leerzeichen übrig. Umlaute ausdrücklich erlaubt —
 * Anzeigenamen enthalten sie.
 */
function filterSicher(wort: string): string {
  return wort.replace(/[^\p{L}\p{N}_.\- ]/gu, '').trim();
}

/**
 * Profile über Benutzernamen und Anzeigenamen finden.
 *
 * Kein Volltextindex wie bei den Tagen: Namen werden nicht gebeugt,
 * hier zählt Teilübereinstimmung. `ilike` mit führendem Platzhalter
 * kann keinen B-Baum nutzen, deshalb liegt in Migration 0005 ein
 * Trigramm-Index darauf.
 *
 * Private Profile kommen nicht zurück — dafür sorgt `profiles_read`
 * in der Datenbank, nicht diese Funktion.
 */
export async function leuteSuchen(wort: string): Promise<Person[]> {
  const sauber = filterSicher(wort);
  if (sauber.length < 2) return [];

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const muster = `%${sauber}%`;
  let abfrage = supabase
    .from('profiles')
    .select('id, username, display_name, bio, avatar_url')
    .or(`username.ilike.${muster},display_name.ilike.${muster}`)
    .limit(20);

  // Sich selbst zu finden hilft niemandem.
  if (user) abfrage = abfrage.neq('id', user.id);

  const { data, error } = await abfrage;

  if (error) {
    console.error('[leuteSuchen]', error);
    return [];
  }
  if (!data || data.length === 0) return [];

  const ids = data.map((p) => p.id);

  /*
   * Follower zählen und eigene Verbindungen holen — zwei Abfragen für
   * alle Treffer, nicht eine pro Person. Bei zwanzig Treffern wären
   * das sonst vierzig Abfragen für eine Tastatureingabe.
   */
  const [{ data: folgenRohe }, { data: meine }] = await Promise.all([
    supabase.from('follows').select('followee_id').in('followee_id', ids),
    user
      ? supabase.from('follows').select('followee_id').eq('follower_id', user.id).in('followee_id', ids)
      : Promise.resolve({ data: [] as { followee_id: string }[] }),
  ]);

  const zahl = new Map<string, number>();
  for (const f of folgenRohe ?? []) {
    zahl.set(f.followee_id, (zahl.get(f.followee_id) ?? 0) + 1);
  }
  const folgeIch = new Set((meine ?? []).map((f) => f.followee_id));

  const treffer: Person[] = data.map((p) => ({
    id: p.id,
    benutzername: p.username,
    name: p.display_name || p.username,
    bio: p.bio || null,
    bild: p.avatar_url ?? null,
    folgtBereits: folgeIch.has(p.id),
    folgen: zahl.get(p.id) ?? 0,
  }));

  /*
   * Sortierung: was am Anfang des Namens passt, ist wahrscheinlich
   * gemeint. „anna" soll `anna` vor `marianna` zeigen. Erst danach
   * zählt, wie vielen Leuten jemand folgt — das ist nur ein
   * Stichentscheid, keine Beliebtheitsrangliste.
   */
  const klein = sauber.toLowerCase();
  return treffer.sort((a, b) => {
    const rang = (p: Person) =>
      p.benutzername.toLowerCase().startsWith(klein) || p.name.toLowerCase().startsWith(klein) ? 0 : 1;
    return rang(a) - rang(b) || b.folgen - a.folgen || a.benutzername.localeCompare(b.benutzername);
  });
}
