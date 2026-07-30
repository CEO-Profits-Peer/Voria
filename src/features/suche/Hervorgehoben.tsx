'use client';

/**
 * Das gesuchte Wort im Auszug markieren.
 *
 * ES DARF KEIN HTML EINGESETZT WERDEN. Der Auszug stammt aus dem Text
 * des Nutzers; ein `dangerouslySetInnerHTML` mit eingebauten
 * `<mark>`-Klammern wäre eine Lücke — wer „<img onerror=…>" in sein
 * Tagebuch schreibt, würde es bei jedem Sucher ausführen. Deshalb wird
 * der Text zerlegt und als React-Knoten wieder zusammengesetzt.
 *
 * Die Suche selbst läuft über deutsche Wortstämme („Regen" findet
 * „regnete"). Die Hervorhebung kann das nicht — sie vergleicht
 * buchstäblich. Ein Treffer ohne Markierung ist deshalb möglich und
 * kein Fehler; markiert wird, was sicher passt.
 */

import { Fragment } from 'react';

export function Hervorgehoben({ text, wort }: { text: string; wort: string }) {
  const teile = zerlegen(text, wort);
  if (!teile.some((teil) => teil.treffer)) return <>{text}</>;

  return (
    <>
      {teile.map((teil, i) => (
        <Fragment key={i}>{teil.treffer ? <mark>{teil.text}</mark> : teil.text}</Fragment>
      ))}

      <style jsx>{`
        mark {
          /* Nicht das gelbe Standard-Mark: das kennt kein Theme und
             wird im Dunkelmodus unlesbar. */
          background: var(--accent-soft);
          color: var(--content-accent);
          border-radius: 3px;
          padding: 0 2px;
        }
      `}</style>
    </>
  );
}

/** Regexsonderzeichen entschärfen — sonst wirft eine Klammer im Suchwort. */
function entschaerfen(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function zerlegen(text: string, wort: string): { text: string; treffer: boolean }[] {
  const woerter = wort
    /* Anführungszeichen und das Minus der Websuche gehören nicht zum
       gesuchten Wort — „-Regen" schließt aus, markiert also nichts. */
    .replace(/["']/g, '')
    .split(/\s+/)
    .filter((w) => !w.startsWith('-') && w.length >= 2)
    .map(entschaerfen);

  if (woerter.length === 0) return [{ text, treffer: false }];

  /* Die Klammer ist wichtig: mit Fanggruppe behält split die Trenner,
     und die stehen dann auf den ungeraden Plätzen. Daran — und nicht
     an einem zweiten Vergleich — hängt die Markierung. */
  return text
    .split(new RegExp(`(${woerter.join('|')})`, 'gi'))
    .map((stueck, i) => ({ text: stueck, treffer: i % 2 === 1 }))
    .filter((teil) => teil.text !== '');
}
