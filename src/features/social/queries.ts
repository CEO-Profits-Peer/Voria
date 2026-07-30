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
import { SEITE, type Reiter } from './konstanten';

export interface Beitrag {
  id: string;
  eintragId: string;
  text: string;
  votes: number;
  selbstGevotet: boolean;
  kommentare: number;
  verfasser: { name: string; benutzername: string; bild: string | null };
  tag: { datum: string; titel: string | null; ort: string | null };
  region: RegionOrNeutral;
  foto: { pfad: string; breite: number; hoehe: number; blurhash: string | null } | null;
}

const SCHWELLE_FUER_ALGORITHMUS = 200;

export async function ladeFeed(
  versatz = 0,
  anzahl = SEITE,
  reiter: Reiter = 'fuerdich',
): Promise<Beitrag[]> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /*
   * „Folge ich": erst die Gefolgten holen, dann darauf einschränken.
   *
   * Ohne den Rückzieher bei leerer Liste baut PostgREST `in.()` — eine
   * Bedingung ohne Inhalt, die je nach Fassung einen Fehler wirft oder
   * ALLES durchlässt. Das zweite wäre schlimmer: der Reiter zeigte
   * dann fremde Leute, obwohl man niemandem folgt.
   */
  let gefolgte: string[] | null = null;
  if (reiter === 'folgeich') {
    if (!user) return [];
    const { data: f, error: fFehler } = await supabase
      .from('follows')
      .select('followee_id')
      .eq('follower_id', user.id);

    if (fFehler) {
      console.error('[ladeFeed] Gefolgte konnten nicht geladen werden:', fFehler);
      return [];
    }
    gefolgte = (f ?? []).map((x) => x.followee_id);
    if (gefolgte.length === 0) return [];
  }

  /*
   * Die Kaltstart-Zählung nur im offenen Feed. „Folge ich" sortiert
   * immer chronologisch — die Auswahl hat der Nutzer schon getroffen.
   */
  let chronologisch = true;
  if (reiter === 'fuerdich') {
    const { count } = await supabase.from('posts').select('id', { count: 'exact', head: true });
    chronologisch = (count ?? 0) < SCHWELLE_FUER_ALGORITHMUS;
  }

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
  let abfrage = supabase
    .from('posts')
    .select(
      `id, entry_id, caption, vote_count, published_at, comments(count),
       profiles!posts_user_id_fkey(username, display_name, avatar_url),
       entries(entry_date, title, place_name,
               trips(region_override, trip_countries(country_code, days)),
               blocks(kind, position, photos(r2_key, width, height, blurhash)))`,
    )
    .order(chronologisch ? 'published_at' : 'vote_count', { ascending: false })
    /*
     * Zweites Sortierfeld, sonst ist die Reihenfolge nicht eindeutig.
     * Bei gleicher Stimmenzahl darf Postgres frei entscheiden — und
     * über zwei Abfragen hinweg entscheidet es unterschiedlich. Dann
     * erscheint derselbe Beitrag zweimal, während ein anderer nie
     * auftaucht. Genau die Sorte Fehler, die niemand meldet.
     */
    .order('id', { ascending: false })
    .range(versatz, versatz + anzahl - 1);

  if (gefolgte) abfrage = abfrage.in('user_id', gefolgte);

  const { data, error } = await abfrage;

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
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
