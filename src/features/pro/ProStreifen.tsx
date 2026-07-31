'use client';

/**
 * Der Hinweis auf PRO — ein Streifen, kein Dialog.
 *
 * WARUM KEIN MODAL
 *
 * Modale Dialoge sind für Entscheidungen, nicht für Angebote. Ein
 * Angebot, das den Weg versperrt, wird weggeklickt, ohne gelesen zu
 * werden — und hinterlässt Ärger. Dieser Streifen steht unten, deckt
 * nichts zu, und ein Wischen genügt.
 *
 * WO ER NICHT ERSCHEINT
 *
 * Nirgends im Log. Das ist keine Einstellung, sondern eine Frage des
 * Ortes: Wer schreibt, wird nicht gefragt. Eingebunden ist er im
 * Feed — dem Teil, den man ohnehin ignorieren kann.
 *
 * Die Zahlen dahinter (zweimal je Woche, nach dreimal Wegwischen drei
 * Monate Ruhe) stehen in `streifen.ts`.
 */

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { X, Gem } from 'lucide-react';
import { streifenGezeigt, streifenWeggewischt } from './actions';
import { useT } from '@/i18n/Sprachraum';

export function ProStreifen() {
  const { t } = useT();
  const [offen, setOffen] = useState(true);
  const [, starten] = useTransition();

  /* Gezeigt heißt gezeigt — auch wenn niemand hinsieht. Sonst
     erschiene er bei jedem Aufruf, bis jemand ihn wegwischt. */
  useEffect(() => {
    streifenGezeigt();
  }, []);

  if (!offen) return null;

  const wegwischen = () =>
    starten(async () => {
      setOffen(false);
      await streifenWeggewischt();
    });

  return (
    <aside className="pro-streifen" role="complementary">
      <Gem size={18} strokeWidth={1.75} aria-hidden />

      <span className="ps-worte">
        <strong>{t.pro.einstieg}</strong>
        <span>{t.pro.einstiegZeile}</span>
      </span>

      <Link href="/pro" className="ps-mehr">
        {t.pro.wasKostet}
      </Link>

      {/* 44 px Trefferfläche, auch wenn das Kreuz kleiner aussieht —
          das Wegwischen darf nicht schwerer sein als das Ansehen. */}
      <button type="button" onClick={wegwischen} aria-label={t.pro.wegwischen}>
        <X size={18} strokeWidth={1.75} aria-hidden />
      </button>
    </aside>
  );
}
