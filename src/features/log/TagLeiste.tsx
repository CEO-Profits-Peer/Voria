'use client';

/**
 * Die Leiste am Fuß eines Tages: Foto hinzufügen, Sichtbarkeit ändern.
 *
 * WARUM DAS HIER LIEGT UND NICHT IM RUHIGEN MODUS
 *
 * Vorher stand beides in `RuhigerModus.tsx`. Zwei Fehler kamen daraus:
 *
 *   1. Auf der freien Fläche ließ sich die Sichtbarkeit gar nicht
 *      ändern. Wer im Freien Modus arbeitete, konnte seinen Tag nicht
 *      teilen — er musste erst zurückschalten, ohne dass irgendwo
 *      stand, warum.
 *   2. Der Foto-Knopf hing an `istLeer`. Er erschien also nur, solange
 *      der Tag noch leer war. Nach dem ersten geschriebenen Satz war er
 *      verschwunden, und es gab im ruhigen Modus keinen Weg mehr,
 *      ein Foto hinzuzufügen.
 *
 * Beides sind Eigenschaften des TAGES, nicht einer seiner beiden
 * Darstellungen. Deshalb gehören sie eine Ebene höher, in die
 * Tagesansicht — dann gelten sie in beiden Modi und können nicht
 * wieder auseinanderlaufen.
 */

import { Lock, Users, Globe, Share2, ImagePlus } from 'lucide-react';
import { useT } from '@/i18n/Sprachraum';

export function TagLeiste({
  sichtbarkeit,
  aufFotoWaehlen,
  aufTeilen,
}: {
  sichtbarkeit: 'private' | 'followers' | 'public';
  aufFotoWaehlen: () => void;
  aufTeilen: () => void;
}) {
  const { t } = useT();

  return (
    <div className="tagleiste">
      <button type="button" className="tl-foto" onClick={aufFotoWaehlen}>
        <ImagePlus size={17} strokeWidth={1.75} aria-hidden />
        {t.log.fotoDazu}
      </button>

      <span className="tl-luft" />

      <span className="tl-stand">
        {sichtbarkeit === 'private' ? (
          <>
            <Lock size={14} strokeWidth={1.5} aria-hidden />
            {t.teilen.privat}
          </>
        ) : sichtbarkeit === 'followers' ? (
          <>
            <Users size={14} strokeWidth={1.5} aria-hidden />
            {t.teilen.folgende}
          </>
        ) : (
          <>
            <Globe size={14} strokeWidth={1.5} aria-hidden />
            {t.teilen.oeffentlich}
          </>
        )}
      </span>

      <button type="button" className="tl-teilen" onClick={aufTeilen}>
        <Share2 size={14} strokeWidth={1.5} aria-hidden />
        {sichtbarkeit === 'private' ? t.teilen.teilen : t.teilen.aendern}
      </button>

      <style jsx>{`
        .tagleiste {
          display: flex;
          align-items: center;
          gap: var(--space-8);
          flex-wrap: wrap;
          max-width: 68ch;
          /* Dieselbe Zentrierung wie das Blatt im ruhigen Modus, damit
             die Leiste in beiden Modi an derselben Kante sitzt. */
          margin: 0 auto;
          padding: var(--space-16) var(--space-24) var(--space-32);
          border-top: 1px solid var(--border-subtle);
        }
        .tl-luft {
          flex: 1;
        }
        .tl-stand {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-ui);
          font-size: var(--size-14);
          color: var(--content-muted);
        }
        .tagleiste button {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          /* 44 px: Fingergröße. Gilt für beide Knöpfe. */
          min-height: 44px;
          padding: 0 var(--space-12);
          border: 1px solid transparent;
          border-radius: var(--radius-full);
          background: transparent;
          color: var(--content-muted);
          font-family: var(--font-ui);
          font-size: var(--size-14);
          font-weight: var(--weight-medium);
          cursor: pointer;
          transition: background var(--motion-feed), color var(--motion-feed);
        }
        .tagleiste button:hover {
          background: var(--surface-sunken);
          color: var(--content-primary);
        }
        .tl-foto {
          margin-left: calc(var(--space-12) * -1);
        }
      `}</style>
    </div>
  );
}
