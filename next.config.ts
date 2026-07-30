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
       * NUR FÜR TESTDATEN. Die zwanzig Beispielbeiträge aus
       * supabase/seed/feed_testdaten.sql verweisen auf Bilder von
       * picsum.photos, weil ich keine echten Fotos in den Speicher
       * hochladen kann.
       *
       * Vor dem ersten echten Start entfernen — sonst darf jeder
       * Bilder von dort in Voria einbetten.
       */
      { protocol: 'https' as const, hostname: 'picsum.photos' },
      { protocol: 'https' as const, hostname: 'fastly.picsum.photos' },

      // Später, wenn STORAGE_DRIVER=r2:
      // { protocol: 'https', hostname: '<bucket>.r2.dev' },
    ],
  },

  eslint: {
    dirs: ['src'],
  },
};

export default nextConfig;
