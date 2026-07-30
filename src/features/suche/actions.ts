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
 * Eine Zeile, wie `leute_suchen` sie liefert — die Spalten von
 * `profiles`, noch nicht umbenannt. Die Funktion gibt `setof profiles`
 * zurück, also kommt hier alles an, was die Tabelle hat.
 */
interface Person0 {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
}

/**
 * Die Platzhalter von LIKE entschärfen.
 *
 * Die Werte gehen als gebundene Parameter an `leute_suchen`, eine
 * Umschreibung der Bedingung ist also nicht mehr möglich. `%` und `_`
 * bleiben trotzdem gefährlich für das Ergebnis: Wer `%` eintippt,
 * bekäme sonst jedes Profil zurück, weil die Funktion daraus
 * `'%' || '%' || '%'` baut.
 */
function filterSicher(wort: string): string {
  return wort.replace(/[^\p{L}\p{N}.\- ]/gu, '').trim();
}

/**
 * Profile über Benutzernamen und Anzeigenamen finden — auch bei
 * Tippfehlern.
 *
 * Kein Volltextindex wie bei den Tagen: Namen werden nicht gebeugt.
 * Gesucht wird über die Datenbankfunktion aus Migration `0007`, weil
 * `similarity()` sich über PostgREST weder filtern noch sortieren
 * lässt — und die Ähnlichkeit ist genau das, wonach sortiert werden
 * muss. „marakesh" findet damit „Marrakesch".
 *
 * Private Profile kommen nicht zurück. Dafür sorgt `profiles_read` in
 * der Datenbank, und dafür ist die Funktion `security invoker` — mit
 * `definer` käme jedes private Profil durch, und die Suche sähe dabei
 * nur „besser" aus.
 */
export async function leuteSuchen(wort: string): Promise<Person[]> {
  const sauber = filterSicher(wort);
  if (sauber.length < 2) return [];

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: roh, error } = await supabase.rpc('leute_suchen', {
    wort: sauber,
    hoechstens: 20,
  });

  if (error) {
    console.error('[leuteSuchen]', error);
    return [];
  }
  if (!roh || roh.length === 0) return [];

  /*
   * Sich selbst zu finden hilft niemandem. Die Aussortierung steht
   * hier und nicht in der Funktion, damit dieselbe Funktion später
   * auch dort taugt, wo das eigene Profil dazugehört — etwa bei
   * Erwähnungen mit `@`.
   */
  const data = (roh as Person0[]).filter((p) => p.id !== user?.id);
  if (data.length === 0) return [];

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
   * HIER WIRD NICHT MEHR SORTIERT.
   *
   * Vorher stand an dieser Stelle eine Sortierung nach Anfangstreffer
   * und Followerzahl. Sie muss weg, seit die Datenbank nach
   * Ähnlichkeit ordnet: Ein Tippfehlertreffer fängt naturgemäß NICHT
   * mit dem Suchwort an — „marakesh" gegen „Marrakesch" —, wäre also
   * ans Ende gerutscht und die ganze Migration 0007 wirkungslos
   * gewesen. Genau die Sorte Fehler, die niemand meldet, weil das
   * Ergebnis ja irgendwie plausibel aussieht.
   *
   * `leute_suchen` ordnet: Anfangstreffer zuerst, dann die beste
   * Ähnlichkeit, dann alphabetisch. Die Followerzahl ist damit kein
   * Stichentscheid mehr — Ähnlichkeit ist der bessere.
   */
  return treffer;
}
