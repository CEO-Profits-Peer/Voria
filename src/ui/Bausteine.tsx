/**
 * Bausteine: Karte, Etikett, Trenner, Seitenkopf.
 *
 * Trennung wie überall: Metazeilen, Etiketten und Beschriftungen in
 * Sans-Serif, Titel und Auszüge in Serife. So bleibt die Bedienung
 * ruhig und der Inhalt warm.
 *
 * Karten haben KEINEN Schatten — der einzige Schatten im System
 * sitzt am Dialog. Karten ohne Foto bekommen keinen Ersatzrahmen,
 * nur mehr Luft.
 */

'use client';

import Link from 'next/link';

/* ---------- Karte ------------------------------------------- */

export function Karte({
  href,
  meta,
  titel,
  auszug,
  bild,
  region,
  reihe = 0,
}: {
  href: string;
  meta?: string;
  titel: string;
  auszug?: string;
  bild?: React.ReactNode;
  region?: string;
  /** Position in der Liste — steuert die gestaffelte Einblendung. */
  reihe?: number;
}) {
  return (
    <Link
      href={href}
      className="vo-eintragskarte eintritt"
      data-region={region}
      style={{ '--i': reihe } as React.CSSProperties}
    >
      {bild && <div className="bild">{bild}</div>}
      <div className="text">
        {meta && <div className="meta">{meta}</div>}
        <h3 className="titel">{titel}</h3>
        {auszug && <p className="auszug">{auszug}</p>}
      </div>

      <style jsx>{`
        /* .vo-eintragskarte steht in src/styles/verweise.css —
           styled-jsx scopet <Link> nicht, und der Link ist hier die
           Wurzel, hat also kein natives Elternelement für :global(). */
        .bild {
          aspect-ratio: 4 / 3;
          background: var(--surface-sunken);
        }
        .text {
          padding: 18px;
        }
        .meta {
          font-family: var(--font-ui);
          font-size: 11px;
          font-weight: var(--weight-semi);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--content-muted);
        }
        .titel {
          margin: 8px 0 0;
          font-family: var(--font-display);
          font-size: var(--size-20);
          line-height: var(--leading-snug);
          letter-spacing: -0.015em;
          font-weight: var(--weight-medium);
          color: var(--content-primary);
        }
        .auszug {
          margin: 8px 0 0;
          font-family: var(--font-ui);
          font-size: 13px;
          line-height: var(--leading-normal);
          color: var(--content-muted);
          text-wrap: pretty;
        }
      `}</style>
    </Link>
  );
}

/* ---------- Etikett ----------------------------------------- */

export function Etikett({
  children,
  art = 'neutral',
}: {
  children: React.ReactNode;
  art?: 'neutral' | 'akzent' | 'umriss';
}) {
  return (
    <span data-art={art}>
      {children}
      <style jsx>{`
        span {
          display: inline-flex;
          align-items: center;
          height: 22px;
          padding: 0 9px;
          border-radius: var(--radius-full);
          border: 1px solid transparent;
          font-family: var(--font-ui);
          font-size: 11px;
          font-weight: var(--weight-medium);
          letter-spacing: 0.02em;
          white-space: nowrap;
        }
        span[data-art='neutral'] {
          background: var(--surface-sunken);
          color: var(--content-secondary);
        }
        span[data-art='akzent'] {
          background: var(--accent-soft);
          color: var(--content-accent);
        }
        span[data-art='umriss'] {
          border-color: var(--border-default);
          color: var(--content-secondary);
        }
      `}</style>
    </span>
  );
}

/* ---------- Trenner ----------------------------------------- */

/** Nutzt das Regionen-Ornament, wenn eines gesetzt ist. */
export function Trenner({ beschriftung }: { beschriftung?: string }) {
  if (!beschriftung) return <div className="ornament-divider" role="separator" />;

  return (
    <div className="mit-text" role="separator">
      <div className="ornament-divider" />
      <span>{beschriftung}</span>
      <div className="ornament-divider" />

      <style jsx>{`
        .mit-text {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .mit-text > :global(.ornament-divider) {
          flex: 1;
        }
        span {
          font-family: var(--font-ui);
          font-size: 11px;
          font-weight: var(--weight-semi);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--content-muted);
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}

/* ---------- Seitenkopf -------------------------------------- */

export function Seitenkopf({
  titel,
  zeile,
  aktion,
}: {
  titel: string;
  zeile?: string;
  aktion?: React.ReactNode;
}) {
  return (
    <header>
      <div className="worte">
        <h1>{titel}</h1>
        {zeile && <p>{zeile}</p>}
      </div>
      {aktion}

      <style jsx>{`
        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 28px;
        }
        .worte {
          min-width: 0;
        }
        h1 {
          margin: 0;
          font-family: var(--font-display);
          font-size: 28px;
          line-height: 1.2;
          letter-spacing: -0.02em;
          font-weight: var(--weight-regular);
          color: var(--content-primary);
        }
        p {
          margin: 6px 0 0;
          font-family: var(--font-ui);
          font-size: 13px;
          line-height: var(--leading-normal);
          color: var(--content-muted);
          max-width: 62ch;
          text-wrap: pretty;
        }
        @media (min-width: 900px) {
          header {
            margin-bottom: 32px;
          }
          h1 {
            font-size: 32px;
          }
        }
      `}</style>
    </header>
  );
}
