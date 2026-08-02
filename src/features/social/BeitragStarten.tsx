'use client';

/**
 * „Beitrag erstellen" — im Log und im Feed.
 *
 * ═══════════════════════════════════════════════════════════════
 * WAS HIER PASSIERT, UND WARUM ES NICHT AUSSIEHT WIE INSTAGRAM
 * ═══════════════════════════════════════════════════════════════
 *
 * Entschieden am 30.07. (`docs/ENTSCHEIDUNGEN.md`, „Beiträge bleiben
 * an Tage gebunden"): `posts.entry_id` ist `not null unique` — ein
 * Beitrag IST ein geteilter Tag. Genau daraus zieht Voria seinen
 * Charakter.
 *
 * Ein eigener Beitragseditor mit eigener Tabelle würde das umkehren.
 * Dann gäbe es zwei Sorten Inhalt, zwei Wege sie zu schreiben, und
 * bei jedem Beitrag die Frage „warum steht das nicht in meinem Log".
 *
 * Der beschlossene Weg ist deshalb dieser: Der Knopf legt **still
 * einen Tag mit heutigem Datum an** und öffnet ihn. Nach außen fühlt
 * es sich an wie „posten", innen bleibt das Modell heil — und der
 * Beitrag steht danach ganz selbstverständlich auch im Tagebuch.
 *
 * Ehrlich bleibt es dadurch, dass genau das dabeisteht. Wer den Knopf
 * drückt, weiß hinterher, dass ein Tag entstanden ist.
 */

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PenLine, X } from 'lucide-react';
import { beitragBeginnen } from './beitragActions';
import { useT } from '@/i18n/Sprachraum';

export function BeitragStarten({ kompakt = false }: { kompakt?: boolean }) {
  const { t } = useT();
  const router = useRouter();
  const [offen, setOffen] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, starten] = useTransition();

  const los = () =>
    starten(async () => {
      setFehler(null);
      const ziel = await beitragBeginnen();

      if (!ziel) {
        /*
         * Kein stiller Abbruch. Der häufigste Grund ist harmlos und
         * benennbar: Es gibt noch keine Reise, an die ein Tag hängen
         * könnte.
         */
        setFehler(t.beitrag.brauchtReise);
        return;
      }

      router.push(ziel);
    });

  return (
    <>
      <button
        type="button"
        className={kompakt ? 'anlegen' : 'anlegen beitrag-starten'}
        onClick={() => setOffen(true)}
      >
        <PenLine size={16} strokeWidth={1.75} aria-hidden />
        {t.beitrag.neu}
      </button>

      {offen && (
        <div className="grund dialog-grund" onClick={() => setOffen(false)}>
          <div
            className="blatt dialog-blatt"
            role="dialog"
            aria-label={t.beitrag.neu}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="zu"
              onClick={() => setOffen(false)}
              aria-label={t.zustand.schliessen}
            >
              <X size={20} strokeWidth={1.5} aria-hidden />
            </button>

            <h2>{t.beitrag.neu}</h2>
            {/* Sagt, was gleich passiert. Ein Knopf, der ungefragt
                einen Tagebucheintrag anlegt, wäre eine Überraschung. */}
            <p className="beitrag-erklaerung">{t.beitrag.neuZeile}</p>

            {fehler && (
              <p className="teilen-fehler" role="alert">
                {fehler}
              </p>
            )}

            <button type="button" className="anlegen beitrag-los" onClick={los} disabled={laeuft}>
              {laeuft ? t.auth.einenMoment : t.beitrag.losGehts}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
