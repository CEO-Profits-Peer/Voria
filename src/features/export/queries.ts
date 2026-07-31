/**
 * Alles, was jemandem gehört — in einer Abfrage.
 *
 * Der Export ist keine Nebenfunktion. „Der Ort, an dem du in zehn
 * Jahren nachliest" ist ein Versprechen über zehn Jahre, und es ist
 * nur glaubwürdig, wenn die Daten mitkommen können. Deshalb gehört er
 * NICHT hinter PRO.
 *
 * Row Level Security greift wie überall — der Filter auf `user_id`
 * steht trotzdem da, aus demselben Grund wie bei `ladeReisen`: Was hier
 * herauskommen soll, ist eine Frage der Abfrage, nicht der Regel.
 */

import { createServerClient } from '@/lib/supabase-server';

/**
 * Die Fassung des Formats.
 *
 * Steht in jeder Datei ganz oben. Wer in zehn Jahren eine Datei findet,
 * soll erkennen können, nach welchen Regeln sie gebaut wurde — auch
 * wenn es Voria dann nicht mehr gibt.
 */
export const FORMAT_FASSUNG = 1;

export interface ExportFoto {
  /** Der Speicherschlüssel — daraus wird die Adresse zum Laden. */
  schluessel: string;
  /** Dateiname im Archiv, ohne Ordner. */
  datei: string;
  breite: number;
  hoehe: number;
}

export interface ExportDaten {
  fassung: number;
  erstellt: string;
  profil: {
    benutzername: string;
    anzeigename: string;
    bio: string;
  };
  reisen: {
    id: string;
    titel: string;
    von: string | null;
    bis: string | null;
    laender: string[];
    tage: {
      datum: string;
      titel: string | null;
      ort: string | null;
      sichtbarkeit: string;
      bloecke: {
        art: string;
        position: number;
        text: string | null;
        foto: string | null;
      }[];
    }[];
  }[];
  /** Alle Fotos, einmal — auch wenn sie mehrfach vorkommen. */
  fotos: ExportFoto[];
}

export async function ladeAllesZumMitnehmen(): Promise<ExportDaten | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profil }, { data: reisen, error }] = await Promise.all([
    supabase
      .from('profiles')
      .select('username, display_name, bio')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('trips')
      .select(
        `id, title, started_on, ended_on, trip_countries(country_code),
         entries(entry_date, title, place_name, visibility,
                 blocks(kind, position, text, photos(id, r2_key, width, height)))`,
      )
      .eq('user_id', user.id)
      .order('started_on', { ascending: true, nullsFirst: false }),
  ]);

  if (error) {
    console.error('[ladeAllesZumMitnehmen]', error);
    return null;
  }

  const fotos = new Map<string, ExportFoto>();

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const gebaut = (reisen ?? []).map((r: any) => ({
    id: r.id,
    titel: r.title || 'Ohne Titel',
    von: r.started_on,
    bis: r.ended_on,
    laender: (r.trip_countries ?? []).map((l: any) => l.country_code),
    tage: (r.entries ?? [])
      .slice()
      .sort((a: any, b: any) => a.entry_date.localeCompare(b.entry_date))
      .map((e: any) => ({
        datum: e.entry_date,
        titel: e.title,
        ort: e.place_name,
        sichtbarkeit: e.visibility,
        bloecke: (e.blocks ?? [])
          .slice()
          .sort((a: any, b: any) => a.position - b.position)
          .map((b: any) => {
            let datei: string | null = null;

            if (b.photos) {
              /*
               * Die Endung stammt aus dem Schlüssel, nicht aus einer
               * Annahme: Es liegen avif, webp und jpg nebeneinander,
               * je nachdem was das Gerät beim Hochladen konnte.
               */
              const endung = b.photos.r2_key.split('.').pop() || 'jpg';
              datei = `${b.photos.id}.${endung}`;

              if (!fotos.has(b.photos.id)) {
                fotos.set(b.photos.id, {
                  schluessel: b.photos.r2_key,
                  datei,
                  breite: b.photos.width,
                  hoehe: b.photos.height,
                });
              }
            }

            return {
              art: b.kind,
              position: b.position,
              text: b.text,
              foto: datei,
            };
          }),
      })),
  }));
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return {
    fassung: FORMAT_FASSUNG,
    erstellt: new Date().toISOString(),
    profil: {
      benutzername: profil?.username ?? '',
      anzeigename: profil?.display_name ?? '',
      bio: profil?.bio ?? '',
    },
    reisen: gebaut,
    fotos: [...fotos.values()],
  };
}
