'use client';

/**
 * Die Startseite.
 *
 * Sie zeigt statt zu behaupten. Der Regionenwechsel im Hero ist das
 * Argument, das kein Wettbewerber hat — derselbe Eintrag verwandelt
 * sich vor den Augen des Besuchers.
 *
 * Kein Countdown, keine Dringlichkeit, kein „revolutionär".
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Region } from '@/themes/regions';
import { useT } from '@/i18n/Sprachraum';

const REIHENFOLGE: Region[] = ['ostasien', 'maghreb', 'nordeuropa', 'anden'];

export function Startseite() {
  const { t } = useT();
  const [i, setI] = useState(0);

  const reigen = REIHENFOLGE.map((region, k) => ({
    region,
    ort: [t.start.beispielOrt1, t.start.beispielOrt2, t.start.beispielOrt3, t.start.beispielOrt4][k],
    text: [t.start.beispielText1, t.start.beispielText2, t.start.beispielText3, t.start.beispielText4][k],
  }));

  useEffect(() => {
    const uhr = setInterval(() => setI((v) => (v + 1) % reigen.length), 4800);
    return () => clearInterval(uhr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const jetzt = reigen[i];

  return (
    <main>
      <nav className="kopfleiste">
        <span className="marke">{t.marke}</span>
        <span className="kopf-rechts">
          <Link href="/anmelden">{t.auth.anmelden}</Link>
          <Link href="/registrieren" className="anlegen">
            {t.start.anfangen}
          </Link>
        </span>
      </nav>

      <section className="hero">
        <div className="worte">
          <h1>{t.start.hero}</h1>
          <p>{t.start.heroZeile}</p>
          <Link href="/registrieren" className="gross-knopf">
            {t.start.tagebuchAnfangen}
          </Link>
          <span className="klein">{t.start.kostenlos}</span>
        </div>

        <div className="buehne">
          <div className="region-surface blatt" data-region={jetzt.region} key={jetzt.region}>
            <span className="ornament-corner" aria-hidden />
            <div className="blatt-inhalt">
              <span className="meta">{jetzt.ort}</span>
              <p className="eintrag">{jetzt.text}</p>
              <div className="ornament-divider" />
              <span className="fuss">{t.teilen.privat}</span>
            </div>
          </div>

          <div className="punkte" role="tablist" aria-label="Regionen">
            {reigen.map((r, k) => (
              <button
                key={r.region}
                type="button"
                role="tab"
                aria-selected={k === i}
                aria-label={t.regionen[r.region]}
                data-aktiv={k === i}
                onClick={() => setI(k)}
              />
            ))}
          </div>
          <span className="buehne-text">{t.regionen[jetzt.region]}</span>
        </div>
      </section>

      <section className="drei">
        <article>
          <h2>{t.start.zweiArten}</h2>
          <p>{t.start.zweiArtenZeile}</p>
        </article>
        <article>
          <h2>{t.start.fotosWissen}</h2>
          <p>{t.start.fotosWissenZeile}</p>
        </article>
        <article>
          <h2>{t.start.zwoelfWelten}</h2>
          <p>{t.start.zwoelfWeltenZeile}</p>
        </article>
      </section>

      <section className="ruhe">
        <h2>{t.start.sozialesFreiwillig}</h2>
        <p>{t.start.sozialesZeile1}</p>
        <p>{t.start.sozialesZeile2}</p>
      </section>

      <footer className="fussleiste">
        <span>{t.marke}</span>
        <Link href="/registrieren">{t.start.anfangen}</Link>
      </footer>

      <style jsx>{`
        main {
          max-width: 1140px;
          margin: 0 auto;
          padding: var(--space-24);
        }
        .kopfleiste {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-8) 0 var(--space-64);
        }
        .marke {
          font-family: var(--font-display);
          font-size: var(--size-24);
          letter-spacing: var(--tracking-tight);
        }
        .kopf-rechts {
          display: flex;
          align-items: center;
          gap: var(--space-20);
        }
        .kopf-rechts :global(a) {
          color: var(--content-secondary);
          text-decoration: none;
          font-size: var(--size-16);
        }
        .kopf-rechts :global(a.anlegen) {
          height: 44px;
          display: inline-flex;
          align-items: center;
          padding: 0 var(--space-20);
          border-radius: var(--radius-8);
          background: var(--accent-primary);
          color: var(--accent-contrast);
          font-weight: var(--weight-medium);
        }

        .hero {
          display: grid;
          gap: var(--space-48);
          padding-bottom: var(--space-128);
        }
        .worte {
          display: flex;
          flex-direction: column;
          gap: var(--space-24);
        }
        h1 {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--size-38);
          line-height: var(--leading-tight);
          letter-spacing: var(--tracking-tight);
          font-weight: var(--weight-regular);
          max-width: 18ch;
          text-wrap: balance;
        }
        .worte p {
          margin: 0;
          font-size: var(--size-18);
          line-height: var(--leading-relaxed);
          color: var(--content-secondary);
          max-width: 46ch;
          text-wrap: pretty;
        }
        .worte :global(a.gross-knopf) {
          align-self: flex-start;
          display: inline-flex;
          align-items: center;
          height: 52px;
          padding: 0 var(--space-32);
          border-radius: var(--radius-8);
          background: var(--accent-primary);
          color: var(--accent-contrast);
          font-size: var(--size-18);
          font-weight: var(--weight-medium);
          text-decoration: none;
        }
        .klein {
          font-size: var(--size-14);
          color: var(--content-muted);
        }

        .buehne {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-16);
        }
        .blatt {
          position: relative;
          width: 100%;
          max-width: 420px;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-14);
          overflow: hidden;
          animation: auf var(--duration-600) var(--ease-out);
        }
        @keyframes auf {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
        }
        .blatt :global(.ornament-corner) {
          position: absolute;
          top: var(--space-16);
          right: var(--space-16);
        }
        .blatt-inhalt {
          padding: var(--space-32);
          display: flex;
          flex-direction: column;
          gap: var(--space-16);
        }
        .meta,
        .fuss {
          font-size: var(--size-14);
          font-weight: var(--weight-medium);
          letter-spacing: var(--tracking-wide);
          text-transform: uppercase;
          color: var(--content-muted);
        }
        .eintrag {
          margin: 0;
          font-size: var(--size-18);
          line-height: var(--leading-relaxed);
          color: var(--content-primary);
          text-wrap: pretty;
        }
        .punkte {
          display: flex;
          gap: var(--space-8);
        }
        .punkte button {
          width: 8px;
          height: 8px;
          padding: 0;
          border: none;
          border-radius: var(--radius-full);
          background: var(--border-default);
          cursor: pointer;
          position: relative;
          transition: background var(--motion-feed);
        }
        .punkte button::after {
          content: '';
          position: absolute;
          inset: -18px;
        }
        .punkte button[data-aktiv='true'] {
          background: var(--content-muted);
        }
        .buehne-text {
          font-size: var(--size-14);
          color: var(--content-muted);
        }

        .drei {
          display: grid;
          gap: var(--space-48);
          padding-bottom: var(--space-128);
        }
        .drei h2,
        .ruhe h2 {
          margin: 0 0 var(--space-12);
          font-family: var(--font-display);
          font-size: var(--size-24);
          letter-spacing: var(--tracking-tight);
          font-weight: var(--weight-medium);
        }
        .drei p,
        .ruhe p {
          margin: 0 0 var(--space-16);
          font-size: var(--size-16);
          line-height: var(--leading-relaxed);
          color: var(--content-secondary);
          text-wrap: pretty;
        }
        .ruhe {
          max-width: 56ch;
          padding-bottom: var(--space-128);
        }
        .ruhe h2 {
          font-size: var(--size-30);
        }
        .fussleiste {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-32) 0;
          border-top: 1px solid var(--border-subtle);
          color: var(--content-muted);
          font-size: var(--size-14);
        }
        .fussleiste :global(a) {
          color: var(--content-muted);
        }

        @media (min-width: 900px) {
          main {
            padding: var(--space-40);
          }
          h1 {
            font-size: var(--size-60);
          }
          .hero {
            grid-template-columns: 1.05fr 0.95fr;
            align-items: center;
            gap: var(--space-80);
          }
          .drei {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>
    </main>
  );
}
