/**
 * Beiträge eines Profils und ein einzelner Beitrag.
 *
 * Teilt sich die Aufbereitung mit dem Feed — dieselbe Form, damit
 * `BeitragKarte` überall funktioniert.
 */

import { createServerClient } from '@/lib/supabase-server';
import { regionForCountry, type RegionOrNeutral } from '@/themes/regions';
import type { Beitrag } from './queries';

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
const AUSWAHL = `id, entry_id, caption, vote_count, published_at, comments(count),
  profiles!posts_user_id_fkey(username, display_name, avatar_url),
  entries(entry_date, title, place_name,
          trips(region_override, trip_countries(country_code, days)),
          blocks(kind, position, photos(r2_key, width, height, blurhash)))`;

export async function ladeProfilBeitraege(profilId: string): Promise<Beitrag[]> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('posts')
    .select(AUSWAHL)
    .eq('user_id', profilId)
    .order('published_at', { ascending: false })
    .limit(50);

  if (error) console.error('[ladeProfilBeitraege]', error);

  return formen(data ?? [], await eigeneVotes(user?.id));
}

export async function ladeBeitrag(beitragId: string): Promise<Beitrag | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('posts')
    .select(AUSWAHL)
    .eq('id', beitragId)
    .maybeSingle();

  // Ohne diese Zeile sähe ein Abfragefehler aus wie „Beitrag gibt es nicht".
  if (error) console.error('[ladeBeitrag]', error);
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
      kommentare: p.comments?.[0]?.count ?? 0,
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
}
/* eslint-enable @typescript-eslint/no-explicit-any */
