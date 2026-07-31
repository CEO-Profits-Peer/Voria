/**
 * Werbung im Feed — Testbestand.
 *
 * DAS SIND PLATZHALTER. Keine echten Partner, keine Verträge, keine
 * Zählpixel, keine Netzwerkanfragen nach außen. Die Anzeigen stehen als
 * Daten in dieser Datei und werden mitgeliefert wie jeder andere Text.
 *
 * ENTSCHEIDUNGEN, die in der Dichte stecken:
 *
 * Alle SECHS Beiträge eine Anzeige, und die erste erst nach dem
 * sechsten. Instagram zeigt etwa jede vierte Karte, TikTok jede fünfte.
 * Voria ist kein Werbeplatz mit Tagebuch daneben, deshalb dünner. Wer
 * zehn Beiträge liest, sieht eine Anzeige, nicht drei.
 *
 * Nie zwei hintereinander, nie die erste Karte. Die erste Karte im Feed
 * gehört einem Menschen — wenn dort Werbung steht, ist die Antwort auf
 * „was haben andere geteilt" eine Reklame, und das ist die falsche
 * Antwort.
 *
 * Anzeigen tragen KEIN Regionen-Theme. Jede Beitragskarte färbt sich
 * nach ihrem Land ein; eine Anzeige, die das auch täte, würde sich als
 * Beitrag ausgeben. Sie bleibt neutral und trägt eine Kennzeichnung.
 */

export interface Anzeige {
  id: string;
  /** Wer wirbt. Steht groß, damit klar ist, dass es nicht ein Nutzer ist. */
  absender: string;
  titel: string;
  text: string;
  /** Beschriftung des Knopfes. Kein „Jetzt!", kein Ausrufezeichen. */
  ruf: string;
  ziel: string;
  /**
   * Pfad zu einem Bild unter `/public/werbung/`, Seitenverhältnis
   * 1200 × 628.
   *
   * AUSDRÜCKLICH KEIN FREMDER SERVER. Ein Bild von außen einzubinden
   * hieße, jedem Werbetreibenden zu erlauben, die Aufrufe seiner
   * Anzeige selbst zu zählen — er sähe IP-Adresse und Gerät jedes
   * Nutzers, der die Karte auch nur überscrollt. Genau das ist der
   * Grund, warum `picsum.photos` aus `next.config.ts` geflogen ist.
   *
   * Bilder werden also mitgeliefert. Das ist unbequemer und der
   * einzige Weg, das Versprechen zu halten: keine Weitergabe an
   * Werbetreibende.
   */
  bild?: string;
}

/** Nach wie vielen Beiträgen eine Anzeige kommt. */
export const ABSTAND = 6;

/**
 * Anzeigen in eigener Sache.
 *
 * Der erste Werbeplatz, der kein Platzhalter ist. Eigene Produkte
 * bewerben ist der ehrlichste Anfang: kein Werbenetz, keine
 * Nutzerdaten, kein Vertrag — und es zeigt, dass die Plätze
 * funktionieren, bevor jemand dafür bezahlt.
 *
 * Beim Ersetzen durch echte Partner bleibt die Form dieselbe.
 */
export const EIGENE_ANZEIGEN: Anzeige[] = [
  {
    id: 'eigen-nexusnode',
    absender: 'Nexus Node',
    titel: 'Vernetzt. Aber ohne Überblick?',
    text: 'Ein Adressbuch, das zeigt, wer wen kennt — als Netz, auf der Karte, in Gruppen.',
    ruf: 'Nexus Node ansehen',
    ziel: 'https://getnexusnode.github.io/nexus-node-site/',
    bild: '/werbung/nexus-node.svg',
  },
];

export const TEST_ANZEIGEN: Anzeige[] = [
  {
    id: 'test-bahn',
    absender: 'Interrail',
    titel: 'Ein Monat, dreiunddreißig Länder',
    text: 'Ein Ticket für alle Züge Europas. Ohne festen Plan, ohne Umbuchungsgebühr.',
    ruf: 'Strecken ansehen',
    ziel: 'https://example.com/interrail',
  },
  {
    id: 'test-rucksack',
    absender: 'Nordwand',
    titel: 'Vierzig Liter, acht Jahre Garantie',
    text: 'Handgepäckmaß, wasserdichter Boden, Reparatur statt Ersatz.',
    ruf: 'Zum Rucksack',
    ziel: 'https://example.com/nordwand',
  },
  {
    id: 'test-sim',
    absender: 'Weltnetz',
    titel: 'Datenkarte für hundertneunzig Länder',
    text: 'Eine eSIM, keine Roaminggebühr. Aktiviert sich, wenn du landest.',
    ruf: 'Tarife vergleichen',
    ziel: 'https://example.com/weltnetz',
  },
  {
    id: 'test-versicherung',
    absender: 'Ruhepol',
    titel: 'Reiseversicherung ohne Kleingedrucktes',
    text: 'Ein Blatt Bedingungen. Kündigung monatlich, auch von unterwegs.',
    ruf: 'Bedingungen lesen',
    ziel: 'https://example.com/ruhepol',
  },
  {
    id: 'test-kamera',
    absender: 'Blende Acht',
    titel: 'Gebrauchte Kameras, geprüft',
    text: 'Zwölf Monate Gewährleistung auf jedes Gehäuse. Auslösungen dokumentiert.',
    ruf: 'Angebote ansehen',
    ziel: 'https://example.com/blendeacht',
  },
];

/**
 * Anzeigen zwischen Beiträge legen.
 *
 * Gibt eine gemischte Liste zurück, damit der Feed nur einmal über
 * etwas iterieren muss. Ohne das müsste die Anzeigelogik in die
 * Darstellung, und dort gehört sie nicht hin.
 *
 * `beitraege.length <= ABSTAND` heißt: keine Anzeige. Bei fünf
 * Beiträgen im Feed wäre eine Anzeige jede sechste Karte — auf einem
 * so leeren Feed wirkt das wie eine Werbeseite mit Beitragsdeko.
 */
/**
 * Was tatsächlich ausgespielt wird.
 *
 * Die eigenen zuerst: Sie sind echt, die anderen sind Platzhalter.
 * Sobald es zahlende Partner gibt, verschwinden die Platzhalter aus
 * dieser Zeile — und nur aus dieser.
 */
export const ANZEIGEN: Anzeige[] = [...EIGENE_ANZEIGEN, ...TEST_ANZEIGEN];

export function mitAnzeigen<T>(
  beitraege: T[],
  anzeigen: Anzeige[] = ANZEIGEN,
): Array<{ art: 'beitrag'; wert: T } | { art: 'anzeige'; wert: Anzeige }> {
  const raus: Array<{ art: 'beitrag'; wert: T } | { art: 'anzeige'; wert: Anzeige }> = [];
  if (anzeigen.length === 0 || beitraege.length <= ABSTAND) {
    return beitraege.map((wert) => ({ art: 'beitrag' as const, wert }));
  }

  let naechste = 0;
  beitraege.forEach((wert, i) => {
    raus.push({ art: 'beitrag', wert });

    const istAbstand = (i + 1) % ABSTAND === 0;
    const nochBeitraegeDanach = i + 1 < beitraege.length;

    // Keine Anzeige als letzte Karte — sonst endet der Feed mit Reklame.
    if (istAbstand && nochBeitraegeDanach) {
      raus.push({ art: 'anzeige', wert: anzeigen[naechste % anzeigen.length] });
      naechste += 1;
    }
  });

  return raus;
}
