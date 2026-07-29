/**
 * EXIF lesen — Aufnahmezeit und Koordinaten.
 *
 * Das ist der eigentliche „smarte" Teil von Voria und der größte
 * Unterschied zu Day One: Man wirft zweihundert Fotos hinein und die
 * Tage, Orte und Länder stehen schon da. Niemand tippt Daten ab.
 *
 * Bewusst ohne Bibliothek — wir brauchen genau vier Felder, und ein
 * Minimalparser kostet 3 KB statt 90 KB.
 */

export interface ExifDaten {
  aufgenommenAm: Date | null;
  breitengrad: number | null;
  laengengrad: number | null;
}

const LEER: ExifDaten = { aufgenommenAm: null, breitengrad: null, laengengrad: null };

export async function leseExif(datei: File): Promise<ExifDaten> {
  try {
    // Die ersten 128 KB reichen — EXIF steht immer am Anfang.
    const puffer = await datei.slice(0, 131072).arrayBuffer();
    const sicht = new DataView(puffer);

    if (sicht.getUint16(0) !== 0xffd8) return dateiZeit(datei); // kein JPEG

    let pos = 2;
    while (pos < sicht.byteLength - 4) {
      if (sicht.getUint8(pos) !== 0xff) break;
      const marke = sicht.getUint8(pos + 1);
      const laenge = sicht.getUint16(pos + 2);

      if (marke === 0xe1) {
        const kopf = sicht.getUint32(pos + 4);
        if (kopf === 0x45786966) return { ...leseTiff(sicht, pos + 10), };
        return dateiZeit(datei);
      }
      pos += 2 + laenge;
    }
  } catch {
    /* Kaputtes EXIF ist kein Grund, den Upload zu verhindern. */
  }
  return dateiZeit(datei);
}

/** Fällt zurück auf das Änderungsdatum der Datei. */
function dateiZeit(datei: File): ExifDaten {
  return { ...LEER, aufgenommenAm: datei.lastModified ? new Date(datei.lastModified) : null };
}

function leseTiff(sicht: DataView, start: number): ExifDaten {
  const klein = sicht.getUint16(start) === 0x4949;
  const u16 = (p: number) => sicht.getUint16(p, klein);
  const u32 = (p: number) => sicht.getUint32(p, klein);

  const ifd0 = start + u32(start + 4);
  let exifZeiger = 0;
  let gpsZeiger = 0;
  let datum: Date | null = null;

  const felder = u16(ifd0);
  for (let i = 0; i < felder; i++) {
    const p = ifd0 + 2 + i * 12;
    const tag = u16(p);
    if (tag === 0x8769) exifZeiger = start + u32(p + 8);
    if (tag === 0x8825) gpsZeiger = start + u32(p + 8);
  }

  if (exifZeiger) {
    const n = u16(exifZeiger);
    for (let i = 0; i < n; i++) {
      const p = exifZeiger + 2 + i * 12;
      // 0x9003 DateTimeOriginal
      if (u16(p) === 0x9003) {
        const off = start + u32(p + 8);
        const roh = String.fromCharCode(
          ...Array.from({ length: 19 }, (_, k) => sicht.getUint8(off + k)),
        );
        // Format: "2026:03:14 17:42:03"
        const [d, z] = roh.split(' ');
        if (d && z) datum = new Date(`${d.replace(/:/g, '-')}T${z}`);
      }
    }
  }

  let breite: number | null = null;
  let laenge: number | null = null;

  if (gpsZeiger) {
    let bRef = 'N';
    let lRef = 'E';
    let bWert: number[] | null = null;
    let lWert: number[] | null = null;

    const n = u16(gpsZeiger);
    for (let i = 0; i < n; i++) {
      const p = gpsZeiger + 2 + i * 12;
      const tag = u16(p);
      const off = start + u32(p + 8);

      if (tag === 0x0001) bRef = String.fromCharCode(sicht.getUint8(p + 8));
      if (tag === 0x0003) lRef = String.fromCharCode(sicht.getUint8(p + 8));
      if (tag === 0x0002) bWert = bruchTripel(sicht, off, klein);
      if (tag === 0x0004) lWert = bruchTripel(sicht, off, klein);
    }

    if (bWert) breite = (bWert[0] + bWert[1] / 60 + bWert[2] / 3600) * (bRef === 'S' ? -1 : 1);
    if (lWert) laenge = (lWert[0] + lWert[1] / 60 + lWert[2] / 3600) * (lRef === 'W' ? -1 : 1);
  }

  return {
    aufgenommenAm: datum && !isNaN(datum.getTime()) ? datum : null,
    breitengrad: breite,
    laengengrad: laenge,
  };
}

function bruchTripel(sicht: DataView, off: number, klein: boolean): number[] {
  return [0, 1, 2].map((i) => {
    const zaehler = sicht.getUint32(off + i * 8, klein);
    const nenner = sicht.getUint32(off + i * 8 + 4, klein);
    return nenner ? zaehler / nenner : 0;
  });
}

/** Datum im Format, das die Datenbank erwartet. */
export function alsTagesdatum(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
