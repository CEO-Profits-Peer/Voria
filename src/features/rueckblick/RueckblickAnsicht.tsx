'use client';

/**
 * Der Rückblick als eine Seite.
 *
 * Jeder Abschnitt trägt das Theme einer Region, in der man war —
 * die Seite blättert sich also selbst durch das eigene Jahr. Wer
 * nirgends war, bekommt die neutrale Fassung, keinen leeren Kasten.
 *
 * Kein Vergleich, keine Bestenliste, kein „mehr als letztes Jahr".
 */

import Link from 'next/link';
import { useT } from '@/i18n/Sprachraum';
import type { Rueckblick } from './queries';

export function RueckblickAnsicht({ daten }: { daten: Rueckblick }) {
  const { t, locale } = useT();

  const hauptregion = daten.regionen[0] ?? undefined;
  const zahl = (n: number) => n.toLocaleString(locale);

  return (
    <div className="wrap">
      <nav className="jahre" aria-label={t.rueckblick.titel}>
        {daten.verfuegbareJahre.map((j) => (
          <Link key={j} href={`/rueckblick/${j}`} data-aktiv={j === daten.jahr}>
            {j}
          </Link>
        ))}
      </nav>

      <section className="region-surface kopf eintritt" data-region={hauptregion}>
        <span className="ornament-corner" aria-hidden />
        <span className="klein">{t.rueckblick.inDiesemJahr}</span>
        <h1>{daten.jahr}</h1>
        <div className="ornament-divider" />
        <dl className="zahlenreihe">
          <div>
            <dt>{daten.tage === 1 ? t.log.tag : t.log.tage}</dt>
            <dd>{zahl(daten.tage)}</dd>
          </div>
          <div>
            <dt>{t.rueckblick.worte}</dt>
            <dd>{zahl(daten.worte)}</dd>
          </div>
          <div>
            <dt>{t.rueckblick.fotos}</dt>
            <dd>{zahl(daten.fotos)}</dd>
          </div>
          <div>
            <dt>{daten.laender.length === 1 ? t.log.land : t.log.laender}</dt>
            <dd>{zahl(daten.laender.length)}</dd>
          </div>
        </dl>
      </section>

      {daten.laengsteReise && (
        <section
          className="region-surface tafel eintritt"
          data-region={daten.laengsteReise.region}
          style={{ '--i': 1 } as React.CSSProperties}
        >
          <span className="klein">{t.rueckblick.laengsteReise}</span>
          <h2>{daten.laengsteReise.titel}</h2>
          <p>
            {zahl(daten.laengsteReise.tage)}{' '}
            {daten.laengsteReise.tage === 1 ? t.log.tag : t.log.tage}
          </p>
        </section>
      )}

      {daten.laengsterTag && daten.laengsterTag.worte > 0 && (
        <section
          className="region-surface tafel eintritt"
          data-region={hauptregion}
          style={{ '--i': 2 } as React.CSSProperties}
        >
          <span className="klein">{t.rueckblick.meisteWorte}</span>
          <h2>{daten.laengsterTag.titel ?? daten.laengsterTag.ort ?? t.log.ohneTitel}</h2>
          <p>
            {new Date(daten.laengsterTag.datum).toLocaleDateString(locale, {
              day: 'numeric',
              month: 'long',
            })}{' '}
            · {zahl(daten.laengsterTag.worte)} {t.rueckblick.worte}
          </p>
        </section>
      )}

      {daten.regionen.length > 0 && (
        <section className="streifen eintritt" style={{ '--i': 3 } as React.CSSProperties}>
          {daten.regionen.map((r) => (
            <span key={r} className="region-surface marke" data-region={r}>
              {t.regionen[r as keyof typeof t.regionen]}
            </span>
          ))}
        </section>
      )}

      <style jsx>{`
        .wrap {
          display: flex;
          flex-direction: column;
          gap: var(--space-24);
        }
        .jahre {
          display: flex;
          gap: var(--space-8);
          flex-wrap: wrap;
        }
        .jahre :global(a) {
          display: inline-flex;
          align-items: center;
          height: 32px;
          padding: 0 14px;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          color: var(--content-muted);
          font-family: var(--font-ui);
          font-size: 13px;
          font-weight: var(--weight-medium);
          text-decoration: none;
          transition: border-color var(--motion-feed), color var(--motion-feed);
        }
        .jahre :global(a[data-aktiv='true']) {
          border-color: var(--accent-primary);
          color: var(--content-accent);
        }
        .kopf,
        .tafel {
          position: relative;
          padding: 32px 28px;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-14);
          display: flex;
          flex-direction: column;
          gap: var(--space-16);
          overflow: hidden;
        }
        .kopf :global(.ornament-corner) {
          position: absolute;
          top: var(--space-16);
          right: var(--space-16);
        }
        .klein {
          font-family: var(--font-ui);
          font-size: 11px;
          font-weight: var(--weight-semi);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--content-muted);
        }
        h1 {
          margin: 0;
          font-family: var(--font-display);
          font-size: 52px;
          line-height: var(--leading-tight);
          letter-spacing: var(--tracking-tight);
          font-weight: var(--weight-regular);
          color: var(--content-primary);
        }
        h2 {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--size-30);
          line-height: var(--leading-snug);
          letter-spacing: var(--tracking-tight);
          font-weight: var(--weight-medium);
          color: var(--content-primary);
        }
        .tafel p {
          margin: 0;
          font-family: var(--font-ui);
          font-size: 13px;
          color: var(--content-muted);
        }
        .zahlenreihe {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-24);
          margin: 0;
        }
        .zahlenreihe dt {
          font-family: var(--font-ui);
          font-size: 11px;
          font-weight: var(--weight-semi);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--content-muted);
        }
        .zahlenreihe dd {
          margin: var(--space-4) 0 0;
          font-family: var(--font-display);
          font-size: 32px;
          letter-spacing: -0.02em;
          color: var(--content-primary);
        }
        .streifen {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-8);
        }
        .marke {
          display: inline-flex;
          align-items: center;
          height: 32px;
          padding: 0 14px;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          font-family: var(--font-ui);
          font-size: 12px;
          font-weight: var(--weight-medium);
          color: var(--content-primary);
        }
        @media (min-width: 640px) {
          .zahlenreihe {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
