'use server';

/**
 * Ein hochgeladenes Foto in der Datenbank eintragen und als Block
 * an den Tag hängen.
 *
 * Wenn EXIF Koordinaten geliefert hat und der Tag noch keinen Ort
 * kennt, wird er hier gesetzt — das ist die Automatik, die Voria
 * von einem gewöhnlichen Tagebuch unterscheidet.
 */

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase-server';
import { fotosJeTag } from '@/lib/plan';

export async function fotoEintragen(daten: {
  eintragId: string;
  pfad: string;
  pfadVorschau: string;
  breite: number;
  hoehe: number;
  bytes: number;
  grundfarbe: string;
  aufgenommenAm: string | null;
  breitengrad: number | null;
  laengengrad: number | null;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  /*
   * DIE FOTOGRENZE, SERVERSEITIG.
   *
   * Sie steht hier und nicht im Browser: Im Wähler wäre sie eine
   * Höflichkeit, die jeder umgeht, der die Anfrage von Hand schickt.
   * Und ein Pro-Merkmal, das sich umgehen lässt, ist keins — dann
   * verkauft Voria etwas, das jeder umsonst bekommt.
   *
   * Gezählt wird JE TAG, nicht je Konto. Die Grenze soll den einen
   * Tag bremsen, an dem jemand vierhundert Bilder hineinkippt, nicht
   * jemanden, der seit drei Jahren schreibt.
   */
  const { count, error: zaehlFehler } = await supabase
    .from('photos')
    .select('id', { count: 'exact', head: true })
    .eq('entry_id', daten.eintragId);

  if (zaehlFehler) {
    console.error('[fotoEintragen] Zählung fehlgeschlagen:', zaehlFehler);
    return null;
  }

  const grenze = await fotosJeTag();
  if ((count ?? 0) >= grenze) {
    /*
     * Kein Absturz, kein stiller Abbruch: Der Aufrufer bekommt die
     * Grenze zurück und kann sie benennen. „Das ging nicht" ohne
     * Grund ist die schlechteste aller Antworten.
     */
    return { grenzeErreicht: true as const, grenze };
  }

  const { data: foto } = await supabase
    .from('photos')
    .insert({
      user_id: user.id,
      entry_id: daten.eintragId,
      r2_key: daten.pfad,
      r2_key_thumb: daten.pfadVorschau,
      width: daten.breite,
      height: daten.hoehe,
      bytes: daten.bytes,
      blurhash: daten.grundfarbe,
      taken_at: daten.aufgenommenAm,
      lat: daten.breitengrad,
      lng: daten.laengengrad,
    })
    .select('id')
    .single();

  if (!foto) return null;

  const { data: letzte } = await supabase
    .from('blocks')
    .select('position')
    .eq('entry_id', daten.eintragId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase.from('blocks').insert({
    entry_id: daten.eintragId,
    kind: 'photo',
    photo_id: foto.id,
    position: (letzte?.position ?? -1) + 1,
    // Startlage im Open Space: leicht versetzt und leicht gedreht,
    // damit es gelegt aussieht statt gerastert.
    x: 32 + ((letzte?.position ?? 0) % 3) * 26,
    y: 100 + ((letzte?.position ?? 0) + 1) * 40,
    w: 220,
    h: Math.round(220 * (daten.hoehe / daten.breite)),
    rotation: [-3, -1.5, 2, 3.5][((letzte?.position ?? 0) + 1) % 4],
  });

  // Ort setzen, falls der Tag noch keinen hat und EXIF welche liefert.
  if (daten.breitengrad != null && daten.laengengrad != null) {
    const { data: tag } = await supabase
      .from('entries')
      .select('lat, place_name')
      .eq('id', daten.eintragId)
      .maybeSingle();

    if (tag && tag.lat == null) {
      await supabase
        .from('entries')
        .update({ lat: daten.breitengrad, lng: daten.laengengrad })
        .eq('id', daten.eintragId);
    }
  }

  revalidatePath('/log', 'layout');
  return foto.id;
}
