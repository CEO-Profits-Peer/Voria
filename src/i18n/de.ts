/**
 * Deutsch — die Ausgangssprache.
 *
 * Diese Datei ist die Referenz: `en.ts` muss dieselben Schlüssel haben,
 * TypeScript erzwingt das. Neue Texte immer hier zuerst.
 *
 * Ton: ruhig, konkret, ganze Sätze. Keine Ausrufezeichen, kein
 * „revolutionär", kein „nahtlos". Der Nutzer wird geduzt.
 */

export const de = {
  marke: 'Voria',

  nav: {
    log: 'Log',
    karte: 'Karte',
    feed: 'Feed',
    du: 'Du',
    suchen: 'Suchen',
    mehr: 'Mehr',
    dasBistDu: 'Das bist du',
    einstellungen: 'Einstellungen',
  },

  auth: {
    anmelden: 'Anmelden',
    registrieren: 'Konto anlegen',
    willkommenZurueck: 'Willkommen zurück',
    tagebuchAnfangen: 'Ein Tagebuch anfangen',
    wartetAufDich: 'Dein Tagebuch wartet.',
    bleibtPrivat: 'Alles, was du schreibst, bleibt privat — bis du dich anders entscheidest.',
    email: 'E-Mail',
    passwort: 'Passwort',
    benutzername: 'Benutzername',
    benutzernameHilfe: 'Kleinbuchstaben, Ziffern, Unterstriche.',
    passwortHilfe: 'Mindestens zehn Zeichen.',
    schonKonto: 'Schon ein Konto?',
    nochKeinKonto: 'Noch kein Konto?',
    einesAnlegen: 'Eines anlegen',
    abmelden: 'Abmelden',
    einenMoment: 'Einen Moment',
    fehlerAnmeldung: 'Diese Kombination aus E-Mail und Passwort passt nicht.',
    fehlerBenutzername:
      'Der Benutzername darf drei bis vierundzwanzig Zeichen haben, nur Kleinbuchstaben, Ziffern und Unterstriche.',
    fehlerBenutzernameBelegt: 'Dieser Benutzername ist schon vergeben.',
    fehlerPasswortKurz: 'Das Passwort braucht mindestens zehn Zeichen.',
    fehlerKonto: 'Das Konto konnte nicht angelegt werden. Versuch es später noch einmal.',
    bestaetigeEmail: 'Fast geschafft — bestätige die E-Mail, die wir dir geschickt haben.',
    passwortVergessen: 'Passwort vergessen',
    passwortVergessenZeile: 'Trag deine E-Mail ein, dann schicken wir dir einen Link zum Zurücksetzen.',
    neuesPasswort: 'Neues Passwort',
    neuesPasswortZeile: 'Wähl ein neues Passwort. Danach bist du direkt angemeldet.',
    linkSchicken: 'Link schicken',
    passwortSpeichern: 'Passwort speichern',
    passwortVergessenLink: 'Passwort vergessen?',
    fehlendeFelder: 'Bitte trage E-Mail und Passwort ein.',
  },

  log: {
    deineReisen: 'Deine Reisen',
    neueReise: 'Neue Reise',
    ersteReiseAnlegen: 'Erste Reise anlegen',
    keineReise: 'Noch keine Reise',
    keineReiseZeile:
      'Hier stehen später deine Reisen, Tag für Tag. Die erste legst du an, sobald es losgeht.',
    ohneDatum: 'Ohne Datum',
    ohneTitel: 'Ohne Titel',
    ohneLand: 'Noch ohne Land',
    tag: 'Tag',
    tage: 'Tage',
    land: 'Land',
    laender: 'Länder',
    heuteSchreiben: 'Heute schreiben',
    andererTag: 'Einen anderen Tag',
    andererTagLabel: 'Datum wählen',
    zurueckZurReise: 'Zurück zur Reise',
    zurueckZuAllen: 'Zurück zu allen Reisen',
    reiseBearbeiten: 'Reise bearbeiten',
    wohinGehtEs: 'Wohin geht es?',
    allesAenderbar: 'Du kannst alles später ändern. Nichts davon ist verbindlich.',
    nameDerReise: 'Name der Reise',
    ersterTag: 'Erster Tag',
    letzterTag: 'Letzter Tag',
    landHilfe: 'Zwei Buchstaben. Bestimmt, wie die Reise aussieht.',
    reiseAnlegen: 'Reise anlegen',
    uebernehmen: 'Übernehmen',
    laenderTitel: 'Länder',
    laenderZeile: 'Bestimmt, wie die Reise aussieht. Mehrere Länder sind möglich — es gewinnt das mit den meisten Tagen.',
    laenderkuerzel: 'Länderkürzel',
    landHinzufuegen: 'Land hinzufügen',
    aussehenTitel: 'Aussehen',
    aussehenErgibt: 'Aus den Ländern ergibt sich',
    aussehenUeberschreiben: 'Du kannst das überschreiben.',
    nochNichts: 'noch nichts',
    regionAbleiten: 'Aus den Ländern ableiten',
    regionWahl: 'Region',
    aussehen: 'Aussehen',
    ausLaendernAbleiten: 'Aus den Ländern ableiten',
    modusRuhig: 'Seite',
    modusFrei: 'Fläche',
    zurFreienFlaeche: 'Zur freien Fläche wechseln',
    zurRuhigenSeite: 'Zur ruhigen Seite wechseln',
    titelDesTages: 'Titel des Tages',
    wasHeutePassiertIst: 'Was heute passiert ist',
    fotoWeg: 'Oder fang mit einem Foto an',
    fotoGross: 'Foto groß ansehen',

    // Freie Fläche
    etwasHinzufuegen: 'Etwas hinzufügen',
    textDazu: 'Text',
    fotoDazu: 'Foto',
    notizSchreiben: 'Notiz schreiben',
    schreibenBeenden: 'Schreiben beenden',
    notizLeer: 'Tippe hier.',
    drehen: 'Drehen',
    groesseAendern: 'Größe ändern',
    entfernen: 'Entfernen',
    ablegenHinweis: 'Tippen zum Ablegen — die Fläche lässt sich weiterschieben',
    anstoss: [
      'Was ist heute passiert?',
      'Woran willst du dich in zehn Jahren erinnern?',
      'Was hast du heute zum ersten Mal gesehen?',
      'Wie hat sich der Tag angefühlt?',
    ],
  },

  teilen: {
    titel: 'Wer soll das sehen?',
    teilen: 'Teilen',
    aendern: 'Ändern',
    privat: 'Nur für dich',
    privatErklaerung: 'Niemand sonst sieht diesen Tag. Auch nicht in der Suche.',
    folgende: 'Wer dir folgt',
    folgendeErklaerung: 'Sichtbar für Leute, die dir folgen. Nicht im offenen Feed.',
    oeffentlich: 'Im Feed',
    oeffentlichErklaerung:
      'Erscheint im Feed und kann Zustimmung bekommen. Jederzeit zurücknehmbar.',
    einSatzDazu: 'Ein Satz dazu, wenn du magst',
    optional: 'Optional.',
  },

  fotos: {
    hinzufuegen: 'Fotos hinzufügen',
    auswaehlen: 'Bilder auswählen',
    warten: 'Such dir Bilder aus. Datum und Ort lese ich selbst heraus.',
    lesen: 'Ich schaue nach, wann und wo das aufgenommen wurde.',
    verkleinern: 'Ich mache die Bilder leichter, ohne dass man es sieht.',
    fertig: 'Fertig.',
    fehler: 'Etwas ist schiefgegangen.',
    originaleBleiben:
      'Deine Originale bleiben auf dem Gerät. Hochgeladen wird nur eine leichte Fassung.',
    vorheriges: 'Vorheriges Foto',
    naechstes: 'Nächstes Foto',
  },

  karte: {
    deineWelt: 'Deine Welt',
    leerZeile:
      'Zwölf Regionen warten. Sobald eine Reise ein Land kennt, bekommt ihre Region hier Material, Licht und Farbe.',
    nochNicht: 'noch nicht',
    seit: 'seit',
  },

  feed: {
    titel: 'Feed',
    stillHier: 'Noch still hier',
    stillZeile:
      'Was andere geteilt haben, steht später an dieser Stelle. Du musst hier nichts hinterlassen — dein Tagebuch bleibt deins.',
    zustimmen: 'Zustimmen',
    zustimmungZurueck: 'Zustimmung zurücknehmen',
    irgendwo: 'irgendwo',
    jemand: 'Jemand',
    geschriebenVon: 'Geschrieben von',
    nichtsGeteilt: 'Hier wurde noch nichts geteilt.',
    teilen: 'Teilen',
    kopiert: 'Kopiert',
    anzeige: 'Anzeige',
    einTag: 'Ein Tag',
    fuerDich: 'Für dich',
    folgeIch: 'Folge ich',
    niemandGefolgt: 'Du folgst noch niemandem',
    niemandGefolgtZeile:
      'Hier stehen die Tage der Leute, denen du folgst — in der Reihenfolge, in der sie geschrieben wurden. Über die Suche findest du die ersten.',
  },

  kommentar: {
    titel: 'Kommentare',
    knopf: 'Kommentare',
    schreiben: 'Etwas dazu schreiben',
    antwortSchreiben: 'Antworten',
    senden: 'Abschicken',
    speichern: 'Speichern',
    abbrechen: 'Abbrechen',
    antworten: 'Antworten',
    bearbeiten: 'Bearbeiten',
    bearbeitet: 'bearbeitet',
    nochNichts: 'Noch hat niemand etwas gesagt.',
    eineAntwort: 'Eine Antwort',
    antwortenZeigen: 'Antworten',
    antwortenVerbergen: 'Antworten ausblenden',
  },

  profil: {
    du: 'Du',
    reisen: 'Reisen',
    folgenDir: 'Folgen dir',
    duFolgst: 'Du folgst',
    geteilt: 'Geteilt',
    folgen: 'Folgen',
    folgt: 'Folgt',
    duFolgstIhm: 'Du folgst',
    folgenAktion: 'Folgen',
    bearbeiten: 'Profil bearbeiten',
    profilbild: 'Profilbild',
    bildWaehlen: 'Bild wählen',
    bildTauschen: 'Bild tauschen',
    bildEntfernen: 'Entfernen',
    bildLaedt: 'Lädt …',
    bildFehler: 'Das Bild konnte nicht hochgeladen werden. Versuch es noch einmal.',
    bildHilfe: 'Quadratisch zugeschnitten, 256 Pixel. Verkleinert wird auf deinem Gerät.',
    anzeigename: 'Anzeigename',
    beschreibung: 'Über dich',
    beschreibungHilfe: 'Ein, zwei Sätze. Steht auf deinem Profil.',
    privatesProfil: 'Profil privat halten',
    privatesProfilHilfe: 'Dein Profil taucht dann nicht in der Suche auf. Geteilte Beiträge bleiben sichtbar.',
    gesichert: 'Gespeichert.',
  },

  einstellungen: {
    titel: 'Einstellungen',
    erscheinungsbild: 'Erscheinungsbild',
    hell: 'Hell',
    dunkel: 'Dunkel',
    wieGeraet: 'Wie das Gerät',
    sprache: 'Sprache',
    spracheZeile: 'Die Oberfläche wechselt sofort. Deine Einträge bleiben, wie du sie geschrieben hast.',
    zwoelfWelten: 'Die zwölf Welten',
    weltenZeile:
      'Jede Region bringt ihr eigenes Material, Licht und Handwerk mit. Deine Reisen bekommen sie automatisch, je nachdem wo du warst — hier kannst du sie vorher ansehen.',
  },

  suche: {
    titel: 'Suchen',
    zeile: 'In allem, was du geschrieben hast.',
    platzhalter: 'Ein Wort, ein Ort, ein Name',
    nichts: 'Dazu steht noch nichts in deinem Tagebuch.',
    leeren: 'Leeren',
    reiterTage: 'Tage',
    reiterLeute: 'Leute',
    platzhalterLeute: 'Name oder Benutzername',
    nichtsLeute: 'Niemand mit diesem Namen.',
    keinerFolgt: 'Noch niemand folgt',
    folgtEiner: 'Einer folgt',
    folgenMehrere: 'folgen',
  },

  rueckblick: {
    titel: 'Rückblick',
    zeile: 'Ein Jahr, auf einer Seite.',
    keinJahr: 'Für dieses Jahr gibt es noch nichts.',
    keinJahrZeile: 'Sobald du ein paar Tage geschrieben hast, entsteht hier ein Rückblick.',
    inDiesemJahr: 'In diesem Jahr',
    laengsteReise: 'Längste Reise',
    meisteWorte: 'Der längste Tag',
    ersterTag: 'Angefangen hat es',
    fotos: 'Fotos',
    worte: 'Worte',
  },

  zustand: {
    nichtGefunden: 'Diese Seite gibt es nicht',
    nichtGefundenZeile: 'Vielleicht ist sie umgezogen, vielleicht war der Link nur ein Tippfehler.',
    zurueckInDenLog: 'Zurück in den Log',
    zumLog: 'Zum Log',
    fehler: 'Da ist etwas schiefgegangen',
    fehlerZeile:
      'Deine Einträge sind sicher — es hat nur diese Ansicht erwischt. Versuch es noch einmal.',
    nochEinmal: 'Noch einmal versuchen',
    laden: 'Einen Moment.',
    keinNetz: 'Kein Netz',
    keinNetzZeile:
      'Was du schon geöffnet hattest, kannst du weiter lesen. Neues kommt, sobald du wieder verbunden bist — nichts geht verloren.',
    offlineStreifen:
      'Kein Netz. Lesen geht weiter, Neues wird gesichert, sobald du wieder verbunden bist.',
    schliessen: 'Schließen',
    zurueck: 'Zurück',
  },

  start: {
    anfangen: 'Anfangen',
    hero: 'Der Ort, an dem du in zehn Jahren nachliest, wie sich dein Leben angefühlt hat.',
    heroZeile:
      'Ein Reisetagebuch, das aussieht wie die Orte, an denen du warst. Du schreibst, wirfst deine Fotos hinein — Datum, Ort und Land stehen dann schon da.',
    tagebuchAnfangen: 'Ein Tagebuch anfangen',
    kostenlos: 'Kostenlos. Alles bleibt privat, bis du dich anders entscheidest.',
    zweiArten: 'Zwei Arten zu schreiben',
    zweiArtenZeile:
      'Abends eine ruhige Seite, wenn du Worte hast. Eine freie Fläche zum Kleben und Anordnen, wenn du nur Bilder hast. Beide zeigen denselben Tag — der Wechsel verliert nichts.',
    fotosWissen: 'Deine Fotos wissen schon Bescheid',
    fotosWissenZeile:
      'Jedes Bild trägt Datum und Koordinaten in sich. Voria liest sie aus und legt die Tage an. Du tippst nichts ab, was dein Telefon längst weiß.',
    zwoelfWelten: 'Zwölf Welten',
    zwoelfWeltenZeile:
      'Marokko sieht nach Sandstein und Indigo aus, Japan nach Washi und Zinnober. Keine Flaggen, keine Landesfarben — Material, Licht und Handwerk.',
    sozialesFreiwillig: 'Das Soziale ist freiwillig',
    sozialesZeile1:
      'Voria funktioniert vollständig, ohne dass jemand etwas davon sieht. Kein Zwang, ein Profil zu füllen, keine Serie, die reißt, keine Erinnerung mit Ausrufezeichen. Wenn du drei Wochen nichts schreibst, sagt niemand etwas.',
    sozialesZeile2:
      'Und wenn du doch teilen willst, entscheidest du das pro Tag — nicht pro Konto.',
    beispielOrt1: 'Naoshima, Japan',
    beispielText1:
      'Der Regen hörte den ganzen Tag nicht auf. Ich bin trotzdem zum Hafen gelaufen, weil es sonst nichts zu tun gab.',
    beispielOrt2: 'Chefchaouen, Marokko',
    beispielText2:
      'Der Bus kam nicht, also blieben wir. Die Frau vom Kiosk brachte uns nach einer Stunde Tee, ohne zu fragen.',
    beispielOrt3: 'Reine, Norwegen',
    beispielText3:
      'Um zwei Uhr nachts war es noch hell genug zum Lesen. Wir haben es ausprobiert, nur um sicher zu sein.',
    beispielOrt4: 'Uyuni, Bolivien',
    beispielText4:
      'Der Boden war so flach, dass der Himmel unten anfing. Man verliert das Gefühl für Entfernung.',
  },

  regionen: {
    nordeuropa: 'Nordeuropa & Skandinavien',
    alpen: 'Alpen & Mitteleuropa',
    mittelmeer: 'Mittelmeer',
    maghreb: 'Nordafrika & Maghreb',
    ostafrika: 'Ostafrika',
    naherOsten: 'Naher Osten',
    suedasien: 'Südasien',
    suedostasien: 'Südostasien',
    ostasien: 'Ostasien',
    ozeanien: 'Ozeanien',
    anden: 'Anden & Südamerika',
    nordamerikaWest: 'Nordamerika West & Polar',
    neutral: 'Ohne Region',
  },
} as const;

/**
 * Die Schlüsselstruktur von `de` — aber mit `string` statt der
 * Literaltypen, die `as const` erzeugt. Ohne das müsste jede
 * Übersetzung wortwörtlich der deutschen entsprechen.
 * Die Schlüssel bleiben trotzdem erzwungen.
 */
type Weiten<T> = T extends string
  ? string
  : T extends readonly (infer E)[]
    ? readonly Weiten<E>[]
    : { [K in keyof T]: Weiten<T[K]> };

export type Woerterbuch = Weiten<typeof de>;
