/**
 * Bilder im Browser verkleinern, bevor sie hochgeladen werden.
 *
 * Das ist die Entscheidung, die das ganze Kostenmodell trägt:
 * Ein iPhone-Foto wiegt 3–5 MB, dasselbe Bild als AVIF bei 2560 px
 * etwa 300 KB — auf jedem Bildschirm nicht unterscheidbar.
 *
 * Faktor 10 bis 15. Bei 100.000 Nutzern rund 20 TB statt 250 TB.
 *
 * Das Original bleibt auf dem Gerät. Es wird nie hochgeladen.
 */

export const ANZEIGE_KANTE = 2560;
export const VORSCHAU_KANTE = 320;

export interface AufbereitetesBild {
  anzeige: Blob;
  vorschau: Blob;
  breite: number;
  hoehe: number;
  grundfarbe: string;
}

/** Welches Format der Browser kann — AVIF, sonst WebP, sonst JPEG. */
async function bestesFormat(): Promise<{ typ: string; endung: 'avif' | 'webp' | 'jpg' }> {
  for (const [typ, endung] of [
    ['image/avif', 'avif'],
    ['image/webp', 'webp'],
  ] as const) {
    const leinwand = document.createElement('canvas');
    leinwand.width = leinwand.height = 1;
    const url = leinwand.toDataURL(typ);
    if (url.startsWith(`data:${typ}`)) return { typ, endung };
  }
  return { typ: 'image/jpeg', endung: 'jpg' };
}

export async function bereiteVor(datei: File): Promise<AufbereitetesBild & { endung: 'avif' | 'webp' | 'jpg' }> {
  const bild = await ladeBild(datei);
  const { typ, endung } = await bestesFormat();

  const skala = Math.min(1, ANZEIGE_KANTE / Math.max(bild.width, bild.height));
  const breite = Math.round(bild.width * skala);
  const hoehe = Math.round(bild.height * skala);

  const anzeige = await zeichne(bild, breite, hoehe, typ, 0.82);
  const vSkala = Math.min(1, VORSCHAU_KANTE / Math.max(bild.width, bild.height));
  const vorschau = await zeichne(bild, Math.round(bild.width * vSkala), Math.round(bild.height * vSkala), typ, 0.7);

  const grundfarbe = await mittlereFarbe(bild);

  if ('close' in bild) (bild as ImageBitmap).close();

  return { anzeige, vorschau, breite, hoehe, grundfarbe, endung };
}

async function ladeBild(datei: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    // imageOrientation dreht nach EXIF, damit Hochformat nicht liegt.
    return createImageBitmap(datei, { imageOrientation: 'from-image' });
  }
  return new Promise((ok, fehl) => {
    const el = new Image();
    el.onload = () => ok(el);
    el.onerror = fehl;
    el.src = URL.createObjectURL(datei);
  });
}

function zeichne(
  bild: CanvasImageSource,
  breite: number,
  hoehe: number,
  typ: string,
  guete: number,
): Promise<Blob> {
  const leinwand = document.createElement('canvas');
  leinwand.width = breite;
  leinwand.height = hoehe;
  const stift = leinwand.getContext('2d')!;
  stift.imageSmoothingQuality = 'high';
  stift.drawImage(bild, 0, 0, breite, hoehe);

  return new Promise((ok) => leinwand.toBlob((b) => ok(b!), typ, guete));
}

/**
 * Eine einzelne Durchschnittsfarbe statt eines echten Blurhash.
 * Reicht, um den Ladezustand ruhig zu halten, und kostet nichts.
 */
async function mittlereFarbe(bild: CanvasImageSource): Promise<string> {
  const leinwand = document.createElement('canvas');
  leinwand.width = leinwand.height = 8;
  const stift = leinwand.getContext('2d', { willReadFrequently: true })!;
  stift.drawImage(bild, 0, 0, 8, 8);
  const { data } = stift.getImageData(0, 0, 8, 8);

  let r = 0;
  let g = 0;
  let b = 0;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  const n = data.length / 4;
  const hex = (v: number) => Math.round(v / n).toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`;
}
