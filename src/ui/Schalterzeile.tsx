'use client';

/**
 * Eine Zeile mit Beschriftung, Erklärung und Schalter.
 *
 * Stand zweimal fast gleich in `HinweisSchalter` und `ProWahl`. Die
 * Einstellungen bekommen weitere Schalter, und zwei Fassungen driften
 * auseinander, sobald jemand nur eine anfasst.
 *
 * `gesperrt` graut aus, ohne den Stand zu verändern — das ist die
 * Darstellung der Regel, dass der Stille Modus überschreibt und
 * nicht löscht. Man soll sehen, wohin man zurückkehrt.
 */

export function Schalterzeile({
  wort,
  zeile,
  an,
  gesperrt = false,
  beimUmlegen,
}: {
  wort: string;
  zeile?: string;
  an: boolean;
  gesperrt?: boolean;
  beimUmlegen: (an: boolean) => void;
}) {
  return (
    <label className="zeile" data-gesperrt={gesperrt}>
      <span className="worte">
        <span className="wort">{wort}</span>
        {zeile && <span className="zusatz">{zeile}</span>}
      </span>
      <input
        type="checkbox"
        checked={an}
        disabled={gesperrt}
        onChange={(e) => beimUmlegen(e.target.checked)}
      />

      <style jsx>{`
        .zeile {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-16);
          /* 52 px: bequem zu treffen, ohne dass die Liste auseinanderfällt. */
          min-height: 52px;
          cursor: pointer;
        }
        .zeile[data-gesperrt='true'] {
          opacity: 0.45;
          cursor: default;
        }
        .worte {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .wort {
          font-family: var(--font-ui);
          font-size: var(--size-14);
          color: var(--content-primary);
        }
        .zusatz {
          font-family: var(--font-ui);
          font-size: 12px;
          line-height: var(--leading-normal);
          color: var(--content-muted);
          max-width: 46ch;
          text-wrap: pretty;
        }
        input {
          flex: none;
          width: 20px;
          height: 20px;
          accent-color: var(--accent-primary);
          cursor: inherit;
        }
      `}</style>
    </label>
  );
}
