'use client';

/**
 * Die Führung für neue Nutzer.
 *
 * ═══════════════════════════════════════════════════════════════
 * WAS HIER ALLES SCHIEFGEHEN KANN — UND ABGEFANGEN IST
 * ═══════════════════════════════════════════════════════════════
 *
 * 1. DAS ZIEL IST NICHT DA. Voria hat zwei Ansichten je Tag, eine
 *    Navigation, die unter 900 px umzieht, und Seiten, die je nach
 *    Datenlage ganz anders aussehen. Ein Schritt, der auf `.modus`
 *    zeigt, findet den Knopf nur auf einer Tagesseite. Fehlt er,
 *    wird der Schritt MITTIG erzählt statt auf etwas zu deuten, das
 *    es nicht gibt.
 *
 * 2. DER NUTZER GEHT WOANDERS HIN. Die Führung schiebt niemanden.
 *    Wer mitten im Schritt „Reise anlegen" in den Feed wechselt,
 *    bekommt den Schritt weiter angeboten — nur eben ohne Pfeil.
 *
 * 3. DAS ZIEL BEWEGT SICH. Beim Scrollen, beim Drehen des Geräts,
 *    beim Nachladen von Bildern. Die Hervorhebung wird deshalb bei
 *    jedem Bildlauf und jeder Größenänderung neu vermessen.
 *
 * 4. DER NUTZER WILL WEG. Escape schließt, ein Klick daneben
 *    schließt, es gibt einen Knopf. Und zwar sofort — kein
 *    „Bist du sicher?", das ist ein Tutorial und kein Vertrag.
 *
 * 5. DAS SPEICHERN SCHEITERT. Dann läuft die Führung trotzdem
 *    weiter; der Stand steht eben nur lokal. Eine Führung, die an
 *    einer Netzwerkstörung hängen bleibt, ist schlimmer als keine.
 *
 * ═══════════════════════════════════════════════════════════════
 *
 * Gefragt wird ZUERST, ob überhaupt. Wer „nein" sagt, wird nie
 * wieder gefragt — das ist die Entscheidung, nicht ein Aufschub.
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { SCHRITTE } from './schritte';
import { tutorialSchritt, tutorialBeenden } from './actions';
import { useT } from '@/i18n/Sprachraum';

interface Kasten {
  oben: number;
  links: number;
  breite: number;
  hoehe: number;
}

export function Tutorial({ startSchritt }: { startSchritt: number }) {
  const { t } = useT();
  const router = useRouter();

  /* `frage` zuerst: Es wird gefragt, bevor irgendetwas passiert. */
  const [phase, setPhase] = useState<'frage' | 'laeuft' | 'zu'>('frage');
  const [nr, setNr] = useState(Math.min(startSchritt, SCHRITTE.length - 1));
  const [kasten, setKasten] = useState<Kasten | null>(null);

  const schritt = SCHRITTE[nr];

  /*
   * Das Ziel vermessen — und ehrlich `null` liefern, wenn es fehlt.
   * `useCallback`, weil es an drei Ereignissen hängt.
   */
  const vermessen = useCallback(() => {
    if (phase !== 'laeuft' || !schritt?.ziel) {
      setKasten(null);
      return;
    }

    const el = document.querySelector(schritt.ziel);
    if (!el) {
      setKasten(null);
      return;
    }

    const r = el.getBoundingClientRect();

    /* Unsichtbar oder aus dem Bild gescrollt zählt als nicht da —
       ein Rahmen um nichts ist schlimmer als kein Rahmen. */
    if (r.width === 0 || r.height === 0) {
      setKasten(null);
      return;
    }

    setKasten({ oben: r.top, links: r.left, breite: r.width, hoehe: r.height });
  }, [phase, schritt]);

  useEffect(() => {
    vermessen();
    window.addEventListener('scroll', vermessen, { passive: true });
    window.addEventListener('resize', vermessen);
    return () => {
      window.removeEventListener('scroll', vermessen);
      window.removeEventListener('resize', vermessen);
    };
  }, [vermessen]);

  const beenden = useCallback(() => {
    setPhase('zu');
    /* Absichtlich kein `await`: Die Führung schließt sofort, auch
       wenn das Speichern hängt oder scheitert. */
    tutorialBeenden();
  }, []);

  /* Escape beendet. Immer, in jeder Phase. */
  useEffect(() => {
    const taste = (e: KeyboardEvent) => {
      if (e.key === 'Escape') beenden();
    };
    window.addEventListener('keydown', taste);
    return () => window.removeEventListener('keydown', taste);
  }, [beenden]);

  if (phase === 'zu') return null;

  const weiter = () => {
    if (nr >= SCHRITTE.length - 1) {
      beenden();
      return;
    }
    const naechster = nr + 1;
    setNr(naechster);
    tutorialSchritt(naechster);

    /* Der Weg ist ein ANGEBOT. Nur wenn der Schritt eine Route nennt
       und wir nicht schon dort sind, wird sanft hingeführt. */
    const ziel = SCHRITTE[naechster]?.route;
    if (ziel && window.location.pathname !== ziel) router.push(ziel);
  };

  const zurueck = () => {
    if (nr === 0) return;
    setNr(nr - 1);
    tutorialSchritt(nr - 1);
  };

  /* ---------- Die Frage vorweg ---------- */
  if (phase === 'frage') {
    return (
      <div className="tut-grund" role="dialog" aria-modal="true" aria-label={t.tutorial.titel}>
        <div className="tut-karte tut-mittig">
          <h2>{t.tutorial.frageTitel}</h2>
          <p>{t.tutorial.frageZeile}</p>
          <div className="tut-knoepfe">
            <button type="button" className="tut-haupt" onClick={() => setPhase('laeuft')}>
              {t.tutorial.jaZeigen}
            </button>
            <button type="button" onClick={beenden}>
              {t.tutorial.neinDanke}
            </button>
          </div>
          <p className="tut-fein">{t.tutorial.spaeterHinweis}</p>
        </div>
      </div>
    );
  }

  /* ---------- Ein Schritt ---------- */
  const texte = t.tutorial.schritte[schritt.schluessel];

  return (
    <div className="tut-grund" role="dialog" aria-modal="true" aria-label={t.tutorial.titel}>
      {/* Der Rahmen ums Ziel — nur wenn es eines gibt. */}
      {kasten && (
        <div
          className="tut-rahmen"
          aria-hidden
          style={{
            top: kasten.oben - 6,
            left: kasten.links - 6,
            width: kasten.breite + 12,
            height: kasten.hoehe + 12,
          }}
        />
      )}

      <div className={`tut-karte ${kasten ? 'tut-unten' : 'tut-mittig'}`}>
        <button type="button" className="tut-zu" onClick={beenden} aria-label={t.tutorial.beenden}>
          <X size={18} strokeWidth={1.75} aria-hidden />
        </button>

        <span className="tut-zaehler">
          {nr + 1} / {SCHRITTE.length}
        </span>

        <h2>{texte.titel}</h2>
        {/*
          Zwei Texte je Schritt: `zeigt` deutet auf etwas, `allein`
          steht für sich. Fehlt das Ziel, wird der zweite genommen —
          sonst stünde da „siehst du den Knopf links?" und links wäre
          nichts.
        */}
        <p>{kasten ? texte.zeigt : texte.allein}</p>

        <div className="tut-knoepfe">
          {nr > 0 && (
            <button type="button" onClick={zurueck}>
              {t.tutorial.zurueck}
            </button>
          )}
          <button type="button" className="tut-haupt" onClick={weiter}>
            {nr >= SCHRITTE.length - 1 ? t.tutorial.fertig : t.tutorial.weiter}
          </button>
        </div>
      </div>
    </div>
  );
}
