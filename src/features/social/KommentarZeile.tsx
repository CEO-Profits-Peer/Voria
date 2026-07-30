'use client';

/**
 * Ein Kommentar samt seiner Antworten. Ruft sich selbst auf.
 *
 * TIEFENGRENZE: eingerückt wird nur bis Ebene drei. Ohne Grenze ist
 * die zwanzigste Antwort auf dem Handy ein Zeichen breit. Tiefer
 * hängende Antworten stehen bündig, gehören aber weiterhin korrekt an
 * ihrem Elternteil — die Einrückung ist Darstellung, nicht Struktur.
 *
 * Antworten sind zugeklappt. Ein Beitrag im Feed soll ruhig bleiben;
 * wer den Faden lesen will, klappt ihn auf.
 */

import { useState } from 'react';
import Link from 'next/link';
import { ArrowBigUp } from 'lucide-react';
import type { Kommentar } from './kommentarQueries';
import { kommentarAendern, kommentarVoten, kommentieren } from './kommentarActions';
import { Schreibfeld } from './Schreibfeld';
import { Avatar } from '@/ui/Avatar';
import { useT } from '@/i18n/Sprachraum';

const HOECHSTE_EINRUECKUNG = 3;

export function KommentarZeile({
  kommentar,
  beitragId,
  tiefe,
  setzeListe,
}: {
  kommentar: Kommentar;
  beitragId: string;
  tiefe: number;
  setzeListe: (liste: Kommentar[]) => void;
}) {
  const { t, locale } = useT();
  const [antwortOffen, setAntwortOffen] = useState(false);
  const [bearbeiten, setBearbeiten] = useState(false);
  const [fadenOffen, setFadenOffen] = useState(false);

  /*
   * Stimmen liegen hier lokal statt in der Liste oben. Würde jede
   * Stimme die Liste neu holen, sortierte sich der Faden unter dem
   * Finger um — man tippt auf „gut" und der Kommentar springt weg.
   */
  const [votes, setVotes] = useState(kommentar.votes);
  const [gesetzt, setGesetzt] = useState(kommentar.selbstGevotet);

  const stimmen = () => {
    setVotes((v) => v + (gesetzt ? -1 : 1));
    setGesetzt((g) => !g);
    kommentarVoten(kommentar.id, gesetzt);
  };

  const anzahl = kommentar.antworten.length;

  return (
    <article className="k" data-eingerueckt={tiefe > 0 && tiefe <= HOECHSTE_EINRUECKUNG}>
      <header>
        <Link href={`/u/${kommentar.verfasser.benutzername}`} className="k-wer">
          <Avatar bild={kommentar.verfasser.bild} name={kommentar.verfasser.name} groesse={24} />
          <span className="name">{kommentar.verfasser.name}</span>
        </Link>
        <span className="wann">
          {new Date(kommentar.wann).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
          {kommentar.bearbeitet && <> · {t.kommentar.bearbeitet}</>}
        </span>
      </header>

      {bearbeiten ? (
        <Schreibfeld
          platzhalter={t.kommentar.schreiben}
          knopf={t.kommentar.speichern}
          anfangswert={kommentar.text}
          beimAbbrechen={() => setBearbeiten(false)}
          beimAbsenden={async (text) => {
            setzeListe(await kommentarAendern(beitragId, kommentar.id, text));
            setBearbeiten(false);
          }}
        />
      ) : (
        <p className="text">{kommentar.text}</p>
      )}

      <div className="tat">
        <button
          type="button"
          data-gesetzt={gesetzt}
          onClick={stimmen}
          aria-pressed={gesetzt}
          aria-label={gesetzt ? t.feed.zustimmungZurueck : t.feed.zustimmen}
        >
          <ArrowBigUp size={16} strokeWidth={1.5} aria-hidden />
          <span>{votes}</span>
        </button>

        <button type="button" onClick={() => setAntwortOffen((o) => !o)}>
          {t.kommentar.antworten}
        </button>

        {kommentar.vonMir && !bearbeiten && (
          <button type="button" onClick={() => setBearbeiten(true)}>
            {t.kommentar.bearbeiten}
          </button>
        )}

        {anzahl > 0 && (
          <button type="button" onClick={() => setFadenOffen((o) => !o)}>
            {fadenOffen
              ? t.kommentar.antwortenVerbergen
              : anzahl === 1
                ? t.kommentar.eineAntwort
                : `${anzahl} ${t.kommentar.antwortenZeigen}`}
          </button>
        )}
      </div>

      {antwortOffen && (
        <Schreibfeld
          platzhalter={t.kommentar.antwortSchreiben}
          knopf={t.kommentar.senden}
          beimAbbrechen={() => setAntwortOffen(false)}
          beimAbsenden={async (text) => {
            setzeListe(await kommentieren(beitragId, text, kommentar.id));
            setAntwortOffen(false);
            setFadenOffen(true);
          }}
        />
      )}

      {fadenOffen &&
        kommentar.antworten.map((a) => (
          <KommentarZeile
            key={a.id}
            kommentar={a}
            beitragId={beitragId}
            tiefe={tiefe + 1}
            setzeListe={setzeListe}
          />
        ))}

      <style jsx>{`
        .k {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }
        .k[data-eingerueckt='true'] {
          padding-left: var(--space-16);
          border-left: 1px solid var(--border-subtle);
        }
        header {
          display: flex;
          align-items: center;
          gap: var(--space-8);
        }
        /* :global(), weil styled-jsx <Link> nicht scopet. Gescopet über
           header davor — siehe src/styles/huelle.css. */
        header :global(a.k-wer) {
          display: flex;
          align-items: center;
          gap: var(--space-8);
          min-width: 0;
          text-decoration: none;
          color: inherit;
        }
        .name {
          font-family: var(--font-ui);
          font-size: 13px;
          font-weight: var(--weight-medium);
          color: var(--content-primary);
        }
        .wann {
          font-family: var(--font-ui);
          font-size: 12px;
          color: var(--content-muted);
        }
        .text {
          margin: 0;
          font-size: var(--size-14);
          line-height: var(--leading-normal);
          color: var(--content-secondary);
          text-wrap: pretty;
          white-space: pre-wrap;
        }
        .tat {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          flex-wrap: wrap;
          /* Mehr als die 5 px, die die Trefferfläche unten übersteht —
             sonst liegt sie beim Umbruch über der nächsten Zeile. */
          row-gap: var(--space-8);
        }
        .tat button {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: var(--space-4);
          min-height: 34px;
          padding: 0 var(--space-8);
          border: none;
          border-radius: var(--radius-full);
          background: transparent;
          color: var(--content-muted);
          font-family: var(--font-ui);
          font-size: 12px;
          font-weight: var(--weight-medium);
          cursor: pointer;
          transition: background var(--motion-feed), color var(--motion-feed);
        }
        /* Sichtbar 34 px, getroffen wird 44 px. Sichtbare Größe und
           Trefferfläche sind zwei verschiedene Dinge — ohne das trifft
           am Handy niemand „Antworten". */
        .tat button::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 44px;
          transform: translateY(-50%);
        }
        .tat button:hover {
          background: var(--surface-sunken);
          color: var(--content-primary);
        }
        .tat button[data-gesetzt='true'] {
          background: var(--accent-soft);
          color: var(--content-accent);
        }
      `}</style>
    </article>
  );
}
