/**
 * Der Feed.
 *
 * Kaltstart-Problem, bewusst gelöst: Solange es kaum Beiträge gibt,
 * wird chronologisch sortiert. Ein Algorithmus ohne Datenmenge ist
 * schlechter als keiner. Die Gewichtung steht schon da, greift aber
 * erst ab genug Beiträgen.
 */

import { createServerClient } from '@/lib/supabase-server';
import { regionForCountry, type RegionOrNeutral } from '@/themes/regions';

export interface Beitrag {
  id: string;
  eintragId: string;
  text: string;
  votes: number;
  selbstGevotet: boolean;
  verfasser: { name: string; benutzername: string; bild: string | null };
  tag: { datum: string; titel: string | null; ort: string | null };
  region: RegionOrNeutral;
  foto: { pfad: string; breite: number; hoehe: number; blurhash: string | null } | null;
}

const SCHWELLE_FUER_ALGORITHMUS = 200;

export async function ladeFeed(): Promise<Beitrag[]> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count } = await supabase.from('posts').select('id', { count: 'exact', head: true });
  const chronologisch = (count ?? 0) < SCHWELLE_FUER_ALGORITHMUS;

/*
 * WARUM HIER DER FREMDSCHLÜSSEL AUSDRÜCKLICH DASTEHT
 *
 * `profiles(...)` allein genügt nicht. Es gibt zwei Wege von `posts`
 * nach `profiles`:
 *
 *   1. posts_user_id_fkey  — posts.user_id → profiles.id   (gewollt)
 *   2. über `votes`        — votes.post_id → posts und
 *                            votes.user_id → profiles      (Zufall)
 *
 * PostgREST kann nicht wählen und antwortet mit HTTP 300:
 *
 *   PGRST201: Could not embed because more than one relationship
 *             was found for 'posts' and 'profiles'
 *
 * Die alte Fassung prüfte nur `if (!data) return []`. Ergebnis: Feed,
 * Profilseiten und Einzelbeitrag waren dauerhaft leer, ohne Fehler in
 * Konsole oder Terminal. Es sah aus, als hätte niemand etwas geteilt —
 * dabei standen die Beiträge längst in der Datenbank.
 *
 * Merke: Sobald eine Tabelle über eine Zwischentabelle wie `votes`
 * oder `follows` ein zweites Mal auf `profiles` zeigt, muss der
 * Fremdschlüssel benannt werden.
 */
  const { data, error } = await supabase
    .from('posts')
    .select(
      `id, entry_id, caption, vote_count, published_at,
       profiles!posts_user_id_fkey(username, display_name, avatar_url),
       entries(entry_date, title, place_name,
               trips(region_override, trip_countries(country_code, days)),
               blocks(kind, position, photos(r2_key, width, height, blurhash)))`,
    )
    .order(chronologisch ? 'published_at' : 'vote_count', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[ladeFeed] Feed-Abfrage fehlgeschlagen:', error);
    return [];
  }
  if (!data) return [];

  let eigene = new Set<string>();
  if (user) {
    const { data: v } = await supabase.from('votes').select('post_id').eq('user_id', user.id);
    eigene = new Set((v ?? []).map((x) => x.post_id));
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  return (data as any[]).map((p) => {
    const eintrag = p.entries;
    const laender = eintrag?.trips?.trip_countries ?? [];
    const erstesFoto = (eintrag?.blocks ?? [])
      .filter((b: any) => b.kind === 'photo' && b.photos)
      .sort((a: any, b: any) => a.position - b.position)[0]?.photos;

    return {
      id: p.id,
      eintragId: p.entry_id,
      text: p.caption ?? '',
      votes: p.vote_count ?? 0,
      selbstGevotet: eigene.has(p.id),
      verfasser: {
        name: p.profiles?.display_name || p.profiles?.username || 'Jemand',
        benutzername: p.profiles?.username ?? '',
        bild: p.profiles?.avatar_url ?? null,
      },
      tag: {
        datum: eintrag?.entry_date ?? '',
        titel: eintrag?.title ?? null,
        ort: eintrag?.place_name ?? null,
      },
      region:
        (eintrag?.trips?.region_override as RegionOrNeutral | null) ??
        regionForCountry(laender[0]?.country_code),
      foto: erstesFoto
        ? {
            pfad: erstesFoto.r2_key,
            breite: erstesFoto.width,
            hoehe: erstesFoto.height,
            blurhash: erstesFoto.blurhash,
          }
        : null,
    };
  });
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
