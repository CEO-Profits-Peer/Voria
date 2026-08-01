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
    titelPlatzhalter: 'Titel',
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
    grenzeErreicht: 'An diesem Tag liegen schon {grenze} Fotos. Mit Voria PRO hört es dort nicht auf.',
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
    entdecken: 'Entdecken',
    amEnde: 'Das war alles für heute.',
    nichtsNeues: 'Nichts Fremdes gerade',
    nichtsNeuesZeile:
      'Hier stehen Tage aus Gegenden, in denen du noch nicht warst. Im Moment ist nichts dabei — schau später wieder vorbei.',
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

  hinweise: {
    titel: 'Hinweise',
    zeile: 'Was passiert ist, während du weg warst.',
    ungelesen: 'ungelesen',
    nochNichts: 'Noch nichts passiert',
    nochNichtsZeile:
      'Hier steht später, wenn jemand auf dich reagiert oder etwas teilt. Nichts davon musst du beantworten.',
    folgtDir: 'folgt dir jetzt.',
    hatKommentiert: 'hat deinen Tag kommentiert.',
    hatGeantwortet: 'hat dir geantwortet.',
    hatGeteilt: 'hat einen Tag geteilt.',
    stillerModus: 'Stiller Modus',
    stillerModusZeile:
      'Schaltet alle Hinweise auf einmal ab. Deine einzelnen Einstellungen bleiben stehen — wenn du ihn wieder ausschaltest, ist alles wie vorher.',
    schalterKommentar: 'Kommentare und Antworten',
    schalterFolger: 'Neue Follower',
    schalterUpload: 'Wenn jemand teilt, dem du folgst',
  },

  rechtliches: { datenschutz: 'Datenschutz' },

  pro: {
    wegwischen: 'Wegwischen',
    einstieg: 'PRO werden',
    einstiegZeile: 'Ohne Werbung, ohne Fotogrenze, mit einem Material, das man sieht.',
    nochNicht: 'Du hast PRO nicht. Ausprobieren kannst du es trotzdem — die Vorschau unten zeigt, wie es aussähe.',
    wasKostet: 'Was PRO kostet',
    lead: 'Voria bleibt vollständig, wenn du nichts bezahlst. Jeder Tag, jedes Foto, jede Region. PRO nimmt die Werbung aus dem Feed, hebt die Fotogrenze auf und setzt dein Jahr auf Papier. Und es sieht anders aus — das siehst du besser, als ich es beschreiben kann.',
    blattZeile: 'So sähe ein Tag mit PRO aus. In den Einstellungen kannst du beides vergleichen, bevor du zahlst.',
    preisMonat: '2,99 €',
    preisMonatZusatz: 'im Monat',
    preisJahr: 'Wenn du gleich ein Jahr nimmst, sind zwei Monate Sommerpreis: 29,90 € statt 35,88 €.',
    preisRuhe: 'Monatlich kündbar. Der Sommerpreis heißt so, weil es Sommer ist — es steht keine Uhr daneben, und im Herbst gibt es einen anderen Grund oder keinen.',
    baldVerfuegbar: 'Kaufen kannst du es noch nicht — die Zahlungsanbindung fehlt. Ein Knopf, der nichts tut, wäre die schlechtere Antwort darauf.',
    werbungTitel: 'Keine Werbung',
    werbungText: 'Im Tagebuch gibt es keine Reklame, für niemanden — das ändert sich nie. Der Feed ist der einzige Ort, an dem sie vorkommt. Mit PRO ist auch er still.',
    fotosTitel: 'Fotos ohne Grenze',
    fotosText: 'Zwanzig Fotos am Tag sind frei. Das reicht für die meisten Tage und nicht für den einen, an dem alles passiert ist.',
    materialTitel: 'Das Material',
    materialText: 'Die Goldfolie am Ornament, das feinere Papier, die Prägung am Titel — in allen zwölf Regionen, denn es nimmt deren Farbe auf, statt sie zu ersetzen. Dazu eigene Designs. Wenn du es schlicht magst, schaltest du beides aus.',
    pdfTitel: 'Das Jahr auf Papier',
    pdfText: 'Der Rückblick bleibt frei und teilbar, und mitnehmen kannst du alles ohnehin. Mit PRO wird daraus ein gesetzter Bogen als PDF, später ein gedrucktes Buch.',
    grenze: 'PRO begrenzt, was du anlegst — niemals, was du liest. Läuft es aus, bleibt jeder Tag lesbar und exportierbar. Das Schreiben selbst, der Rückblick und gemeinsame Reisen liegen nie dahinter.',
    titel: 'Voria PRO',
    vorschauZeile:
      'PRO ändert kein einziges Maß. Es ist dasselbe Blatt, nur feiner ausgeführt: eine Goldfolie am Ornament, ein dichteres Papier, eine Prägung am Titel.',
    designTitel: 'Das Design',
    designRegion: 'Deine Region',
    designRegionZeile: 'Alles bleibt, wie es heute ist',
    designNordlicht: 'Nordlicht & Polarnacht',
    designNordlichtZeile: 'Schneekorn, kaltes Licht',
    materialSchalter: 'Material von PRO',
    materialZeile:
      'Goldfolie, feineres Papier, Prägung. Wenn du es schlicht magst, schalte es aus — bezahlt hast du für mehr als das Aussehen.',
    bewegungSchalter: 'Das Licht bewegen',
    bewegungZeile:
      'Sehr langsam, knapp eine Minute je Durchlauf. Standardmäßig aus, weil auf einer Schreibfläche nichts wandern muss.',
    blattMeta: '12. April 2026 · Chefchaouen, Marokko',
    blattTitel: 'Der Bus kam nicht',
    blattText:
      'Also blieben wir. Die Frau vom Kiosk brachte uns nach einer Stunde Tee, ohne zu fragen. Der Platz lag im Schatten, und irgendwann war es Abend.',
  },

  export: {
    drucken: 'Als PDF speichern',
    druckHinweis: 'Dein Browser macht daraus ein PDF: Beim Drucken als Ziel „Als PDF speichern“ wählen. Jede Reise beginnt auf einer neuen Seite.',
    druckVerweis: 'Gesetzter Bogen',
    titel: 'Alles mitnehmen',
    warum:
      'Voria soll der Ort sein, an dem du in zehn Jahren nachliest. Das ist nur ein ehrliches Versprechen, wenn deine Einträge jederzeit mitkommen können — ohne Konto, ohne Voria, ohne Netz.',
    wasDrin:
      'Du bekommst ein Archiv mit deinen Fotos, je einer lesbaren Textdatei pro Reise und allen Daten noch einmal vollständig als JSON. Das Zusammenstellen passiert auf deinem Gerät, nichts davon läuft über einen fremden Server.',
    knopf: 'Archiv erstellen',
    laeuft: 'Wird zusammengestellt …',
    sammelt: 'Sammle deine Einträge …',
    fortschritt: '{fertig} von {gesamt} Fotos',
    fertig: 'Fertig. Das Archiv liegt in deinen Downloads.',
    fertigMitLuecken:
      'Fertig — {anzahl} Fotos ließen sich nicht laden und fehlen im Archiv. Alles andere ist vollständig.',
    fehler: 'Das hat nicht geklappt. Versuch es bitte noch einmal.',
    hinweisFotos:
      'Die Fotos sind die Anzeigefassungen aus Voria, nicht die Originale deiner Kamera — die liegen weiter auf deinem Gerät.',
    verweis: 'Alles mitnehmen',
  },

  tutorial: {
    titel: 'Kurze Führung',
    frageTitel: 'Soll ich dir Voria kurz zeigen?',
    frageZeile:
      'Sechs kurze Schritte, keine Minute. Du kannst jederzeit abbrechen — mit Escape oder dem Kreuz.',
    jaZeigen: 'Ja, zeig mir',
    neinDanke: 'Nein, ich schaue selbst',
    spaeterHinweis: 'Du kannst die Führung später unter Einstellungen → Aussehen neu starten.',
    weiter: 'Weiter',
    zurueck: 'Zurück',
    fertig: 'Fertig',
    beenden: 'Führung beenden',
    neuStarten: 'Führung neu starten',
    neuStartenZeile: 'Zeigt die sechs Schritte noch einmal.',
    schritte: {
      log: {
        titel: 'Der Log',
        zeigt: 'Hier liegen deine Reisen, Tag für Tag. Das ist der Kern — alles andere kannst du ignorieren.',
        allein: 'Der Log ist der Kern von Voria: deine Reisen, Tag für Tag. Alles andere kannst du ignorieren.',
      },
      reise: {
        titel: 'Eine Reise anlegen',
        zeigt: 'Damit fängt alles an. Ein Name genügt, alles andere lässt sich später ändern.',
        allein:
          'Reisen legst du im Log an. Ein Name genügt, alles andere lässt sich später ändern.',
      },
      modi: {
        titel: 'Zwei Ansichten für denselben Tag',
        zeigt: '„Seite" ist eine Buchseite zum Schreiben. „Fläche" ist ein Schuhkarton zum Anordnen. Beide zeigen dasselbe.',
        allein:
          'Jeder Tag hat zwei Ansichten: „Seite" zum Schreiben, „Fläche" zum Anordnen. Beide zeigen dieselben Inhalte — der Wechsel verliert nichts.',
      },
      fotos: {
        titel: 'Fotos',
        zeigt: 'Wirf Bilder hinein. Datum und Ort liest Voria selbst heraus — du musst nichts abtippen.',
        allein:
          'Auf jedem Tag kannst du Fotos hinzufügen. Datum und Ort liest Voria aus den Bildern heraus, du musst nichts abtippen.',
      },
      teilen: {
        titel: 'Alles bleibt privat',
        zeigt: 'Bis du hier etwas anderes einstellst. Teilen entscheidest du pro Tag, und du kannst es jederzeit zurücknehmen.',
        allein:
          'Jeder Tag ist privat, bis du ihn ausdrücklich teilst. Das entscheidest du pro Tag und kannst es jederzeit zurücknehmen.',
      },
      ende: {
        titel: 'Das war es schon',
        zeigt: 'Der Rest findet sich beim Schreiben. Voria drängt nicht.',
        allein: 'Der Rest findet sich beim Schreiben. Voria drängt nicht.',
      },
    },
  },

  wand: {
    titel: 'Weiterlesen in Voria',
    zeile:
      'Voria ist ein Reisetagebuch. Was du hier gelesen hast, hat jemand für sich geschrieben und dann geteilt — das meiste bleibt privat. Ein Konto ist kostenlos, und dein Tagebuch gehört dir.',
    anlegen: 'Konto anlegen',
    spaeter: 'Nur diesen Tag lesen',
    schliessen: 'Schließen',
  },

  konto: {
    titel: 'Konto',
    loeschen: 'Konto löschen',
    wasPassiert:
      'Damit verschwinden alle Reisen, Tage, Fotos, geteilten Beiträge und Kommentare. Das lässt sich nicht rückgängig machen, und ich kann nichts davon zurückholen. Wenn du deine Einträge behalten willst, exportiere sie vorher.',
    tippeNamen: 'Tippe {name}, um es zu bestätigen',
    endgueltig: 'Endgültig löschen',
    abbrechen: 'Doch nicht',
    laeuft: 'Wird gelöscht …',
    nameFalsch: 'Der Name stimmt nicht überein.',
    dateienFehler:
      'Deine Fotos ließen sich nicht löschen, deshalb ist auch das Konto geblieben. Bitte versuch es später noch einmal.',
    fehler: 'Das hat nicht geklappt. Das Konto besteht weiter.',
  },

  rueckmeldung: {
    titel: 'Rückmeldung',
    zeile: 'Was fehlt, was stört, was kaputt ist. Alles hilft.',
    platzhalter:
      'Schreib einfach drauflos. Wenn etwas nicht funktioniert hat: was hast du gemacht, und was ist stattdessen passiert?',
    senden: 'Absenden',
    laeuft: 'Wird gesendet …',
    danke: 'Angekommen. Danke dafür.',
    hinweis:
      'Mitgesendet wird, auf welcher Seite du gerade warst — das erspart die Rückfrage. Sonst nichts.',
    zuKurz: 'Ein paar Worte mehr, sonst lässt sich damit nichts anfangen.',
    zuLang: 'Das ist länger als viertausend Zeichen. Kürz es bitte etwas ein.',
    schiefgelaufen: 'Das hat nicht geklappt. Versuch es bitte gleich noch einmal.',
  },

  startbereich: {
    titel: 'Womit Voria startet',
    zeile: 'Wo du landest, wenn du die App öffnest.',
    feed: 'Feed',
    log: 'Log',
    stillHinweis:
      'Solange der Stille Modus an ist, startet Voria im Log. Deine Auswahl bleibt stehen.',
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
    katAussehen: 'Aussehen',
    katAussehenZeile: 'Hell oder dunkel, Sprache, die zwölf Welten',
    katHinweise: 'Hinweise',
    katHinweiseZeile: 'Was du mitbekommst — und wo Voria startet',
    katProZeile: 'Material, Design und was es kostet',
    katKontoZeile: 'Deine Daten mitnehmen, Rückmeldung, Konto löschen',
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
    ansichtenTitel: 'So sieht es aus',
    ansichtenZeile:
      'Drei Blicke in die App. Kein Bildschirmfoto — das hier ist die echte Oberfläche, mit denselben Farben und Ornamenten, die du später vor dir hast.',
    ansichtenFein:
      'Beispieltexte. Wie es bei dir aussieht, hängt davon ab, wo du warst — jede der zwölf Regionen bringt ihr eigenes Material mit.',
    blickSeite: 'Seite',
    blickFlaeche: 'Fläche',
    blickWelt: 'Deine Welt',
    mockTitel: 'Der Bus kam nicht',
    mockZettel1: 'Bahnhof, 6 Uhr. Niemand da außer einem Hund.',
    mockZettel2: 'Tee mit zu viel Zucker.',
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
