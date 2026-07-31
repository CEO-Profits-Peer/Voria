/**
 * English.
 *
 * Must mirror every key in `de.ts` — TypeScript enforces this via the
 * `Woerterbuch` type. Same tone: calm, concrete, whole sentences.
 * No exclamation marks, no "revolutionary", no "seamless".
 */

import type { Woerterbuch } from './de';

export const en: Woerterbuch = {
  marke: 'Voria',

  nav: {
    log: 'Journal',
    karte: 'Map',
    feed: 'Feed',
    du: 'You',
    suchen: 'Search',
    mehr: 'More',
    dasBistDu: 'That is you',
    einstellungen: 'Settings',
  },

  auth: {
    anmelden: 'Sign in',
    registrieren: 'Create account',
    willkommenZurueck: 'Welcome back',
    tagebuchAnfangen: 'Start a journal',
    wartetAufDich: 'Your journal is waiting.',
    bleibtPrivat: 'Everything you write stays private — until you decide otherwise.',
    email: 'Email',
    passwort: 'Password',
    benutzername: 'Username',
    benutzernameHilfe: 'Lowercase letters, digits, underscores.',
    passwortHilfe: 'At least ten characters.',
    schonKonto: 'Already have an account?',
    nochKeinKonto: 'No account yet?',
    einesAnlegen: 'Create one',
    abmelden: 'Sign out',
    einenMoment: 'One moment',
    fehlerAnmeldung: 'That combination of email and password does not match.',
    fehlerBenutzername:
      'Usernames are three to twenty-four characters, lowercase letters, digits and underscores only.',
    fehlerBenutzernameBelegt: 'That username is already taken.',
    fehlerPasswortKurz: 'The password needs at least ten characters.',
    fehlerKonto: 'The account could not be created. Try again later.',
    bestaetigeEmail: 'Almost there — confirm the email we sent you.',
    passwortVergessen: 'Forgot password',
    passwortVergessenZeile: 'Enter your email and we will send you a link to reset it.',
    neuesPasswort: 'New password',
    neuesPasswortZeile: 'Choose a new password. You will be signed in right afterwards.',
    linkSchicken: 'Send link',
    passwortSpeichern: 'Save password',
    passwortVergessenLink: 'Forgot your password?',
    fehlendeFelder: 'Please enter your email and password.',
  },

  log: {
    deineReisen: 'Your journeys',
    neueReise: 'New journey',
    ersteReiseAnlegen: 'Start your first journey',
    keineReise: 'No journey yet',
    keineReiseZeile:
      'Your journeys will live here, day by day. You can start the first one whenever you set off.',
    ohneDatum: 'No date',
    ohneTitel: 'Untitled',
    ohneLand: 'No country yet',
    tag: 'day',
    tage: 'days',
    land: 'country',
    laender: 'countries',
    heuteSchreiben: 'Write about today',
    andererTag: 'Another day',
    andererTagLabel: 'Pick a date',
    zurueckZurReise: 'Back to the journey',
    zurueckZuAllen: 'Back to all journeys',
    reiseBearbeiten: 'Edit journey',
    wohinGehtEs: 'Where are you going?',
    allesAenderbar: 'You can change all of this later. None of it is binding.',
    nameDerReise: 'Name of the journey',
    ersterTag: 'First day',
    letzterTag: 'Last day',
    landHilfe: 'Two letters. Decides how the journey looks.',
    reiseAnlegen: 'Create journey',
    uebernehmen: 'Save',
    laenderTitel: 'Countries',
    laenderZeile: 'Decides how the journey looks. Several countries are possible — the one with the most days wins.',
    laenderkuerzel: 'Country code',
    landHinzufuegen: 'Add country',
    aussehenTitel: 'Appearance',
    aussehenErgibt: 'From the countries this becomes',
    aussehenUeberschreiben: 'You can override it.',
    nochNichts: 'nothing yet',
    regionAbleiten: 'Derive from countries',
    regionWahl: 'Region',
    aussehen: 'Appearance',
    ausLaendernAbleiten: 'Derive from countries',
    modusRuhig: 'Page',
    modusFrei: 'Canvas',
    zurFreienFlaeche: 'Switch to the open space',
    zurRuhigenSeite: 'Switch to the quiet page',
    titelPlatzhalter: 'Title',
    titelDesTages: 'Title of the day',
    wasHeutePassiertIst: 'What happened today',
    fotoWeg: 'Or start with a photo',
    fotoGross: 'View photo large',

    // Free canvas
    etwasHinzufuegen: 'Add something',
    textDazu: 'Text',
    fotoDazu: 'Photo',
    notizSchreiben: 'Write a note',
    schreibenBeenden: 'Finish writing',
    notizLeer: 'Type here.',
    drehen: 'Rotate',
    groesseAendern: 'Resize',
    entfernen: 'Remove',
    ablegenHinweis: 'Tap to put it down — the canvas still scrolls',
    anstoss: [
      'What happened today?',
      'What do you want to remember in ten years?',
      'What did you see for the first time today?',
      'How did the day feel?',
    ],
  },

  teilen: {
    titel: 'Who should see this?',
    teilen: 'Share',
    aendern: 'Change',
    privat: 'Only you',
    privatErklaerung: 'Nobody else sees this day. Not in search either.',
    folgende: 'People who follow you',
    folgendeErklaerung: 'Visible to your followers. Not in the open feed.',
    oeffentlich: 'In the feed',
    oeffentlichErklaerung: 'Appears in the feed and can receive upvotes. Reversible at any time.',
    einSatzDazu: 'A sentence about it, if you like',
    optional: 'Optional.',
  },

  fotos: {
    hinzufuegen: 'Add photos',
    auswaehlen: 'Choose images',
    warten: 'Pick some images. I will read the date and place myself.',
    lesen: 'Checking when and where this was taken.',
    verkleinern: 'Making the images lighter, without anyone noticing.',
    fertig: 'Done.',
    fehler: 'Something went wrong.',
    originaleBleiben: 'Your originals stay on the device. Only a light version is uploaded.',
    vorheriges: 'Previous photo',
    naechstes: 'Next photo',
  },

  karte: {
    deineWelt: 'Your world',
    leerZeile:
      'Twelve regions are waiting. As soon as a journey knows a country, its region gets material, light and colour here.',
    nochNicht: 'not yet',
    seit: 'since',
  },

  feed: {
    titel: 'Feed',
    stillHier: 'Quiet in here',
    stillZeile:
      'What others have shared will appear here. You do not have to leave anything — your journal stays yours.',
    zustimmen: 'Upvote',
    zustimmungZurueck: 'Remove upvote',
    irgendwo: 'somewhere',
    jemand: 'Someone',
    geschriebenVon: 'Written by',
    nichtsGeteilt: 'Nothing has been shared here yet.',
    teilen: 'Share',
    kopiert: 'Copied',
    anzeige: 'Sponsored',
    einTag: 'A day',
    fuerDich: 'For you',
    folgeIch: 'Following',
    entdecken: 'Discover',
    amEnde: 'That was everything for today.',
    nichtsNeues: 'Nothing unfamiliar right now',
    nichtsNeuesZeile:
      'This is where days from places you have not been show up. Nothing at the moment — come back later.',
    niemandGefolgt: 'You are not following anyone yet',
    niemandGefolgtZeile:
      'This is where the days of people you follow appear, in the order they were written. Search is where you find the first few.',
  },

  kommentar: {
    titel: 'Comments',
    knopf: 'Comments',
    schreiben: 'Say something about this',
    antwortSchreiben: 'Reply',
    senden: 'Post',
    speichern: 'Save',
    abbrechen: 'Cancel',
    antworten: 'Reply',
    bearbeiten: 'Edit',
    bearbeitet: 'edited',
    nochNichts: 'Nobody has said anything yet.',
    eineAntwort: 'One reply',
    antwortenZeigen: 'replies',
    antwortenVerbergen: 'Hide replies',
  },

  hinweise: {
    titel: 'Activity',
    zeile: 'What happened while you were away.',
    ungelesen: 'unread',
    nochNichts: 'Nothing yet',
    nochNichtsZeile:
      'This is where it shows up when someone responds to you or shares something. None of it needs an answer.',
    folgtDir: 'is now following you.',
    hatKommentiert: 'commented on your day.',
    hatGeantwortet: 'replied to you.',
    hatGeteilt: 'shared a day.',
    stillerModus: 'Quiet mode',
    stillerModusZeile:
      'Turns off every notice at once. Your individual settings stay as they are — switch it back off and everything is where you left it.',
    schalterKommentar: 'Comments and replies',
    schalterFolger: 'New followers',
    schalterUpload: 'When someone you follow shares',
  },

  rechtliches: { datenschutz: 'Privacy' },

  pro: {
    titel: 'Voria PRO',
    vorschauZeile:
      'PRO changes not a single measurement. It is the same sheet, just finer: gold foil on the ornament, denser paper, an embossed title.',
    designTitel: 'The design',
    designRegion: 'Your region',
    designRegionZeile: 'Everything stays as it is today',
    designNordlicht: 'Northern Light & Polar Night',
    designNordlichtZeile: 'Snow grain, cold light',
    materialSchalter: 'PRO material',
    materialZeile:
      'Gold foil, finer paper, embossing. If you prefer it plain, switch it off — you paid for more than the looks.',
    bewegungSchalter: 'Let the light drift',
    bewegungZeile:
      'Very slowly, about a minute per pass. Off by default, because nothing needs to move on a page you write on.',
    blattMeta: '12 April 2026 · Chefchaouen, Morocco',
    blattTitel: 'The bus never came',
    blattText:
      'So we stayed. After an hour the woman from the kiosk brought us tea without being asked. The square lay in shade, and at some point it was evening.',
  },

  export: {
    titel: 'Take everything with you',
    warum:
      'Voria is meant to be the place you read back in ten years. That is only an honest promise if your entries can leave with you at any time — no account, no Voria, no connection.',
    wasDrin:
      'You get an archive with your photos, one readable text file per trip, and all the data once more in full as JSON. It is assembled on your own device; none of it passes through someone else’s server.',
    knopf: 'Create archive',
    laeuft: 'Putting it together …',
    sammelt: 'Collecting your entries …',
    fortschritt: '{fertig} of {gesamt} photos',
    fertig: 'Done. The archive is in your downloads.',
    fertigMitLuecken:
      'Done — {anzahl} photos could not be loaded and are missing from the archive. Everything else is complete.',
    fehler: 'That did not work. Please try again.',
    hinweisFotos:
      'The photos are the display versions from Voria, not your camera originals — those are still on your device.',
    verweis: 'Take everything with you',
  },

  konto: {
    titel: 'Account',
    loeschen: 'Delete account',
    wasPassiert:
      'This removes every trip, day, photo, shared post and comment. It cannot be undone, and none of it can be brought back. If you want to keep your entries, export them first.',
    tippeNamen: 'Type {name} to confirm',
    endgueltig: 'Delete permanently',
    abbrechen: 'Never mind',
    laeuft: 'Deleting …',
    nameFalsch: 'That name does not match.',
    dateienFehler:
      'Your photos could not be deleted, so the account is still here. Please try again later.',
    fehler: 'That did not work. The account still exists.',
  },

  rueckmeldung: {
    titel: 'Feedback',
    zeile: "What's missing, what's annoying, what's broken. All of it helps.",
    platzhalter:
      "Just start writing. If something did not work: what did you do, and what happened instead?",
    senden: 'Send',
    laeuft: 'Sending …',
    danke: 'Received. Thank you for that.',
    hinweis:
      'The page you were on is sent along — it saves a follow-up question. Nothing else.',
    zuKurz: 'A few more words, otherwise there is nothing to work with.',
    zuLang: 'That is longer than four thousand characters. Please trim it a little.',
    schiefgelaufen: 'That did not work. Please try again in a moment.',
  },

  startbereich: {
    titel: 'Where Voria starts',
    zeile: 'Where you land when you open the app.',
    feed: 'Feed',
    log: 'Log',
    stillHinweis:
      'While quiet mode is on, Voria starts in the log. Your choice stays as it is.',
  },

  profil: {
    du: 'You',
    reisen: 'Journeys',
    folgenDir: 'Followers',
    duFolgst: 'Following',
    geteilt: 'Shared',
    folgen: 'Followers',
    folgt: 'Following',
    duFolgstIhm: 'Following',
    folgenAktion: 'Follow',
    bearbeiten: 'Edit profile',
    profilbild: 'Profile picture',
    bildWaehlen: 'Choose image',
    bildTauschen: 'Replace image',
    bildEntfernen: 'Remove',
    bildLaedt: 'Uploading …',
    bildFehler: 'The image could not be uploaded. Please try again.',
    bildHilfe: 'Cropped square, 256 pixels. Resizing happens on your device.',
    anzeigename: 'Display name',
    beschreibung: 'About you',
    beschreibungHilfe: 'A sentence or two. Shown on your profile.',
    privatesProfil: 'Keep profile private',
    privatesProfilHilfe: 'Your profile will not appear in search. Shared posts stay visible.',
    gesichert: 'Saved.',
  },

  einstellungen: {
    titel: 'Settings',
    erscheinungsbild: 'Appearance',
    hell: 'Light',
    dunkel: 'Dark',
    wieGeraet: 'Match device',
    sprache: 'Language',
    spracheZeile: 'The interface switches right away. Your entries stay exactly as you wrote them.',
    zwoelfWelten: 'The twelve worlds',
    weltenZeile:
      'Every region brings its own material, light and craft. Your journeys receive them automatically, depending on where you were — here you can look at them beforehand.',
  },

  suche: {
    titel: 'Search',
    zeile: 'Across everything you have written.',
    platzhalter: 'A word, a place, a name',
    nichts: 'Nothing in your journal matches that yet.',
    leeren: 'Clear',
    reiterTage: 'Days',
    reiterLeute: 'People',
    platzhalterLeute: 'Name or username',
    nichtsLeute: 'Nobody by that name.',
    keinerFolgt: 'No followers yet',
    folgtEiner: 'One follower',
    folgenMehrere: 'followers',
  },

  rueckblick: {
    titel: 'Year in review',
    zeile: 'One year, on a single page.',
    keinJahr: 'Nothing for this year yet.',
    keinJahrZeile: 'Once you have written a few days, a review will appear here.',
    inDiesemJahr: 'This year',
    laengsteReise: 'Longest journey',
    meisteWorte: 'The longest day',
    ersterTag: 'It started',
    fotos: 'photos',
    worte: 'words',
  },

  zustand: {
    nichtGefunden: 'This page does not exist',
    nichtGefundenZeile: 'Maybe it moved, maybe the link was just a typo.',
    zurueckInDenLog: 'Back to the journal',
    zumLog: 'To the journal',
    fehler: 'Something went wrong',
    fehlerZeile: 'Your entries are safe — only this view broke. Give it another try.',
    nochEinmal: 'Try again',
    laden: 'One moment.',
    keinNetz: 'No connection',
    keinNetzZeile:
      'You can keep reading whatever you already opened. New things arrive once you are back online — nothing gets lost.',
    offlineStreifen:
      'No connection. Reading continues, new things are saved once you are back online.',
    schliessen: 'Close',
    zurueck: 'Back',
  },

  start: {
    anfangen: 'Get started',
    hero: 'The place where, in ten years, you read back what your life felt like.',
    heroZeile:
      'A travel journal that looks like the places you have been. You write, you throw in your photos — the date, place and country are already there.',
    tagebuchAnfangen: 'Start a journal',
    kostenlos: 'Free. Everything stays private until you decide otherwise.',
    zweiArten: 'Two ways to write',
    zweiArtenZeile:
      'A quiet page in the evening, when you have words. An open surface for pasting and arranging, when you only have images. Both show the same day — switching loses nothing.',
    fotosWissen: 'Your photos already know',
    fotosWissenZeile:
      'Every image carries its date and coordinates. Voria reads them and lays out the days. You never type what your phone already knows.',
    zwoelfWelten: 'Twelve worlds',
    zwoelfWeltenZeile:
      'Morocco looks like sandstone and indigo, Japan like washi and vermilion. No flags, no national colours — material, light and craft.',
    sozialesFreiwillig: 'The social part is optional',
    sozialesZeile1:
      'Voria works completely without anyone seeing a thing. No pressure to fill in a profile, no streak to break, no reminder with an exclamation mark. If you write nothing for three weeks, nobody says anything.',
    sozialesZeile2: 'And if you do want to share, you decide per day — not per account.',
    beispielOrt1: 'Naoshima, Japan',
    beispielText1:
      'The rain did not stop all day. I walked to the harbour anyway, because there was nothing else to do.',
    beispielOrt2: 'Chefchaouen, Morocco',
    beispielText2:
      'The bus never came, so we stayed. After an hour the woman from the kiosk brought us tea, without asking.',
    beispielOrt3: 'Reine, Norway',
    beispielText3:
      'At two in the morning it was still bright enough to read. We tried it, just to be sure.',
    beispielOrt4: 'Uyuni, Bolivia',
    beispielText4:
      'The ground was so flat that the sky began at the bottom. You lose your sense of distance.',
  },

  regionen: {
    nordeuropa: 'Northern Europe & Scandinavia',
    alpen: 'Alps & Central Europe',
    mittelmeer: 'Mediterranean',
    maghreb: 'North Africa & Maghreb',
    ostafrika: 'East Africa',
    naherOsten: 'Middle East',
    suedasien: 'South Asia',
    suedostasien: 'Southeast Asia',
    ostasien: 'East Asia',
    ozeanien: 'Oceania',
    anden: 'Andes & South America',
    nordamerikaWest: 'North America West & Polar',
    neutral: 'No region',
  },
};
