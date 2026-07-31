'use client';

/**
 * Voria PRO — Design, Material, Bewegung.
 *
 * ZEIGEN STATT AUFZÄHLEN. Darunter steht kein Merkmalstext, sondern
 * ein echtes Blatt: derselbe Tag, einmal wie heute und einmal mit
 * dem Gewählten. Wer es gesehen hat, braucht keine Liste.
 *
 * Die Vorschau setzt `data-pro-*` auf ihrem eigenen Kasten, nicht am
 * <html>. Dadurch lässt sich etwas ansehen, ohne es zu übernehmen —
 * und die Einstellungsseite ringsum bleibt, wie sie ist.
 */

import { useOptimistic, useTransition } from 'react';
import { proWahlSetzen } from './proActions';
import { Schalterzeile } from '@/ui/Schalterzeile';
import { useT } from '@/i18n/Sprachraum';

export interface ProStand {
  pro_design: 'nordlicht' | null;
  pro_material: boolean;
  pro_bewegung: boolean;
}

type Feld = keyof ProStand;

export function ProWahl({ stand }: { stand: ProStand }) {
  const { t } = useT();
  const [jetzt, setzeOptimistisch] = useOptimistic(
    stand,
    (alt, wechsel: Partial<ProStand>) => ({ ...alt, ...wechsel }),
  );
  const [, starten] = useTransition();

  const setzen = (wechsel: Partial<ProStand>) =>
    starten(async () => {
      setzeOptimistisch(wechsel);
      const [feld, wert] = Object.entries(wechsel)[0] as [Feld, ProStand[Feld]];
      await proWahlSetzen(feld, wert);
    });

  const designs: { wert: 'nordlicht' | null; name: string; zeile: string }[] = [
    { wert: null, name: t.pro.designRegion, zeile: t.pro.designRegionZeile },
    { wert: 'nordlicht', name: t.pro.designNordlicht, zeile: t.pro.designNordlichtZeile },
  ];

  return (
    <div className="pro-wahl">
      <p className="zeile">{t.pro.vorschauZeile}</p>

      <span className="etikett">{t.pro.designTitel}</span>
      <div className="pro-karten" role="group" aria-label={t.pro.designTitel}>
        {designs.map((d) => (
          <button
            key={d.wert ?? 'region'}
            type="button"
            data-aktiv={jetzt.pro_design === d.wert}
            onClick={() => setzen({ pro_design: d.wert })}
          >
            <span className="pro-punkt" data-design={d.wert ?? 'region'} aria-hidden />
            <span className="pro-worte">
              <span className="name">{d.name}</span>
              <span className="unter">{d.zeile}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Das Blatt. Trägt die Wahl selbst, damit sie sich ansehen
          lässt, ohne die ganze Seite umzufärben. */}
      <div
        className="pro-blatt region-surface"
        data-region="neutral"
        data-pro-design={jetzt.pro_design ?? undefined}
        data-pro-material={jetzt.pro_material ? 'an' : undefined}
        data-pro-bewegung={jetzt.pro_bewegung ? 'an' : undefined}
      >
        <span className="ornament-corner" aria-hidden />
        <div className="pro-blatt-inhalt">
          <span className="pro-meta">{t.pro.blattMeta}</span>
          <h3>{t.pro.blattTitel}</h3>
          <p>{t.pro.blattText}</p>
          <div className="ornament-divider" />
        </div>
      </div>

      <Schalterzeile
        wort={t.pro.materialSchalter}
        zeile={t.pro.materialZeile}
        an={jetzt.pro_material}
        beimUmlegen={(an) => setzen({ pro_material: an })}
      />

      {/* Nur beim Nordlicht — bei „Deine Region" gibt es nichts,
          was sich bewegen könnte. */}
      {jetzt.pro_design === 'nordlicht' && (
        <Schalterzeile
          wort={t.pro.bewegungSchalter}
          zeile={t.pro.bewegungZeile}
          an={jetzt.pro_bewegung}
          beimUmlegen={(an) => setzen({ pro_bewegung: an })}
        />
      )}

      <style jsx>{`
        .pro-wahl {
          display: flex;
          flex-direction: column;
          gap: var(--space-16);
        }
        .zeile {
          margin: calc(var(--space-8) * -1) 0 var(--space-8);
          font-size: var(--size-16);
          line-height: var(--leading-normal);
          color: var(--content-secondary);
          max-width: 60ch;
          text-wrap: pretty;
        }
        .etikett {
          font-family: var(--font-ui);
          font-size: 11px;
          font-weight: var(--weight-semi);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--content-muted);
        }
        .pro-karten {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(236px, 1fr));
          gap: var(--space-8);
        }
        .pro-karten button {
          display: flex;
          align-items: center;
          gap: var(--space-12);
          min-height: 56px;
          padding: var(--space-12) var(--space-16);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-8);
          background: var(--surface-raised);
          text-align: left;
          cursor: pointer;
        }
        .pro-karten button[data-aktiv='true'] {
          border-color: var(--accent-primary);
          background: var(--accent-soft);
        }
        .pro-punkt {
          flex: none;
          width: 18px;
          height: 18px;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-default);
        }
        .pro-punkt[data-design='region'] {
          background: var(--ornament-tint);
        }
        /* Der Punkt zeigt das Licht, nicht die Marke. */
        .pro-punkt[data-design='nordlicht'] {
          background-image: linear-gradient(
            135deg,
            var(--material-aurora-a),
            var(--material-aurora-b) 55%,
            var(--material-aurora-c)
          );
        }
        .pro-worte {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .name {
          font-family: var(--font-ui);
          font-size: 13px;
          font-weight: var(--weight-medium);
          color: var(--content-primary);
        }
        .unter {
          font-family: var(--font-ui);
          font-size: 11px;
          line-height: var(--leading-snug);
          color: var(--content-muted);
        }

        .pro-blatt {
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-14);
          overflow: hidden;
        }
        .pro-blatt-inhalt {
          display: flex;
          flex-direction: column;
          gap: var(--space-12);
          padding: var(--space-32);
        }
        .pro-meta {
          font-family: var(--font-ui);
          font-size: 11px;
          font-weight: var(--weight-semi);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--content-muted);
        }
        h3 {
          margin: 0;
          font-family: var(--font-display);
          font-size: var(--size-30);
          line-height: var(--leading-snug);
          letter-spacing: var(--tracking-tight);
          font-weight: var(--weight-medium);
          color: var(--content-primary);
        }
        p {
          margin: 0;
          font-family: var(--font-text);
          font-size: var(--size-18);
          line-height: var(--leading-relaxed);
          color: var(--content-primary);
          max-width: 52ch;
          text-wrap: pretty;
        }
      `}</style>
    </div>
  );
}
