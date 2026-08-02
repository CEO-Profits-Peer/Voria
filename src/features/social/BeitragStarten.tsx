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
 * Der beschlossene Weg ist deshalb dieser: Der Knopf legt **still
 * einen Tag mit heutigem Datum an** und öffnet ihn. Nach außen fühlt
 * es sich an wie „posten", innen bleibt das Modell heil.
 *
 * ── DIE ZWISCHENSEITE IST WEG ──────────────────────────────────
 *
 * Vorher stand zwischen Knopf und Editor ein Dialog, der erklärte,
 * was gleich passiert. Gut gemeint, aber an der falschen Stelle: Wer
 * „Beitrag erstellen" drückt, hat sich entschieden. Eine Erklärung,
 * die man jedes Mal wegklicken muss, wird nach dem zweiten Mal nicht
 * mehr gelesen — sie ist dann nur noch ein Klick.
 *
 * Die Erklärung ist nicht verschwunden, sie ist ABRUFBAR statt
 * aufgedrängt: ein Fragezeichen daneben, im Log. Im Feed nicht — dort
 * will man los.
 *
 * Ein Dialog bleibt für einen Fall: wenn es nicht geht. Ohne Reise
 * kann kein Tag entstehen, und das muss jemand erfahren, statt auf
 * einen Knopf zu drücken, der nichts tut.
 *
 * ── EIGENE STILE, WEIL ES KEINE GLOBALEN GAB ───────────────────
 *
 * Der alte Dialog trug `.grund`, `.blatt` und `.zu` — Klassen, die
 * NIRGENDS definiert sind. `.dialog-grund` und `.dialog-blatt` aus
 * `bewegung.css` liefern nur die Animation, keine Lage und keinen
 * Hintergrund. Der Kasten stand also mitten im Seitenfluss statt über
 * der Seite. Genau die Sorte Fehler, die weder Build noch Konsole
 * meldet.
 */

import { useState, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PenLine, HelpCircle, X, Plus } from 'lucide-react';
import { beitragBeginnen } from './beitragActions';
import { useT } from '@/i18n/Sprachraum';

export function BeitragStarten({
  kompakt = false,
  /** Das Fragezeichen daneben. Im Log ja, im Feed nein. */
  erklaerung = false,
  /**
   * Am Handy nur das Symbol. Im Feed steht der Knopf neben den
   * Reitern, und dort ist die Zeile schmal — mit Wort wäre für die
   * Reiter kein Platz mehr. Der Name bleibt über `aria-label` da.
   */
  symbolAmHandy = false,
}: {
  kompakt?: boolean;
  erklaerung?: boolean;
  symbolAmHandy?: boolean;
}) {
  const { t } = useT();
  const router = useRouter();
  const [info, setInfo] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [laeuft, starten] = useTransition();

  const zu = () => {
    setInfo(false);
    setFehler(null);
  };

  const los = () =>
    starten(async () => {
      setFehler(null);
      const ziel = await beitragBeginnen();

      if (!ziel) {
        /* Kein stiller Abbruch. Der häufigste Grund ist harmlos und
           benennbar: Es gibt noch keine Reise. */
        setFehler(t.beitrag.brauchtReise);
        return;
      }

      router.push(ziel);
    });

  return (
    <span className="starten">
      <button
        type="button"
        className={kompakt ? 'anlegen' : 'anlegen beitrag-starten'}
        data-symbol={symbolAmHandy || undefined}
        aria-label={t.beitrag.neu}
        onClick={los}
        disabled={laeuft}
      >
        <PenLine size={16} strokeWidth={1.75} aria-hidden />
        <span className="wort">{t.beitrag.neu}</span>
      </button>

      {erklaerung && (
        <button
          type="button"
          className="was"
          onClick={() => setInfo(true)}
          aria-label={t.beitrag.wasPassiert}
        >
          <HelpCircle size={17} strokeWidth={1.5} aria-hidden />
        </button>
      )}

      {/*
        AN DEN SEITENKÖRPER GEHÄNGT, nicht hierher.

        Der Knopf steht im Feed in der Reiterleiste, und die trägt beim
        Aus- und Einblenden ein `transform`. Ein Element mit
        `position: fixed` richtet sich dann nicht mehr am Fenster aus,
        sondern an dieser Leiste — der Dialog säße als schmaler
        Streifen unter den Reitern. Der Umweg über `createPortal` macht
        die Lage unabhängig davon, wo der Knopf gerade steckt.

        `info` und `fehler` stehen anfangs auf `false`; auf dem Server
        wird das hier also nie erreicht.
      */}
      {(info || fehler) &&
        createPortal(
          <div className="wand dialog-grund" onClick={zu}>
            <div
              className="karte dialog-blatt"
              role="dialog"
              aria-label={fehler ? t.beitrag.neu : t.beitrag.wasPassiert}
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" className="weg" onClick={zu} aria-label={t.zustand.schliessen}>
                <X size={20} strokeWidth={1.5} aria-hidden />
              </button>

              <h2>{fehler ? t.beitrag.neu : t.beitrag.wasPassiert}</h2>
              <p className="beitrag-erklaerung">{fehler ?? t.beitrag.neuZeile}</p>

              {/* Bei „keine Reise" nicht nur sagen, was fehlt, sondern
                  den Weg dorthin anbieten. */}
              {fehler && (
                <Link href="/log/neu" className="anlegen beitrag-los">
                  <Plus size={18} strokeWidth={1.5} aria-hidden /> {t.log.neueReise}
                </Link>
              )}
            </div>
          </div>,
          document.body,
        )}

      <style jsx>{`
        .starten {
          display: inline-flex;
          align-items: center;
          gap: var(--space-4);
        }
        .was {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border: none;
          border-radius: var(--radius-full);
          background: transparent;
          color: var(--content-muted);
          cursor: pointer;
        }
        /* 34 px sichtbar, 44 px Trefferfläche. */
        .was::after {
          content: '';
          position: absolute;
          inset: -5px;
        }
        .was:hover {
          color: var(--content-primary);
        }

        /* Am Handy schrumpft der Knopf auf sein Symbol — aber nicht
           unter 44 px, das ist die Fingergröße. */
        @media (max-width: 560px) {
          button[data-symbol] .wort {
            display: none;
          }
          button[data-symbol] {
            width: 44px;
            min-width: 44px;
            padding: 0;
            justify-content: center;
          }
        }

        .wand {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          background: var(--surface-scrim);
        }
        .karte {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: var(--space-20);
          width: 100%;
          max-width: 440px;
          padding: var(--space-32);
          border-radius: var(--radius-14) var(--radius-14) 0 0;
          background: var(--surface-overlay);
          text-align: left;
          box-shadow: 0 -24px 64px rgb(21 19 17 / 0.18);
        }
        .weg {
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
          padding-right: var(--space-32);
          font-family: var(--font-display);
          font-size: var(--size-24);
          letter-spacing: var(--tracking-tight);
          font-weight: var(--weight-medium);
        }
        @media (min-width: 900px) {
          .wand {
            align-items: center;
          }
          .karte {
            border-radius: var(--radius-14);
          }
        }
      `}</style>
    </span>
  );
}
