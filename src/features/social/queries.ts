/**
 * Der Feed.
 *
 * Kaltstart-Problem, bewusst gelöst: Solange es kaum Beiträge gibt,
 * wird chronologisch sortiert. Ein Algorithmus ohne Datenmenge ist
 * schlechter als keiner. Die Gewichtung steht schon da, greift aber
 * erst ab genug Beiträgen.
 */

import { createServerClient } from '@/lib/supabase-server';
import { regionForCountry, regionForTrip, type RegionOrNeutral } from '@/themes/regions';
import { SEITE, ENTDECKEN_VORRAT, type Reiter } from './konstanten';

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

  if (reiter === 'folgeich' && !user) return [];

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
   * SCHRITT 1: die Reihenfolge holen.
   *
   * Warum eine Datenbankfunktion und keine PostgREST-Abfrage mehr:
   * „Ungelesenes zuerst" sortiert über eine Verknüpfung mit
   * `post_views`, und `order` kennt nur Spalten der Haupttabelle.
   * Dieselbe Lage wie bei `similarity()` in Migration 0007.
   *
   * Nebenbei entfällt damit der frühere Rückzieher für „folge ich mit
   * leerer Liste" — `in.()` mit leerem Inhalt kann PostgREST nicht,
   * `exists` in SQL schon.
   */
  const { data: reihenfolge, error: rFehler } = await supabase.rpc('feed_laden', {
    versatz,
    /* „Entdecken" filtert danach in TypeScript und braucht deshalb
       Vorrat — siehe ENTDECKEN_VORRAT. */
    hoechstens: reiter === 'entdecken' ? ENTDECKEN_VORRAT : anzahl,
    nur_gefolgte: reiter === 'folgeich',
    chronologisch,
  });

  if (rFehler) {
    console.error('[ladeFeed] feed_laden fehlgeschlagen:', rFehler);
    return [];
  }

  const ids = ((reihenfolge ?? []) as { id: string }[]).map((p) => p.id);
  if (ids.length === 0) return [];

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
  /* SCHRITT 2: die Einbettungen zu genau diesen Beiträgen. */
  const { data, error } = await supabase
    .from('posts')
    .select(
      `id, entry_id, caption, vote_count, published_at, comments(count),
       profiles!posts_user_id_fkey(username, display_name, avatar_url),
       entries(entry_date, title, place_name,
               trips(region_override, trip_countries(country_code, days)),
               blocks(kind, position, photos(r2_key, width, height, blurhash)))`,
    )
    .in('id', ids);

  if (error) {
    console.error('[ladeFeed] Feed-Abfrage fehlgeschlagen:', error);
    return [];
  }
  if (!data) return [];

  /*
   * SCHRITT 3: die Reihenfolge wiederherstellen.
   *
   * `in()` gibt KEINE bestimmte Reihenfolge zurück — Postgres liefert,
   * wie es am günstigsten ist. Ohne diese Zeilen wäre die ganze
   * Sortierung aus Schritt 1 verloren, und zwar lautlos: Die Liste
   * sähe vollständig aus, stünde nur in beliebiger Folge.
   */
  const platz = new Map(ids.map((id, i) => [id, i]));
  data.sort((a, b) => (platz.get(a.id) ?? 0) - (platz.get(b.id) ?? 0));

  let eigene = new Set<string>();
  if (user) {
    const { data: v } = await supabase.from('votes').select('post_id').eq('user_id', user.id);
    eigene = new Set((v ?? []).map((x) => x.post_id));
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const beitraege: Beitrag[] = (data as any[]).map((p) => {
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

  if (reiter !== 'entdecken') return beitraege;

  /*
   * ENTDECKEN: nur Regionen, in denen der Leser noch nicht war.
   *
   * Gefiltert wird hier und nicht in SQL, weil `regionForTrip` aus den
   * Ländern einer Reise rechnet — diese Zuordnung steht in
   * src/themes/regions.ts und nicht in der Datenbank.
   *
   * Nicht angemeldet: dann war man nirgends, und alles ist neu.
   */
  const besucht = await besuchteRegionen(user?.id);
  const fremd = beitraege.filter((b) => b.region !== 'neutral' && !besucht.has(b.region));

  return fremd.slice(0, anzahl);
}

/** Die Regionen, in denen jemand schon war — aus seinen eigenen Reisen. */
async function besuchteRegionen(userId: string | undefined): Promise<Set<string>> {
  if (!userId) return new Set();

  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('trips')
    .select('region_override, trip_countries(country_code, days)')
    .eq('user_id', userId);

  if (error) {
    console.error('[besuchteRegionen]', error);
    /*
     * Leere Menge heißt „nichts besucht", also zeigt Entdecken alles.
     * Das ist der harmlosere Ausgang — die Alternative wäre ein leerer
     * Reiter, und der sähe aus, als sei die Welt schon bereist.
     */
    return new Set();
  }

  const regionen = new Set<string>();
  for (const t of data ?? []) {
    const laender = (t.trip_countries ?? []) as { country_code: string; days: number }[];
    regionen.add(
      regionForTrip(
        laender.map((l) => ({ code: l.country_code, days: l.days })),
        t.region_override as RegionOrNeutral | null,
      ),
    );
  }
  return regionen;
}
