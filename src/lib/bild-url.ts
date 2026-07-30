/**
 * Öffentliche Adresse zu einem Speicherschlüssel — im Browser.
 *
 * Es gibt bereits `storage.publicUrl()` in src/lib/storage.ts, aber die
 * Datei zieht `supabase-server` und damit `next/headers` nach sich. Aus
 * einer 'use client'-Komponente ist sie deshalb unerreichbar.
 *
 * Diese Funktion nutzt nur NEXT_PUBLIC_-Variablen, die im Bundle
 * landen, und ist damit auf beiden Seiten benutzbar.
 *
 * Vorher stand dieselbe Logik als lokale Hilfsfunktion in FotoBild.tsx.
 * Mit den Profilbildern brauchen sie mehrere Komponenten — doppelter
 * Code an drei Stellen wäre die Sorte Kleinigkeit, die später
 * auseinanderläuft.
 *
 * In der Datenbank stehen SCHLÜSSEL, keine fertigen Adressen
 * (`photos.r2_key`, `profiles.avatar_url`). Das ist Absicht: beim
 * Wechsel des Speichers von Supabase auf R2 ändert sich nur diese
 * Auflösung, nicht der Inhalt der Tabellen.
 */

export function bildUrl(schluessel: string): string {
  // Altbestand oder Fremdadresse: unverändert durchlassen.
  if (schluessel.startsWith('http')) return schluessel;

  const r2 = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (r2) return `${r2}/${schluessel}`;

  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${schluessel}`;
}
