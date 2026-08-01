'use client';

/**
 * Die Führung noch einmal starten.
 *
 * Weil „nein danke" endgültig ist — und genau deshalb braucht es
 * einen Weg zurück. Wer beim ersten Öffnen abgelehnt hat und drei
 * Wochen später doch wissen will, was „Fläche" bedeutet, soll nicht
 * ein neues Konto anlegen müssen.
 */

import { useTransition, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Compass } from 'lucide-react';
import { tutorialNeu } from './actions';
import { useT } from '@/i18n/Sprachraum';

export function TutorialNeu() {
  const { t } = useT();
  const router = useRouter();
  const [laeuft, starten] = useTransition();
  const [ab, setAb] = useState(false);

  return (
    <button
      type="button"
      className="konto-weg"
      disabled={laeuft || ab}
      onClick={() =>
        starten(async () => {
          await tutorialNeu();
          setAb(true);
          /* In den Log, weil dort der erste Schritt hingehört —
             und `refresh`, damit die Hülle den neuen Stand liest. */
          router.push('/log');
          router.refresh();
        })
      }
    >
      <Compass size={16} strokeWidth={1.75} aria-hidden />
      {t.tutorial.neuStarten}
    </button>
  );
}
