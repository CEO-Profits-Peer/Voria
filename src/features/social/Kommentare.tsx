'use client';

/**
 * Der Kommentarbereich unter einer Beitragskarte.
 *
 * Lädt erst beim Aufklappen. Der Feed zeigt fünfzig Beiträge — deren
 * Kommentare im Voraus zu holen wären fünfzig Abfragen für etwas, das
 * fast niemand aufmacht. Sichtbar ist vorher nur die Anzahl, und die
 * kommt als Zähler in der Beitragsabfrage mit.
 *
 * Die Liste lebt hier, nicht in den einzelnen Zeilen: jede Schreib-
 * aktion gibt die frische Liste zurück, und die ersetzt den Zustand.
 * So sortiert sich der Baum nach einer Antwort von selbst richtig.
 */

import { useEffect, useState, useTransition } from 'react';
import { holeKommentare, kommentieren } from './kommentarActions';
import type { Kommentar } from './kommentarQueries';
import { KommentarZeile } from './KommentarZeile';
import { Schreibfeld } from './Schreibfeld';
import { useT } from '@/i18n/Sprachraum';

export function Kommentare({
  beitragId,
  offen = true,
}: {
  beitragId: string;
  /**
   * Hat der Verfasser Kommentare zugelassen? Ist das falsch, bleiben
   * die vorhandenen lesbar, aber es kommt keiner dazu.
   *
   * Die eigentliche Schranke steht in Postgres (`comments_write`,
   * Migration 0017) — ohne diese Zeile hier stünde das Schreibfeld
   * trotzdem da, das Absenden schlüge fehl, und niemand wüsste warum.
   */
  offen?: boolean;
}) {
  const { t } = useT();
  const [liste, setListe] = useState<Kommentar[] | null>(null);
  const [laeuft, starten] = useTransition();

  useEffect(() => {
    starten(async () => setListe(await holeKommentare(beitragId)));
  }, [beitragId]);

  return (
    <section className="bereich" aria-label={t.kommentar.titel}>
      {!offen && <p className="zu-zeile">{t.kommentar.geschlossen}</p>}

      {offen && (
        <Schreibfeld
          platzhalter={t.kommentar.schreiben}
          knopf={t.kommentar.senden}
          beimAbsenden={async (text) => setListe(await kommentieren(beitragId, text, null))}
        />
      )}

      {liste === null && laeuft && <p className="still-zeile">{t.zustand.laden}</p>}

      {liste !== null && liste.length === 0 && (
        <p className="still-zeile">{t.kommentar.nochNichts}</p>
      )}

      {liste?.map((k) => (
        <KommentarZeile
          key={k.id}
          kommentar={k}
          beitragId={beitragId}
          tiefe={0}
          setzeListe={setListe}
        />
      ))}

      <style jsx>{`
        .bereich {
          display: flex;
          flex-direction: column;
          gap: var(--space-16);
          padding-top: var(--space-16);
        }
        .still-zeile {
          margin: 0;
          font-family: var(--font-ui);
          font-size: var(--size-14);
          color: var(--content-muted);
        }
      `}</style>
    </section>
  );
}
