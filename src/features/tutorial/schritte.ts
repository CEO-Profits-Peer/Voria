/**
 * Die Schritte der Führung.
 *
 * JEDER SCHRITT MUSS OHNE SEIN ZIEL FUNKTIONIEREN.
 *
 * Das ist die wichtigste Regel hier. Ein Tutorial, das einen Pfeil
 * auf ein Element malt, das gerade nicht da ist, zeigt ins Leere —
 * und der Nutzer denkt, die App sei kaputt. Voria hat außerdem zwei
 * Ansichten je Tag, eine wechselnde Navigation und Seiten, die je
 * nach Datenlage ganz anders aussehen: Das Ziel FEHLT also nicht
 * ausnahmsweise, sondern regelmäßig.
 *
 * Deshalb trägt jeder Schritt zwei Texte: einen, der auf etwas
 * zeigt, und einen, der auch allein steht. Fehlt das Ziel, wird der
 * Schritt mittig gezeigt und niemand merkt etwas.
 *
 * `route` ist ein Vorschlag, kein Zwang. Die Führung schiebt niemanden
 * irgendwohin — sie bietet den Weg an, und wer woanders hingeht,
 * bekommt den nächsten Schritt trotzdem.
 */

export interface Schritt {
  /** Was hervorgehoben werden soll. Fehlt es, steht der Schritt mittig. */
  ziel?: string;
  /** Wohin der Schritt gehört. Nur ein Angebot. */
  route?: string;
  /** Schlüssel in `t.tutorial.schritte`. */
  schluessel:
    | 'log'
    | 'reise'
    | 'modi'
    | 'fotos'
    | 'teilen'
    | 'ende';
}

export const SCHRITTE: Schritt[] = [
  {
    schluessel: 'log',
    ziel: '.vo-leiste a[href="/log"]',
    route: '/log',
  },
  {
    schluessel: 'reise',
    ziel: 'a.anlegen',
    route: '/log',
  },
  {
    schluessel: 'modi',
    /* Steht nur auf einer Tagesseite. Ohne Tag gibt es keinen —
       dann wird der Schritt eben mittig erzählt. */
    ziel: '.modus',
  },
  {
    schluessel: 'fotos',
    ziel: '.tl-foto',
  },
  {
    schluessel: 'teilen',
    ziel: '.tl-teilen',
  },
  {
    schluessel: 'ende',
  },
];
