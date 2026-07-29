/**
 * Beiträge eines Profils und ein einzelner Beitrag.
 *
 * Teilt sich die Aufbereitung mit dem Feed — dieselbe Form, damit
 * `BeitragKarte` überall funktioniert.
 */

import { createServerClient } from '@/lib/supabase-server';
import { regionForCountry, type RegionOrNeutral } from '@/themes/regions';
import type { Beitrag } from './queries';

const AUSWAHL = `id, entry_id, caption, vote_count, published_at,
  profiles(username, display_name),
  entries(entry_date, title, place_name,
          trips(region_override, trip_countries(country_code, days)),
          blocks(kind, position, photos(r2_key, width, height, blurhash)))`;

export async function ladeProfilBeitraege(profilId: string): Promise<Beitrag[]> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from('posts')
    .select(AUSWAHL)
    .eq('user_id', profilId)
    .order('published_at', { ascending: false })
    .limit(50);

  return formen(data ?? [], await eigeneVotes(user?.id));
}

export async function ladeBeitrag(beitragId: string): Promise<Beitrag | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase.from('posts').select(AUSWAHL).eq('id', beitragId).maybeSingle();
  if (!data) return null;

  return formen([data], await eigeneVotes(user?.id))[0] ?? null;
}

async function eigeneVotes(nutzerId: string | undefined): Promise<Set<string>> {
  if (!nutzerId) return new Set();
  const supabase = await createServerClient();
  const { data } = await supabase.from('votes').select('post_id').eq('user_id', nutzerId);
  return new Set((data ?? []).map((v) => v.post_id));
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function formen(roh: any[], gevotet: Set<string>): Beitrag[] {
  return roh.map((p) => {
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
      selbstGevotet: gevotet.has(p.id),
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
}
/* eslint-enable @typescript-eslint/no-explicit-any */
