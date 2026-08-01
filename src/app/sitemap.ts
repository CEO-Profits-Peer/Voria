import type { MetadataRoute } from 'next';
import { createServiceClient } from '@/lib/supabase-server';
import { seitenUrl } from '@/lib/site-url';

/**
 * Die Karte für Suchmaschinen.
 *
 * WARUM DAS SEIT DEM 31.07. WICHTIG IST
 *
 * Voria läuft künftig als Nebenprodukt. Der Kaltstart braucht grob
 * tausend aktive Schreiber, und die kommen ohne Marketing nur über
 * einen Weg herein: geteilte Beiträge, die jemand findet. Diese Datei
 * ist die halbe Miete dafür — ohne sie muss eine Suchmaschine jeden
 * Beitrag zufällig über einen fremden Verweis entdecken.
 *
 * WAS HIER LANDET UND WAS NICHT
 *
 * Ausschließlich Seiten, die ohnehin öffentlich sind: die Startseite,
 * die Rechtsseiten, die Preisseite — und jeder Beitrag, dessen Tag auf
 * `public` steht. Kein Log, kein Profil, keine Karte. Was Anmeldung
 * verlangt, gehört nicht in eine Sitemap.
 *
 * `createServiceClient()` hier ist eine der wenigen berechtigten
 * Stellen: Die Sitemap wird ohne Nutzer erzeugt, es gibt also keine
 * Sitzung, an der Row Level Security sich orientieren könnte. Der
 * Filter auf `visibility = 'public'` steht deshalb ausdrücklich in
 * der Abfrage — hier ist er die einzige Schranke, nicht bloß eine
 * Bequemlichkeit.
 */
/*
 * STÜNDLICH NEU, NICHT EINMAL BEIM BAUEN.
 *
 * Ohne diese Zeile erzeugt Next die Sitemap beim Build und liefert
 * sie danach unverändert aus — für immer. Beiträge, die nach dem
 * letzten Deploy geteilt werden, stünden nie darin, und genau die
 * sollen ja gefunden werden.
 *
 * Stündlich statt bei jedem Abruf: Ein Crawler fragt die Sitemap
 * mehrmals am Tag, und zehntausend Zeilen aus der Datenbank sind
 * kein Aufwand, den man ihm jedes Mal schenken muss.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const wurzel = seitenUrl();

  const feste: MetadataRoute.Sitemap = [
    { url: wurzel, changeFrequency: 'weekly', priority: 1 },
    { url: `${wurzel}/pro`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${wurzel}/datenschutz`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${wurzel}/impressum`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  try {
    const dienst = createServiceClient();
    const { data, error } = await dienst
      .from('posts')
      .select('id, published_at, entries!inner(visibility)')
      .eq('entries.visibility', 'public')
      .order('published_at', { ascending: false })
      /* Eine Sitemap darf 50.000 Einträge haben. Zehntausend ist
         weit darunter und hält die Antwort schnell; bei mehr braucht
         es ohnehin eine geteilte Sitemap. */
      .limit(10_000);

    if (error) {
      console.error('[sitemap]', error);
      return feste;
    }

    return [
      ...feste,
      ...(data ?? []).map((p) => ({
        url: `${wurzel}/b/${p.id}`,
        lastModified: p.published_at ? new Date(p.published_at) : undefined,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      })),
    ];
  } catch (fehler) {
    /*
     * Ohne service_role-Schlüssel wirft `createServiceClient`. Dann
     * gibt es eben nur die festen Seiten — eine unvollständige
     * Sitemap ist besser als eine Fehlerseite an dieser Stelle.
     */
    console.error('[sitemap] Beiträge nicht ladbar:', fehler);
    return feste;
  }
}
