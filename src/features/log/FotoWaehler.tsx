'use client';

/**
 * Fotos auswählen, aufbereiten, hochladen.
 *
 * Der Ablauf, der Voria von Day One unterscheidet:
 *   1. Nutzer wählt Fotos
 *   2. EXIF wird gelesen — Datum und Koordinaten
 *   3. Im Browser auf 2560 px und AVIF verkleinert
 *   4. Beides über eine signierte URL direkt zum Speicher
 *   5. Das Original bleibt auf dem Gerät
 *
 * Der Fortschritt wird gezeigt, aber ohne Prozentbalken-Getue —
 * eine Zeile, die sagt, was gerade passiert.
 */

import { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { leseExif } from '@/lib/exif';
import { bereiteVor } from '@/lib/bild';
import { fotoEintragen } from './fotoActions';
import { Knopf } from '@/ui/Knopf';
import { useT } from '@/i18n/Sprachraum';

type Stand = 'warten' | 'lesen' | 'verkleinern' | 'senden' | 'fertig' | 'fehler';

export function FotoWaehler({ eintragId, aufSchliessen }: { eintragId: string; aufSchliessen: () => void }) {
  const { t } = useT();
  const eingabe = useRef<HTMLInputElement>(null);
  const [stand, setStand] = useState<Stand>('warten');
  const [zahl, setZahl] = useState({ fertig: 0, gesamt: 0 });
  const [meldung, setMeldung] = useState<string | null>(null);

  async function verarbeiten(dateien: FileList) {
    setZahl({ fertig: 0, gesamt: dateien.length });

    for (let i = 0; i < dateien.length; i++) {
      const datei = dateien[i];
      try {
        setStand('lesen');
        const exif = await leseExif(datei);

        setStand('verkleinern');
        const bild = await bereiteVor(datei);

        setStand('senden');
        const antwort = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ endung: bild.endung }),
        });
        if (!antwort.ok) throw new Error('Upload-Ziel nicht erhalten');
        const ziel = await antwort.json();

        await Promise.all([
          fetch(ziel.anzeige.url, { method: 'PUT', body: bild.anzeige }),
          fetch(ziel.vorschau.url, { method: 'PUT', body: bild.vorschau }),
        ]);

        const ergebnis = await fotoEintragen({
          eintragId,
          pfad: ziel.anzeige.key,
          pfadVorschau: ziel.vorschau.key,
          breite: bild.breite,
          hoehe: bild.hoehe,
          bytes: bild.anzeige.size,
          grundfarbe: bild.grundfarbe,
          aufgenommenAm: exif.aufgenommenAm?.toISOString() ?? null,
          breitengrad: exif.breitengrad,
          laengengrad: exif.laengengrad,
        });

        /*
         * DIE ANTWORT MUSS AUSGEWERTET WERDEN.
         *
         * Vorher stand hier `await fotoEintragen(…)` ohne Ergebnis.
         * Mit der Fotogrenze wäre daraus genau die Sorte Fehler
         * geworden, an der dieses Projekt reich ist: Das Foto wird
         * hochgeladen, die Datenbank lehnt es ab, der Zähler läuft
         * weiter, der Dialog meldet „Fertig" — und das Bild ist
         * nirgends. Ohne eine einzige Fehlermeldung.
         */
        if (ergebnis && typeof ergebnis === 'object' && 'grenzeErreicht' in ergebnis) {
          setStand('fehler');
          setMeldung(t.fotos.grenzeErreicht.replace('{grenze}', String(ergebnis.grenze)));
          return;
        }

        setZahl((z) => ({ ...z, fertig: z.fertig + 1 }));
      } catch (e) {
        setStand('fehler');
        setMeldung(e instanceof Error ? e.message : 'Etwas ist schiefgegangen.');
        return;
      }
    }

    setStand('fertig');
    setTimeout(aufSchliessen, 400);
  }

  const text: Record<Stand, string> = {
    warten: t.fotos.warten,
    lesen: t.fotos.lesen,
    verkleinern: t.fotos.verkleinern,
    senden: `${zahl.fertig + 1} / ${zahl.gesamt}`,
    fertig: t.fotos.fertig,
    fehler: meldung ?? t.fotos.fehler,
  };

  return (
    <div className="grund dialog-grund" onClick={aufSchliessen}>
      <div className="blatt dialog-blatt" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={t.fotos.hinzufuegen}>
        <button type="button" className="zu" onClick={aufSchliessen} aria-label={t.zustand.schliessen}>
          <X size={20} strokeWidth={1.5} aria-hidden />
        </button>

        <h2>{t.fotos.hinzufuegen}</h2>
        <p data-fehler={stand === 'fehler'}>{text[stand]}</p>

        <input
          ref={eingabe}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => e.target.files?.length && verarbeiten(e.target.files)}
        />

        {stand === 'warten' && (
          <Knopf art="primaer" groesse="gross" breit onClick={() => eingabe.current?.click()}>
            {t.fotos.auswaehlen}
          </Knopf>
        )}

        <small>{t.fotos.originaleBleiben}</small>
      </div>

      <style jsx>{`
        .grund {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          background: var(--surface-scrim);
        }
        .blatt {
          position: relative;
          width: 100%;
          max-width: 420px;
          padding: var(--space-32);
          border-radius: var(--radius-14) var(--radius-14) 0 0;
          background: var(--surface-overlay);
          display: flex;
          flex-direction: column;
          gap: var(--space-16);
          box-shadow: 0 -24px 64px rgb(21 19 17 / 0.18);
        }
        .zu {
          position: absolute;
          top: var(--space-12);
          right: var(--space-12);
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: var(--content-muted);
          cursor: pointer;
        }
        h2 {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--size-24);
          letter-spacing: var(--tracking-tight);
          font-weight: var(--weight-medium);
        }
        p {
          margin: 0;
          font-size: var(--size-16);
          line-height: var(--leading-normal);
          color: var(--content-secondary);
          text-wrap: pretty;
        }
        p[data-fehler='true'] {
          color: var(--state-danger);
        }
        small {
          font-size: var(--size-14);
          color: var(--content-muted);
          line-height: var(--leading-normal);
        }
        @media (min-width: 900px) {
          .grund {
            align-items: center;
          }
          .blatt {
            border-radius: var(--radius-14);
          }
        }
      `}</style>
    </div>
  );
}
