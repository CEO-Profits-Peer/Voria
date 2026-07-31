import path from 'node:path';
import type { NextConfig } from 'next';

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /**
   * Es liegt eine verirrte package-lock.json in C:\Users\Admin1\.
   * Next hat deshalb dieses Verzeichnis als Projektwurzel angenommen
   * und beim Bauen die falschen Dateien mitgenommen. Hier wird die
   * Wurzel festgenagelt.
   *
   * Die Datei oben im Benutzerordner darfst du löschen — sie gehört
   * zu keinem Projekt.
   */
  outputFileTracingRoot: path.join(__dirname),

  images: {
    // AVIF zuerst — das ist das Format, in dem wir speichern.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      ...(supabaseHost
        ? [{ protocol: 'https' as const, hostname: supabaseHost, pathname: '/storage/v1/object/public/**' }]
        : []),
      /*
       * PICSUM.PHOTOS IST HIER RAUS — bitte nicht zurückholen.
       *
       * Die Testdaten aus supabase/seed/feed_testdaten.sql verweisen
       * darauf. Solange der Eintrag hier stand, konnte jeder beliebige
       * Bilder von einem fremden Server in Voria einbetten: Es genügt,
       * eine solche Adresse in `photos.r2_key` zu bekommen.
       *
       * Wer die Testdaten wieder braucht, setzt den Eintrag lokal für
       * die Dauer der Sitzung ein und nimmt ihn danach wieder heraus.
       * Auf der ausgelieferten Fassung hat er nichts verloren.
       */

      // Später, wenn STORAGE_DRIVER=r2:
      // { protocol: 'https', hostname: '<bucket>.r2.dev' },
    ],
  },

  eslint: {
    dirs: ['src'],
  },
};

export default nextConfig;
