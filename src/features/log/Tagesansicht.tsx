'use client';

/**
 * Ein Tag, in einem der beiden Modi.
 *
 * Beide Modi zeigen dieselben Blöcke. Der ruhige Modus nutzt die
 * Reihenfolge, der Open Space das Layout. Der Wechsel verliert nichts.
 *
 * Diese Komponente hält die Zustände, die beide Modi teilen:
 * Fotoauswahl, Teilen, Vollansicht.
 */

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import type { Tag } from './queries';
import { modusWechseln } from './actions';
import { RuhigerModus } from './RuhigerModus';
import { OpenSpace } from './OpenSpace';
import { FotoWaehler } from './FotoWaehler';
import { TeilenDialog } from './TeilenDialog';
import { Vollansicht } from './Vollansicht';
import { useT } from '@/i18n/Sprachraum';

export function Tagesansicht({
  tag,
  reiseId,
  region,
  istErsterTag,
}: {
  tag: Tag;
  reiseId: string;
  region: string;
  istErsterTag: boolean;
}) {
  const { t } = useT();
  const [modus, setModus] = useState(tag.modus);
  const [fotoOffen, setFotoOffen] = useState(false);
  const [teilenOffen, setTeilenOffen] = useState(false);
  const [vollansicht, setVollansicht] = useState<number | null>(null);
  const [, starten] = useTransition();

  const fotos = tag.bloecke.filter((b) => b.art === 'photo' && b.foto).map((b) => ({ ...b.foto!, id: b.id }));

  const umschalten = () => {
    const neu = modus === 'quiet' ? 'free' : 'quiet';
    setModus(neu);
    starten(() => {
      modusWechseln(tag.id, neu);
    });
  };

  return (
    <div className="tagblatt region-surface" data-region={region}>
      <header className="kopf">
        <Link href={`/log/${reiseId}`} aria-label={t.log.zurueckZurReise} className="zurueck">
          <ChevronLeft size={22} strokeWidth={1.5} aria-hidden />
        </Link>
        <div className="rechts">
          <span className="ornament-corner" aria-hidden />
          <button
            type="button"
            onClick={umschalten}
            className="modus"
            aria-label={modus === 'quiet' ? t.log.zurFreienFlaeche : t.log.zurRuhigenSeite}
          >
            {modus === 'quiet' ? t.log.modusRuhig : t.log.modusFrei}
          </button>
        </div>
      </header>

      <div className="modus-wechsel" key={modus}>
      {modus === 'quiet' ? (
        <RuhigerModus
          eintragId={tag.id}
          datum={tag.datum}
          ort={tag.ort}
          titel={tag.titel}
          bloecke={tag.bloecke}
          istErsterTag={istErsterTag}
          sichtbarkeit={tag.sichtbarkeit}
          aufFotoWaehlen={() => setFotoOffen(true)}
          aufTeilen={() => setTeilenOffen(true)}
          aufFotoOeffnen={(i) => setVollansicht(i)}
        />
      ) : (
        <OpenSpace bloecke={tag.bloecke} aufHinzufuegen={() => setFotoOffen(true)} />
      )}
      </div>

      {fotoOffen && <FotoWaehler eintragId={tag.id} aufSchliessen={() => setFotoOffen(false)} />}

      {teilenOffen && (
        <TeilenDialog
          eintragId={tag.id}
          jetzt={tag.sichtbarkeit}
          aufSchliessen={() => setTeilenOffen(false)}
        />
      )}

      {vollansicht !== null && (
        <Vollansicht fotos={fotos} start={vollansicht} aufSchliessen={() => setVollansicht(null)} />
      )}

      <style jsx>{`
        .tagblatt {
          min-height: 100%;
        }
        .kopf {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 52px;
          padding: 0 var(--space-12) 0 var(--space-8);
        }
        /* :global(), weil styled-jsx <Link> nicht scopet.
           Gescopet bleibt es durch .kopf davor. */
        .kopf :global(a.zurueck) {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: var(--radius-8);
          color: var(--content-secondary);
        }
        .rechts {
          display: flex;
          align-items: center;
          gap: var(--space-12);
        }
        .modus {
          height: 34px;
          padding: 0 var(--space-16);
          border-radius: var(--radius-full);
          border: 1px solid var(--border-subtle);
          background: transparent;
          color: var(--content-secondary);
          font-family: var(--font-ui);
          font-family: var(--font-ui);
          font-size: 11px;
          font-weight: var(--weight-semi);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          transition: border-color var(--motion-feed), color var(--motion-feed);
        }
        .modus:hover {
          border-color: var(--border-strong);
          color: var(--content-primary);
        }
      `}</style>
    </div>
  );
}
