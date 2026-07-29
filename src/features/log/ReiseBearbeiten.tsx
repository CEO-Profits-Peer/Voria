'use client';

/**
 * Reise bearbeiten: Titel, Zeitraum, Länder, Region.
 *
 * Die Region wird normalerweise aus den Ländern berechnet — das Land mit
 * den meisten Tagen gewinnt. Wer will, kann sie überschreiben, etwa weil
 * sich eine Grenzregion anders anfühlt, als die Zuordnung meint.
 */

import { useState, useTransition } from 'react';
import { X, Plus } from 'lucide-react';
import { Feld } from '@/ui/Feld';
import { Knopf } from '@/ui/Knopf';
import { REGIONS, REGION_LABELS, regionForCountry } from '@/themes/regions';
import { reiseSpeichern, landHinzufuegen, landEntfernen } from './actions';

export function ReiseBearbeiten({
  reiseId,
  titel: titelStart,
  von: vonStart,
  bis: bisStart,
  laender,
  regionUeberschrieben,
}: {
  reiseId: string;
  titel: string;
  von: string | null;
  bis: string | null;
  laender: { code: string; tage: number }[];
  regionUeberschrieben: string | null;
}) {
  const [titel, setTitel] = useState(titelStart);
  const [von, setVon] = useState(vonStart ?? '');
  const [bis, setBis] = useState(bisStart ?? '');
  const [region, setRegion] = useState(regionUeberschrieben ?? '');
  const [neuesLand, setNeuesLand] = useState('');
  const [laeuft, starten] = useTransition();

  const berechnet = laender.length
    ? regionForCountry([...laender].sort((a, b) => b.tage - a.tage)[0].code)
    : 'neutral';

  return (
    <div className="wrap">
      <Feld
        name="titel"
        beschriftung="Name der Reise"
        value={titel}
        onChange={(e) => setTitel(e.target.value)}
      />

      <div className="zwei">
        <Feld name="von" type="date" beschriftung="Erster Tag" value={von} onChange={(e) => setVon(e.target.value)} />
        <Feld name="bis" type="date" beschriftung="Letzter Tag" value={bis} onChange={(e) => setBis(e.target.value)} />
      </div>

      <section>
        <h2>Länder</h2>
        <p className="zeile">
          Bestimmt, wie die Reise aussieht. Mehrere Länder sind möglich — es gewinnt das mit den
          meisten Tagen.
        </p>

        <ul className="laender">
          {laender.map((l) => (
            <li key={l.code}>
              <span>{l.code}</span>
              <small>
                {l.tage} {l.tage === 1 ? 'Tag' : 'Tage'}
              </small>
              <button
                type="button"
                aria-label={`${l.code} entfernen`}
                onClick={() => starten(() => void landEntfernen(reiseId, l.code))}
              >
                <X size={16} strokeWidth={1.5} aria-hidden />
              </button>
            </li>
          ))}
        </ul>

        <form
          className="dazu"
          onSubmit={(e) => {
            e.preventDefault();
            const code = neuesLand.trim().toUpperCase();
            if (code.length !== 2) return;
            starten(async () => {
              await landHinzufuegen(reiseId, code);
              setNeuesLand('');
            });
          }}
        >
          <input
            value={neuesLand}
            onChange={(e) => setNeuesLand(e.target.value)}
            placeholder="MA"
            maxLength={2}
            aria-label="Länderkürzel"
          />
          <button type="submit" aria-label="Land hinzufügen">
            <Plus size={18} strokeWidth={1.5} aria-hidden />
          </button>
        </form>
      </section>

      <section>
        <h2>Aussehen</h2>
        <p className="zeile">
          Aus den Ländern ergibt sich <strong>{REGION_LABELS[berechnet as keyof typeof REGION_LABELS] ?? 'noch nichts'}</strong>.
          Du kannst das überschreiben.
        </p>
        <select value={region} onChange={(e) => setRegion(e.target.value)} aria-label="Region">
          <option value="">Aus den Ländern ableiten</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {REGION_LABELS[r]}
            </option>
          ))}
        </select>
      </section>

      <Knopf
        art="primaer"
        groesse="gross"
        breit
        disabled={laeuft}
        onClick={() =>
          starten(() =>
            reiseSpeichern(reiseId, {
              titel,
              von: von || null,
              bis: bis || null,
              region: region || null,
            }),
          )
        }
      >
        {laeuft ? 'Einen Moment' : 'Übernehmen'}
      </Knopf>

      <style jsx>{`
        .wrap {
          display: flex;
          flex-direction: column;
          gap: var(--space-32);
        }
        .zwei {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-16);
        }
        h2 {
          margin: 0 0 var(--space-8);
          font-family: var(--font-display);
          font-size: var(--size-24);
          letter-spacing: var(--tracking-tight);
          font-weight: var(--weight-medium);
        }
        .zeile {
          margin: 0 0 var(--space-16);
          font-size: var(--size-16);
          line-height: var(--leading-normal);
          color: var(--content-secondary);
          text-wrap: pretty;
        }
        .laender {
          list-style: none;
          margin: 0 0 var(--space-12);
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-8);
        }
        .laender li {
          display: inline-flex;
          align-items: center;
          gap: var(--space-8);
          height: 44px;
          padding: 0 var(--space-8) 0 var(--space-16);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-full);
        }
        .laender span {
          font-weight: var(--weight-medium);
          letter-spacing: var(--tracking-wide);
        }
        .laender small {
          font-size: var(--size-14);
          color: var(--content-muted);
        }
        .laender button,
        .dazu button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: var(--radius-full);
          background: transparent;
          color: var(--content-muted);
          cursor: pointer;
        }
        .laender button:hover {
          background: var(--surface-sunken);
          color: var(--state-danger);
        }
        .dazu {
          display: flex;
          align-items: center;
          gap: var(--space-8);
        }
        .dazu input {
          width: 90px;
          height: 44px;
          padding: 0 var(--space-16);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-8);
          background: var(--surface-raised);
          color: var(--content-primary);
          font-family: var(--font-ui);
          font-size: var(--size-16);
          text-transform: uppercase;
          outline: none;
        }
        .dazu button {
          width: 44px;
          height: 44px;
          border: 1px solid var(--border-default);
          border-radius: var(--radius-8);
        }
        select {
          width: 100%;
          height: 48px;
          padding: 0 var(--space-16);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-8);
          background: var(--surface-raised);
          color: var(--content-primary);
          font-family: var(--font-ui);
          font-size: var(--size-16);
        }
      `}</style>
    </div>
  );
}
