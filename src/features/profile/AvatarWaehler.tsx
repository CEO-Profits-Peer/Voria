'use client';

/**
 * Profilbild wählen.
 *
 * Zugeschnitten und verkleinert wird im BROWSER, bevor irgendetwas das
 * Gerät verlässt. Drei Gründe:
 *
 *   * Ein Handyfoto sind 4 MB. Als 256-px-Quadrat sind es rund 20 KB.
 *     Das ist der Unterschied zwischen „lädt" und „lädt sofort" —
 *     und zwischen 1 GB Freibetrag für 250 oder für 50.000 Bilder.
 *   * Der Server sieht die Bilddaten nie. Hochgeladen wird direkt zum
 *     Speicher, mit einer kurzlebigen signierten Adresse.
 *   * Kein Zuschneide-Dialog nötig: quadratisch aus der Mitte ist bei
 *     Profilbildern fast immer richtig, und eine Rahmen-Zieh-Oberfläche
 *     wäre auf dem Handy ohnehin fummelig.
 *
 * AVIF, wenn der Browser es kann, sonst WebP. Beides kann jeder
 * Browser der letzten Jahre anzeigen; beim Erzeugen ist AVIF noch
 * nicht überall dabei, deshalb die Prüfung.
 */

import { useRef, useState, useTransition } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { Avatar } from '@/ui/Avatar';
import { avatarSpeichern } from './actions';
import { useT } from '@/i18n/Sprachraum';

const KANTE = 256;

export function AvatarWaehler({
  bild,
  name,
}: {
  bild: string | null;
  name: string;
}) {
  const { t } = useT();
  const eingabe = useRef<HTMLInputElement>(null);
  const [aktuell, setAktuell] = useState(bild);
  const [fehler, setFehler] = useState<string | null>(null);
  const [laedt, setLaedt] = useState(false);
  const [, starten] = useTransition();

  const waehlen = async (datei: File) => {
    setFehler(null);
    setLaedt(true);
    try {
      const { daten, endung } = await quadratMachen(datei);

      const antwort = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endung, art: 'avatar' }),
      });
      if (!antwort.ok) throw new Error('Upload-Ziel fehlgeschlagen');
      const ziel = (await antwort.json()) as { bild: { url: string; key: string } };

      const hoch = await fetch(ziel.bild.url, { method: 'PUT', body: daten });
      if (!hoch.ok) throw new Error('Hochladen fehlgeschlagen');

      const ergebnis = await avatarSpeichern(ziel.bild.key);
      if (ergebnis.fehler) throw new Error(ergebnis.fehler);

      setAktuell(ziel.bild.key);
    } catch (e) {
      console.error('[AvatarWaehler]', e);
      setFehler(t.profil.bildFehler);
    } finally {
      setLaedt(false);
    }
  };

  const entfernen = () =>
    starten(async () => {
      const ergebnis = await avatarSpeichern(null);
      if (ergebnis.fehler) setFehler(ergebnis.fehler);
      else setAktuell(null);
    });

  return (
    <div className="wrap">
      <Avatar bild={aktuell} name={name} groesse={72} />

      <div className="knoepfe">
        <button type="button" onClick={() => eingabe.current?.click()} disabled={laedt}>
          <Camera size={16} strokeWidth={1.75} aria-hidden />
          {laedt ? t.profil.bildLaedt : aktuell ? t.profil.bildTauschen : t.profil.bildWaehlen}
        </button>

        {aktuell && !laedt && (
          <button type="button" className="weg" onClick={entfernen}>
            <Trash2 size={16} strokeWidth={1.75} aria-hidden />
            {t.profil.bildEntfernen}
          </button>
        )}

        {/*
          Das Feld liegt außerhalb des Profilformulars gedanklich, steht
          aber im selben DOM. Ohne name-Attribut wird es beim Absenden
          nicht mitgeschickt — das Bild ist schon gespeichert.
        */}
        <input
          ref={eingabe}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const datei = e.target.files?.[0];
            if (datei) waehlen(datei);
            // Zurücksetzen, sonst löst dieselbe Datei kein zweites
            // Mal aus, wenn man sie erneut wählt.
            e.target.value = '';
          }}
        />
      </div>

      {fehler && (
        <p className="fehler" role="alert">
          {fehler}
        </p>
      )}

      <style jsx>{`
        .wrap {
          display: flex;
          align-items: center;
          gap: var(--space-16);
          flex-wrap: wrap;
        }
        .knoepfe {
          display: flex;
          gap: var(--space-8);
          flex-wrap: wrap;
        }
        .knoepfe button {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          height: 38px;
          padding: 0 var(--space-16);
          border: 1px solid var(--border-default);
          border-radius: 7px;
          background: var(--surface-canvas);
          color: var(--content-secondary);
          font-family: var(--font-ui);
          font-size: 13px;
          font-weight: var(--weight-medium);
          cursor: pointer;
          transition: border-color 200ms, color 200ms;
        }
        .knoepfe button:hover:not(:disabled) {
          border-color: var(--border-strong);
          color: var(--content-primary);
        }
        .knoepfe button:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .weg:hover {
          color: var(--state-danger) !important;
        }
        .fehler {
          flex-basis: 100%;
          margin: 0;
          font-family: var(--font-ui);
          font-size: var(--size-14);
          color: var(--state-danger);
        }
      `}</style>
    </div>
  );
}

/**
 * Mittiger quadratischer Zuschnitt, 256 px, komprimiert.
 *
 * `createImageBitmap` statt `new Image()`: es dreht EXIF-orientierte
 * Handyfotos selbst richtig. Ohne das liegen Bilder vom iPhone quer.
 */
async function quadratMachen(datei: File): Promise<{ daten: Blob; endung: 'avif' | 'webp' }> {
  const bitmap = await createImageBitmap(datei, { imageOrientation: 'from-image' });

  const kante = Math.min(bitmap.width, bitmap.height);
  const links = (bitmap.width - kante) / 2;
  const oben = (bitmap.height - kante) / 2;

  const leinwand = document.createElement('canvas');
  leinwand.width = KANTE;
  leinwand.height = KANTE;

  const stift = leinwand.getContext('2d');
  if (!stift) throw new Error('Kein Zeichenkontext');
  stift.drawImage(bitmap, links, oben, kante, kante, 0, 0, KANTE, KANTE);
  bitmap.close();

  const avif = await alsBlob(leinwand, 'image/avif');
  if (avif) return { daten: avif, endung: 'avif' };

  const webp = await alsBlob(leinwand, 'image/webp');
  if (webp) return { daten: webp, endung: 'webp' };

  throw new Error('Dieser Browser kann das Bild nicht umwandeln');
}

/**
 * `toBlob` mit unbekanntem Typ liefert stillschweigend PNG statt einen
 * Fehler zu werfen. Deshalb wird der Typ der Antwort geprüft, nicht der
 * Aufruf.
 */
function alsBlob(leinwand: HTMLCanvasElement, typ: string): Promise<Blob | null> {
  return new Promise((fertig) => {
    leinwand.toBlob((blob) => fertig(blob && blob.type === typ ? blob : null), typ, 0.82);
  });
}
