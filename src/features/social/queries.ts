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
  verfasser: { name: string; benutzername: string };
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

  const { data } = await supabase
    .from('posts')
    .select(
      `id, entry_id, caption, vote_count, published_at,
       profiles(username, display_name),
       entries(entry_date, title, place_name,
               trips(region_override, trip_countries(country_code, days)),
               blocks(kind, position, photos(r2_key, width, height, blurhash)))`,
    )
    .order(chronologisch ? 'published_at' : 'vote_count', { ascending: false })
    .limit(50);

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
