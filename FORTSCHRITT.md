# Voria — Fortschritt

Live: https://voria-travel.vercel.app

Ich führe hier mit, was tatsächlich behoben oder gebaut ist, und was
davon ich selbst geprüft habe. Zahlen darin sind echt gezählt, nicht
gerundet.

Was als Nächstes ansteht, steht in `ANSTEHEND.md` — hier steht nur,
was hinter uns liegt.

---

## Wie es angefangen hat

`npm run build` brach ab. Von dort aus haben wir sieben Fehler
gefunden, die alle dieselbe Eigenschaft hatten: **sie waren lautlos.**
Kein Build-Fehler, keine Konsolenmeldung, kein Eintrag im Terminal. Die
App sah funktionsfähig aus und war es nicht.

Das ist die Sorte Fehler, die man nicht durch Nachdenken findet,
sondern nur durch Nachsehen. Deshalb steht bei jedem unten, **woran** er
sichtbar wurde.

---

## Behoben — 17 Fehler

| # | Fehler | Woran er sichtbar wurde |
|---|---|---|
| 1 | Build-Abbruch: `next/headers` im Browser-Bundle | Fehlermeldung sprach von `pages/`, das es nicht gibt |
| 2 | 200 Typfehler durch `as const` in `de.ts` | Jede Übersetzung hätte wörtlich deutsch sein müssen |
| 3 | Navigation ungestaltet — styled-jsx scopet `<Link>` nicht | `<a class="ziel">` ohne `jsx-`Klasse im DOM |
| 4 | **Kein Klick funktionierte** — Service Worker lieferte JS aus altem Build | `__reactFiber` fehlte an allen Knoten |
| 5 | „Neue Reise" ohne Wirkung — fehlendes Profil, Fremdschlüssel | `POST 200` statt `303`, Avatar zeigte `?` |
| 6 | Profil entstand nie — `signUp` hat noch keine Sitzung, RLS blockte | Konten ohne Profilzeile in der Datenbank |
| 7 | Fremde öffentliche Reisen in „Deine Reisen", Karte, Rückblick, Zählung | Code-Prüfung: `.eq('user_id')` fehlte 4× |
| 8 | Titel/Ort gespeichert, aber nirgends sichtbar | `revalidatePath` fehlte |
| 9 | **Feed dauerhaft leer** — `PGRST201`, zwei Wege von `posts` zu `profiles` | `HTTP 300` bei der nachgestellten REST-Anfrage |
| 10 | Freie Fläche stürzte ab, sobald man ein Foto einfügte | Code-Prüfung: `lagen[b.id]` konnte `undefined` sein |
| 11 | Sichtbarkeit nur im ruhigen Modus änderbar | Deine Meldung |
| 12 | Foto-Knopf verschwand nach dem ersten Satz (`istLeer`) | Deine Meldung |
| 13 | Doppelklick im Feed markierte die Bilder blau | Deine Meldung |
| 14 | **Tage ließen sich nicht betiteln** — Feld unsichtbar, und in „Fläche" gar nicht vorhanden | Deine Meldung |
| 15 | **Personensuche tot** — `RAISE` mit `%%` in `0007`, ganze Migration rollte zurück | Deine Meldung |
| 16 | **Wortmarke wechselte die Schrift** je nach Theme, an drei Stellen | Der neue Wächter `pruefe:marke` |
| 17 | PRO-Design färbte Navigation und Knöpfe mit um | Beim Festschreiben der Marke |

Der teuerste war Nummer 4. Er hat mehrere andere Fehler vorgetäuscht:
weil React nicht hydrierte, tat kein Klick etwas, und es sah aus, als
sei „Übernehmen" kaputt. Funktionierte nur, was ohne JavaScript geht —
also das nackte `<form action={…}>`.

Nummer 15 ist die bislang teuerste Kleinigkeit. In der Schlussprüfung
von `0007` stand `RAISE ... (%%)` — zwei Prozentzeichen sind ein
**maskiertes** Prozent, also null Platzhalter bei einem Argument.
Postgres brach mit „too many parameters specified for RAISE" ab.

Der eigentliche Schaden entstand danach: Der Supabase-Editor führt ein
Skript als **eine Transaktion** aus. Weil die Prüfung ganz am Ende
scheiterte, rollte **alles** zurück — auch `create function
leute_suchen`, das längst durchgelaufen war. In der Anwendung sah das
so aus, als sei die Personensuche kaputt. Sie war es nicht; es gab sie
nur nicht.

Daraus die Regel in `CLAUDE.md`: Jede Migration muss wiederholbar sein.
`0008` bis `0011` sind entsprechend nachgezogen.

Nummer 13 ist lehrreich, weil die Ursache eine Ebene früher lag als der
Fehler: Der Browser beginnt die Auswahl beim zweiten `mousedown`, also
bevor `dblclick` überhaupt feuert. Im Doppelklick-Handler war es dafür
schon zu spät — dort ließ sich die Markierung nur noch wegräumen,
nachdem sie zu sehen war. `user-select: none` wäre der falsche Ausweg
gewesen: dann ließe sich auch der Text eines Beitrags nicht mehr
markieren.

---

## Gebaut — 38 Funktionen

1. **Freie Fläche: Textblöcke** — anlegen, schreiben, verschieben,
   drehen, löschen. Verzögertes Speichern mit einer Uhr pro Block.
2. **Personensuche** — Reiter „Tage" / „Leute" unter einem Feld,
   Trigramm-Indizes, Folgen direkt im Ergebnis.
3. **Profilbilder** — Upload mit Zuschnitt auf 256 px im Browser,
   sichtbar in Feed, Suche, Seitenleiste und auf Profilen.
4. **Verfasser im Feed anklickbar** — führt aufs Profil.
5. **Teilen nach außen** — öffentliche Route `/b/<id>` mit Open-Graph,
   Systemblatt auf dem Handy, Kopieren am Rechner.
6. **Tagesleiste** — Foto und Sichtbarkeit in beiden Modi erreichbar.
7. **Zwei Wächterskripte.** `npm run pruefe:stile` findet ungescopete
   styled-jsx-Regeln (Fehler 3). `npm run pruefe:marke` findet
   Wortmarken, die eine Regionen-Schrift lesen, und PRO-Designs, die
   auf die Wurzel wirken (Fehler 16 und 17) — es fand beim allerersten
   Lauf sofort eine Stelle, die ich übersehen hatte.
8. **Deployment** auf Vercel, Adresse aus `VERCEL_URL` statt
   festverdrahtetem localhost.

9. **Kommentare mit Stimmen** — verschachtelt und ausklappbar, nach
   Stimmen sortiert, bearbeitbar statt löschbar. Migration `0006`.
   Zwei Dinge kamen beim Bauen dazu, die in der Spezifikation fehlten:
   **Spaltenrechte** (Row Level Security kennt keine Spalten — ohne
   `revoke update` / `grant update (text)` ließe sich beim Bearbeiten
   des eigenen Kommentars in derselben Anweisung `vote_count = 9999`
   setzen) und die **Textprüfung im Bearbeitungs-Trigger** (sonst
   feuert er auch beim UPDATE des Zählers, und jeder Kommentar bekäme
   bei der ersten Zustimmung ein „bearbeitet" verpasst).
10. **Vergangene Tage schreiben** — natives Datumsfeld unter der
    Tagesliste, Grenzen aus der Reise.
11. **Jahres-Gruppierung im Log** — dazu `entries(count)` statt aller
    Eintrags-IDs, und ein Fehler wird geloggt statt als „Noch keine
    Reise" auszusehen.
12. **Suchtreffer hervorheben** — Auszug zerlegt und als React-Knoten
    zusammengesetzt, ausdrücklich kein HTML eingesetzt.

13. **Feed lädt nach** — zehn Beiträge je Stapel statt fünfzig auf
    einmal, ausgelöst beim ersten Beitrag des letzten Stapels. Die
    Werbung wird über den ganzen angesammelten Bestand gemischt, nicht
    je Stapel — sonst stünde an jeder Stapelgrenze eine Anzeige falsch.
14. **Feed-Reiter „Für dich" und „Folge ich"** — Verweise statt Knöpfe,
    Reiter steht im Adressfeld.
15. **Feed ohne Scrollleiste** — eine Leiste, deren Griff bei jedem
    Nachladen kleiner wird, behauptet eine Länge, die es nicht gibt.

16. **Personensuche verzeiht Tippfehler** — „marakesh" findet
    „Marrakesch". Der Trigramm-Index lag seit `0005` da, nur die Frage
    war die falsche: `ilike` verlangt die Zeichenkette buchstäblich.
    Jetzt eine Datenbankfunktion, weil `similarity()` über PostgREST
    weder filterbar noch sortierbar ist.

17. **Hinweise und Stiller Modus** — vier Arten, per Trigger erzeugt,
    einzeln abschaltbar, Punkt in der Seitenleiste. Dabei zwei eigene
    Fehler abgefangen: der doppelte Weg von `notifications` nach
    `profiles` (derselbe `PGRST201`, der den Feed lahmgelegt hat) und
    ein Schreibvorgang während des Renderns, den der Build nicht
    zeigen kann, weil die Seite dynamisch ist.

18. **Startbereich** — Voria startet im Feed, umstellbar auf den Log.
    Der Stille Modus überschreibt das auf den Log, ohne die Wahl
    umzuschreiben. Entschieden wird in `middleware.ts`, und die
    Abfrage läuft nur beim Umleiten, nicht bei jedem Aufruf.
19. **Reiterleiste, die sich beim Lesen wegduckt** — zentriert,
    breiter, klebt oben; verschwindet beim Weiterlesen und kommt beim
    Hochscrollen zurück. Schwelle gegen Flackern, ganz oben immer da.
20. **Rückmeldungen** — ein Feld, ein Knopf. Tabelle ohne
    `select`-Regel: geschrieben wird über die App, gelesen im
    Dashboard.
21. **Impressum und Datenschutzerklärung** als Gerüst, öffentlich
    erreichbar, jede offene Stelle sichtbar in eckigen Klammern.

22. **Konto löschen** — Bestätigung durch Abtippen des eigenen
    Benutzernamens, **serverseitig geprüft**. Erst die Dateien, dann
    das Konto: andersherum wäre das Konto weg und die Fotos lägen für
    immer im Speicher, ohne dass jemand wüsste, wem sie gehören.
    Schlägt das Löschen der Dateien fehl, bricht der Vorgang ab.
23. **`picsum.photos` aus `next.config.ts`** — solange der Eintrag
    dort stand, konnte jeder beliebige Bilder von einem fremden Server
    in Voria einbetten. Die Testdaten brauchen ihn; wer sie einspielt,
    setzt ihn lokal ein und nimmt ihn danach wieder heraus.
24. **Rückmeldung im Profil auffindbar** — die Seite gab es schon,
    aber ohne i18n-Schlüssel und ohne Verweis dorthin. Beides nachgetragen.
25. **Voria PRO: Materialschicht und Nordlicht & Polarnacht** — nach
    dem Entwurf von Claude Design. Goldfolie, feineres Papier und
    Prägung nehmen die Farbe der jeweiligen Region auf, statt sie zu
    ersetzen — funktioniert dadurch in allen zwölf Regionen ohne
    regionsspezifischen Code. Das erste von vier vorgeschlagenen
    Designs ist gebaut, die anderen drei bewusst zurückgestellt. Die
    im Entwurf vorgeschlagene Dauerbewegung des Lichts steht
    standardmäßig aus, mit eigenem Schalter — Begründung in
    `docs/ENTSCHEIDUNGEN.md`. Dabei eine Doppelung im eigenen Code
    bemerkt und behoben: zwei fast identische Schalterzeilen wurden zu
    `src/ui/Schalterzeile.tsx` zusammengelegt.

26. **Wischbremse im Feed** — `scroll-snap-type: proximity` plus
    `scroll-snap-stop: always`, nur auf der Feed-Seite. Ein kräftiger
    Wisch überspringt damit eine Karte statt zwanzig, ohne dass Snap
    das Überfliegen in ein Raster zwingt. Teilweise Rücknahme der
    Entscheidung vom 30.07. — die galt `mandatory`.
27. **Gelesen merken** — `post_views`, Ungelesenes zuerst. Gelesenes
    wird nach hinten sortiert statt ausgeblendet: bei zwei Beiträgen
    im Bestand wäre der Feed sonst nach einem Durchgang leer. Der Feed
    läuft dafür jetzt über die Datenbankfunktion `feed_laden`.
28. **Reiter „Entdecken"** — Beiträge aus Regionen, in denen man noch
    nicht war. Am Handy ausgeblendet, außer man steht darin.
29. **Export** — Archiv mit Fotos, je einer lesbaren Textdatei pro
    Reise und allen Daten als JSON. Zusammengebaut im **Browser**:
    Auf Vercel müsste eine Funktion sonst alles gleichzeitig im
    Speicher halten und in Sekunden ausliefern — das scheitert genau
    bei dem, der viel gesammelt hat. Der ZIP-Schreiber kommt ohne
    Bibliothek aus, weil AVIF und WebP sich nicht weiter komprimieren
    lassen.
30. **Die Marke festgeschrieben** — eigene Werte in `globals.css`, die
    kein Theme anfassen darf, plus der Ortsmarken-Punkt hinter dem
    Wort. Dazu der Wächter aus Nummer 7.

31. **Abo-Gerüst** — Tabelle `subscriptions` ohne jede Schreibregel,
    `istPro()` fragt sie statt `false` zu liefern, Webhook unter
    `/api/paddle` mit Signaturprüfung. Bezahlt bleibt bezahlt bis zum
    Ende der Periode; im Zweifel gilt „frei".

32. **Einstellungen in vier Kategorien** — vorher sieben Abschnitte in
    einem Scroll: Wer den Schalter für die Hinweise suchte, kam an
    einem Schaufenster mit zwölf Themes vorbei. Jetzt eine Übersicht
    und vier Unterseiten (Aussehen, Hinweise, PRO, Konto). Dabei
    `Erscheinungsbild` und `RegionenVorschau` als eigene Komponenten
    herausgelöst; die Sammelkomponente `Einstellungen.tsx` ist weg.
33. **Preisseite `/pro`** — Fassung A aus dem Entwurf: zuerst das
    Blatt, dann der Preis, dann vier Absätze in ganzen Sätzen. Kein
    Vergleichsraster mit Häkchen. Öffentlich erreichbar, damit man
    ohne Konto erfährt, was Voria kostet. Statt eines Kaufknopfes, der
    nichts tut, steht dort ein ehrlicher Satz.

34. **Fotogrenze durchgesetzt** — serverseitig, mit sichtbarer
    Meldung. Dabei die eigentliche Falle abgefangen: Der Aufrufer warf
    den Rückgabewert weg, das Foto wäre still verschwunden.
35. **Werbung mit Bild, plus Platz für ein Werbenetz.** Bilder liegen
    unter `/public/werbung/` — niemals auf einem fremden Server, sonst
    zählt jeder Werbetreibende die Aufrufe selbst mit. Der Platz für
    ein Netz ist gebaut, aber leer: Was dort eingetragen werden darf,
    steht im Kopf von `ExterneAnzeige.tsx`.
36. **Der gesetzte Bogen** — `/du/export/druck`, das erste echte
    PRO-Merkmal. Ein Druck-Stylesheet statt einer PDF-Bibliothek: Der
    Browser kann „Als PDF speichern" besser, er kennt Schriften,
    Silbentrennung und Papierformat. Ergebnis ist ein durchsuchbares
    Dokument statt eines Stapels Bilder — und dieselbe Vorlage kann
    später an eine Druckerei gehen.

37. **Der PRO-Streifen** — unten im Feed, zum Wegwischen, kein
    modaler Dialog. Höchstens zweimal je Woche, nach dem dritten
    Wegwischen drei Monate Ruhe. **Nirgends im Log:** Wer schreibt,
    wird nicht gefragt — das ist keine Einstellung, sondern eine Frage
    des Ortes. Migration `0014`.

38. **Offline schreiben, erste Stufe** — jeder Anschlag geht sofort in
    den lokalen Speicher, erst danach läuft die Uhr fürs Sichern.
    Scheitert das Sichern, liegt der Entwurf noch da und wird beim
    nächsten Öffnen eingesetzt. Vorher war der Absatz in diesem Fall
    fort, ohne Meldung und ohne Spur — und das ist genau der Fall,
    für den die App gebaut ist. Keine Synchronisierung zwischen zwei
    Geräten; die bleibt offen.

Dazu 14 Migrationen (`0004` Profil-Trigger, `0005` Suchindizes,
`0006` Kommentare, `0007` unscharfe Personensuche, `0008` Hinweise,
`0009` Startbereich und Rückmeldungen, `0010` PRO-Design,
`0011` Gelesen-Merker, `0012` Spaltenrechte auf posts, `0013` Abos,
`0014` PRO-Streifen)
und die Dokumente `START.md` und `DEPLOY.md`.

---

## Was ich selbst geprüft habe — und was nicht

Das ist die wichtigste Spalte in diesem Dokument.

**Im Browser nachgewiesen:**

* Der ZIP-Schreiber des Exports. Ein Probearchiv gebaut, mit
  `Expand-Archive` unter Windows geöffnet und geprüft: Ordner stehen,
  Umlaute im Dateinamen überleben (dafür ist das UTF-8-Bit im Kopf
  nötig), Binärdaten byteweise identisch — CRC32 und das Ablegen ohne
  Kompression stimmen also

* Fehlende `jsx-`Klassen an `<Link>`-Elementen (Nummer 3)
* Fehlende React-Schlüssel, und ihr Erscheinen nach dem Leeren der
  Service-Worker-Caches (Nummer 4)
* Reise anlegen von Hand — Redirect, Region aus `CA` berechnet,
  Erscheinen in der Übersicht (Nummer 5)
* Titel speichern nach dem Fix (Nummer 8)
* `PGRST201` in der nachgestellten Feed-Abfrage, und `HTTP 200` mit
  beiden Beiträgen nach dem Fix (Nummer 9)
* Dass die zwei Beiträge längst in der Datenbank standen — meine
  erste Vermutung zum Feed war damit widerlegt

**Nur im Code geprüft, nicht ausgeführt:**

* Textblöcke auf der freien Fläche
* Personensuche
* Profilbild-Upload
* Teilen nach außen und die Route `/b/<id>`
* Tagesleiste
* Kommentare, in jeder Hinsicht — Schreiben, Antworten, Bearbeiten,
  Stimmen, und ob der aufgeklappte Bereich ein `revalidatePath`
  übersteht
* Datumswähler, Jahresgruppen, Hervorhebung der Suchtreffer
* Ob der Doppelklick jetzt wirklich nichts mehr markiert

**Was am 30.07. dazukam:** `npm run pruefen` und `npm run build` laufen
inzwischen in meiner Umgebung durch und sind für alles oben grün. Das
beweist Typen und Syntax — **kein einziges Verhalten.** Die Fehler
dieses Projekts sind fast alle an einem grünen Build vorbeigekommen.

Die Liste zum Durchgehen steht in `ANSTEHEND.md`, Block A.

---

## Vier Fehlalarme, die ich zurückgenommen habe

Der Vollständigkeit wegen, weil sie zeigen, wo meine Werkzeuge lügen:

1. „Der Feed ist leer, weil das Teilen stillschweigend scheitert" —
   falsch. Die Beiträge standen längst in der Datenbank.
2. „Die Seite ist ungestaltet" — zweimal behauptet, beide Male ein
   Artefakt der Screenshot-Aufnahme. Computed Styles waren korrekt.
3. „Der Titel speichert nicht" — beim ersten Anlauf mein eigener
   Bedienfehler, mein Klick traf das Feld nicht.
4. „Die blauen Knöpfe im Teilen-Dialog sind ein Fehler" — nein,
   `#8b97d6` ist die Akzentfarbe der Region Maghreb im Dunkelmodus.
   Marokko färbt die Seite ein, genau wie entworfen.

---

## Was die Ziele angeht

Stand hier nicht mehr — es hat sich als die Stelle erwiesen, an der
zwei Dokumente auseinanderlaufen. **Die nächsten Schritte stehen in
`ANSTEHEND.md`, und nur dort.**
