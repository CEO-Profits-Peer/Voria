/**
 * Leerer Zustand.
 *
 * Der erste Bildschirm, den ein neuer Nutzer sieht. Er darf nicht wie
 * eine unfertige Seite wirken, sondern wie eine unbeschriebene.
 *
 * Bewusst klein gehalten: eine ruhige Karte mittig, kein riesiger Titel
 * im Nichts. Kein Fehlerton, keine Aufforderung, kein Ausrufezeichen.
 */

'use client';

export function LeererBereich({
  titel,
  zeile,
  aktion,
}: {
  titel: string;
  zeile: string;
  aktion?: React.ReactNode;
}) {
  return (
    <div className="huelle">
      <div className="karte">
        <span className="ornament-corner ecke" aria-hidden />
        <h1 className="titel">{titel}</h1>
        <p className="zeile">{zeile}</p>
        {aktion && <div className="aktion">{aktion}</div>}
      </div>

      <style jsx>{`
        .huelle {
          min-height: calc(100dvh - 96px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 20px 64px;
        }
        .karte {
          position: relative;
          width: 100%;
          max-width: 420px;
          padding: 32px 28px 28px;
          border: 1px solid var(--border-subtle);
          border-radius: 14px;
          background: var(--raised-tint, var(--surface-raised));
          display: flex;
          flex-direction: column;
          /* flex-start, sonst zieht sich der Knopf über die ganze Breite. */
          align-items: flex-start;
          gap: 10px;
        }
        .ecke {
          position: absolute;
          top: 14px;
          right: 14px;
          opacity: 0.35;
        }
        .titel {
          margin: 0;
          padding-right: 44px;
          font-family: var(--font-display);
          font-size: 24px;
          line-height: 1.25;
          letter-spacing: -0.02em;
          font-weight: var(--weight-regular);
          color: var(--content-primary);
          text-wrap: balance;
        }
        .zeile {
          margin: 0;
          font-family: var(--font-ui);
          font-size: 13px;
          line-height: 1.65;
          color: var(--content-muted);
          text-wrap: pretty;
        }
        .aktion {
          display: flex;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
}
