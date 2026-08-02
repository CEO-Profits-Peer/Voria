# Entscheidungen

Chronologisch. **Vor einer Diskussion hier nachsehen** — was hier steht, wird nicht neu verhandelt, außer es gibt einen neuen Grund.

---

### 2026-07-27 · Name: Voria

Vora war der Favorit, kollidiert aber mit Vora AI Inc., einer YC-finanzierten Gesundheits-App in beiden App Stores. Vela hat eine Markenanmeldung, die Software *und* Reiseveranstaltung abdeckt. Voria kollidiert nur mit einer Unternehmensberatung und einem Animationsstudio — beides B2B, keine App-Store-Präsenz.

Behält den Klang, den wir wollten: zwei bis drei Silben, offener Vokal.

---

### 2026-07-27 · Web zuerst, native App später über Capacitor

Kein Expo. Begründung: Web deckt Handy und Desktop sofort ab, keine Store-Freigaben, keine 30 %.

Die drei Dinge, die eine Web-App auf iOS nicht kann — dauerhafter Offline-Speicher, Fotobibliothek mit EXIF im Bulk, Hintergrund-Standort — kommen später über eine native Hülle, ohne die Oberfläche neu zu bauen.

**Konsequenz für den Code:** Datenschicht und Logik müssen von der Oberfläche getrennt bleiben, sonst wird der Wechsel teuer.

---

### 2026-07-27 · Cloudflare R2 statt Supabase Storage

R2 hat keine Egress-Gebühren. Bei einer bildlastigen App ist Egress der Posten, der andere Anbieter tötet. Free-Tier 10 GB dauerhaft, danach etwa 1,5 Cent pro GB und Monat.

Supabase bleibt für Datenbank und Konten.

---

### 2026-07-27 · Anzeigeversion in der Cloud, Original auf dem Gerät

Ein iPhone-Foto wiegt 3–5 MB, dasselbe Bild als AVIF bei 2560 px etwa 300 KB — auf jedem Bildschirm nicht unterscheidbar.

Rechnung bei 100.000 Nutzern: rund 20 TB statt 250 TB, etwa 300 € statt mehreren Tausend im Monat.

Nebeneffekt: deckt sich mit dem Privacy-Anspruch. Private Fotos brauchen nur eine kleine Version zum Blättern zwischen Geräten.

---

### 2026-07-28 · Zuerst Supabase Storage, R2 später — Speicher als austauschbare Schicht

R2 verlangt eine hinterlegte Kreditkarte, auch im kostenlosen Tarif. Das war nicht gewollt und ist zum jetzigen Zeitpunkt auch unnötig.

Supabase Storage braucht kein Zahlungsmittel und gibt 1 GB frei — bei rund 300 KB je komprimiertem Foto etwa 3.300 Bilder. Für Entwicklung und erste Tester reichlich.

**Die Entscheidung vom 27.07. zu R2 bleibt richtig, nur der Zeitpunkt verschiebt sich.** Sobald echte Nutzer echte Mengen erzeugen, ist R2 wegen der fehlenden Egress-Gebühren klar überlegen.

Damit der Wechsel nichts kostet, liegt der Speicher hinter `src/lib/storage.ts`. Kein Code außerhalb dieser Datei importiert einen Storage-Client. Umgestellt wird über `STORAGE_DRIVER` in `.env.local`.

**Was zuerst knapp wird:** nicht der Speicherplatz, sondern die 5 GB Egress pro Monat im Supabase-Free-Tarif. Das ist der Auslöser für den Wechsel, nicht das GB-Limit.

---

### 2026-07-28 · Regionen-Engine mit zwölf Regionen

Nicht 195 Länder einzeln. Länder erben von ihrer Region, einzelne Länder können später überschreiben.

**Die eiserne Regel:** Ein Theme ändert Atmosphäre, niemals Struktur. Sonst wirken zwölf Themes wie zwölf Apps und jede neue Region kostet Wochen.

---

### 2026-07-28 · Elf Theme-Slots statt zehn

Nach dem Regionen-Test in Schritt 2 erweitert:

`texture-blend` aufgenommen — `multiply` in hell, `screen` in dunkel. Ohne ihn bräuchte jede Region zwei Texturdateien statt einer, also 24 statt 12.

`ornament-divider` und `ornament-corner` von Bild-URL auf **Maske** umgestellt, dazu `ornament-tint` als Farbe. Eine Region liefert zwei graustufige SVGs plus eine Farbe statt vier eingefärbter Dateien.

`canvas-tint` darf jetzt bis 8 % von neutral abweichen statt 4 %. Die alte Grenze verhinderte die Wärme, die Maghreb trägt.

---

### 2026-07-28 · Ein Inhaltsmodell, zwei Darstellungen

`blocks` trägt `position` (Reihenfolge) **und** Layout-Felder (x, y, w, h, rotation, z).

Der ruhige Modus liest nur die Reihenfolge, der Open Space nur das Layout. Dadurch geht beim Moduswechsel nie etwas verloren und es gibt keine doppelte Datenhaltung.

**Nie zwei getrennte Strukturen bauen**, auch wenn es kurzfristig einfacher aussieht.

---

### 2026-07-28 · Zugriffsrechte in Postgres, nicht in der Oberfläche

Row Level Security auf jeder Tabelle. Ein privater Eintrag ist privat, weil die Datenbank ihn nicht herausgibt.

**Jede neue Tabelle bekommt RLS**, ohne Ausnahme.

---

### 2026-07-28 · Screens vor Regionen

Nach dem bestandenen Regionen-Test wurde vorgeschlagen, die restlichen zehn Regionen zu bauen. Abgelehnt.

Begründung: Das Rezept ist bewiesen und dokumentiert, es läuft nicht weg. Aber es gibt erst einen von sechzehn Bildschirmen. Der Open Space ist der ungeprüfteste Teil des Produkts und muss früh getestet werden.

---

---

### 2026-07-28 · Leerer erster Tag: Variante B

Zwei Varianten gebaut und verglichen. A war das schönere Bild — Datum, Ort, ein Cursor, sonst nichts. Aber A ist stumm: Der Cursor sagt „hier kann getippt werden", er sagt nicht *was*. Wer zum ersten Mal vor der eigenen Reise sitzt, braucht genau diese Erlaubnis.

B bekommt eine einzige leise Frage plus den Foto-Weg. Der Foto-Weg ist kein Zusatz, sondern der ehrlichere Einstieg — abends fängt man mit einem Bild an, nicht mit einem Satz.

**Ab Tag zwei gilt A.** Dann ist die Stille Wohltat statt Hürde.

---

### 2026-07-28 · Open Space: Drehen und Skalieren sind Zwei-Hand-Gesten

Griffe sitzen am Objekt, und Objekte liegen oft oben am Rand. Der Daumen erreicht etwa zwei Drittel der Fläche.

Die Alternative — Griffe unten im Daumenbereich parken — wurde verworfen: Man zieht unten und schaut oben hin, das fühlt sich wie eine Fernbedienung an.

**Bewusst akzeptiert:** Drehen und Skalieren brauchen zwei Hände. Antippen, Verschieben und Hinzufügen bleiben einhändig.

**Dafür ist das Verschieben entkoppelt:** Langes Drücken (480 ms) hebt ein Element auf, es klebt am Finger, die Fläche darunter lässt sich weiterschieben, ein zweites Tippen legt es ab. Dasselbe Muster wie beim Verschieben zwischen iOS-Apps — Nutzer kennen es. Muss auf einem echten Gerät geprüft werden, bevor mehr darauf aufsetzt.

---

### 2026-07-28 · Die Open-Space-Fläche zoomt nicht

Zwei-Finger-Drehen am Objekt und Zwei-Finger-Zoomen der Fläche sind dieselbe Geste. Eine muss weichen.

Die Fläche scrollt nur. Sie ist bildschirmbreit und wächst nach unten, wenn Inhalt dazukommt. Der Schuhkarton hat eine feste Breite und einen wachsenden Boden.

---

### 2026-07-28 · Texturen als eingebettetes SVG statt Bilddateien

Alle zwölf Regionen erzeugen ihre Textur über `feTurbulence` als Daten-URI direkt in `regions.css`. Keine Binärdateien, kein zusätzlicher Netzabruf, beliebig skalierbar, und eine neue Region ist ein CSS-Block statt eines Design-Auftrags.

Ornamente ebenso — als Masken plus `ornament-tint`.

---

### 2026-07-28 · Fünf Schriften für zwölf Regionen

Literata für allen Fließtext, dazu vier Anzeigeschriften: Newsreader, Alegreya, Cormorant Garamond, Zen Old Mincho.

Nicht zwölf. Die Regel „höchstens zwei Familien" gilt pro Ansicht, und eine Ansicht zeigt immer nur eine Region. Vier decken den Charakterbereich ab, ohne den Bau aufzublähen.

Alle über `next/font/google` — zur Bauzeit heruntergeladen und von der eigenen Domain geliefert. Selbst gehostet, ohne manuelle woff2-Verwaltung.

---

### 2026-07-28 · Feed-Kaltstart: erst chronologisch, dann gewichtet

Unter 200 Beiträgen sortiert der Feed nach Zeit. Ein Algorithmus ohne Datenmenge ist schlechter als keiner — er zeigt dieselben fünf Beiträge immer wieder.

Die Schwelle steht als Konstante in `features/social/queries.ts`.

---

### 2026-07-28 · EXIF-Parser selbst geschrieben

Wir brauchen vier Felder: Aufnahmezeit, Breitengrad, Längengrad, Ausrichtung. Ein Minimalparser kostet etwa 3 KB, die üblichen Bibliotheken 90 KB.

Auf einem Handy mit schlechter Verbindung ist das ein spürbarer Unterschied — und die App wird genau dort benutzt.

---

### 2026-07-28 · Offline über Service Worker, nicht erst mit der nativen App

Ein Reisetagebuch wird genau dann benutzt, wenn kein Netz da ist — abends im Hostel, im Zug, auf einer Fähre. Eine App, die dann eine Fehlerseite zeigt, hat versagt.

Drei Strategien: Hülle und Schriften erst aus dem Speicher, Fotos erst aus dem Speicher, Seiten erst aus dem Netz mit Rückfall auf den Speicher.

**Schreibende Anfragen werden nicht abgefangen.** Ein stiller Fehlschlag beim Speichern wäre schlimmer als eine sichtbare Fehlermeldung.

Die Einschränkung bleibt: Safari darf den Speicher einer Web-App räumen, wenn das Gerät voll wird. Erst die native Hülle löst das endgültig.

---

### 2026-07-28 · Teilen ist eine Entscheidung pro Tag, nicht pro Konto

Drei Stufen: nur für dich, wer dir folgt, im Feed. Voreinstellung immer privat.

Ein Beitrag entsteht ausschließlich bei „im Feed" und verschwindet wieder, wenn zurückgenommen wird. Der Eintrag selbst bleibt unberührt.

Der Dialog nennt beim Namen, was passiert — kein „Öffentlich" als Schalter ohne Erklärung.

---

### 2026-07-28 · Die Karte ist keine Karte

Eine echte Kachelkarte bräuchte einen Kartendienst, kostet Ladezeit, funktioniert offline nicht und sieht in jeder App gleich aus.

Stattdessen zeigt „Deine Welt" die zwölf Regionen als Raster. Besuchte tragen ihr volles Theme mit Textur und Ornament, unbesuchte bleiben blass und ohne Material. Dieselbe Information, aber als etwas, das nur Voria kann.

**Kein Fortschrittsbalken, keine Prozentzahl, kein „12 von 195 freigeschaltet".** Das wäre Gamification.

---

### 2026-07-28 · Suche als deutscher Volltextindex in Postgres

`to_tsvector('german', …)` über Titel, Ort und Blocktext, als generierte Spalte mit GIN-Index. Damit findet „Regen" auch „regnete".

Die Blocktexte werden per Trigger in `entries.such_text` gespiegelt, damit die Suche eine Tabelle abfragt statt zwei zu verbinden.

Row Level Security greift auch hier — man findet nur, was man sehen darf.

---

### 2026-07-28 · Zweisprachigkeit über Cookie, nicht über Routensegment

Der übliche Weg wäre `/de/log` und `/en/log`. Das hätte jeden Pfad verdoppelt und jede Verlinkung im Code angefasst — bei achtzehn Seiten und rund siebzig Dateien ein großer Eingriff für wenig Gewinn.

Stattdessen ein Cookie, das Server und Browser gleichermaßen lesen. Wer die Seite zum ersten Mal mit englischem Browser öffnet, bekommt sie auf Englisch, ohne etwas einzustellen.

**Der Preis, offen benannt:** keine eigenen URLs je Sprache, also schwächere Auffindbarkeit über Suchmaschinen. Das trifft nur die Startseite — die App dahinter braucht keine Indexierung. Sobald es zählt, bekommt ausschließlich `/` eine zweite Adresse.

`en.ts` ist über den Typ an `de.ts` gebunden. Ein fehlender Schlüssel ist ein Übersetzungsfehler zur Bauzeit, nicht ein leerer Text zur Laufzeit.

---

### 2026-07-28 · Zwei Klassennamen-Kollisionen behoben

`RuhigerModus` und die Seitenleiste in `AppShell` benutzten beide `.seite` — denselben Namen wie die globale Seitenbreite in `seiten.css`. Beide Regeln trafen dasselbe Element, das Ergebnis hing an der Ladereihenfolge.

Umbenannt in `.blatt` und `.seitenleiste`. Dazu ein nackter `div`-Selektor in `Tagesansicht`, der jedes `div` der Komponente traf.

**Regel daraus:** Klassennamen in Komponenten nie so nennen wie eine globale Klasse. Vor einem neuen Namen in `seiten.css` nachsehen.

---

### 2026-07-28 · Textfeld wächst per JavaScript, nicht per `field-sizing`

`field-sizing: content` ist die saubere Lösung, aber noch nicht überall verfügbar. Die Zeilenzahl aus `\n` zu berechnen war falsch — sie zählt harte Umbrüche, nicht umgebrochene Zeilen.

Jetzt setzt ein `useLayoutEffect` die Höhe auf `scrollHeight`. Zwei Zeilen, überall verlässlich.

---

### 2026-07-28 · Bewegung als eigene Datei mit festen Rollen

Vorher gab es fast nur Zustandsübergänge und zwei Einzelfälle. `bewegung.css` bündelt jetzt die wiederverwendbaren Bewegungen: gestaffelter Listeneintritt, Dialoge von unten, Fotoeinblendung, Seitenwechsel, Moduswechsel.

Die Staffelung ist bei acht Elementen gedeckelt — danach wartet niemand mehr gern.

Jede Bewegung ist unter `prefers-reduced-motion` abgeschaltet.

---

### 2026-07-28 · Jahresrückblick statt Feed-Wachstum

Der virale Anstoß, der ohne Feed funktioniert: etwas, das man herzeigen will, entstanden aus dem, was ohnehin da ist. Spotify und Polarsteps machen damit ihr bestes Marketing, und es verlangt vom Nutzer keine Verhaltensänderung.

**Bewusst ohne Bewertung:** keine Bestenliste, kein „mehr als letztes Jahr", kein Vergleich mit anderen. Nur, was war. Sonst wäre es Gamification.

Jeder Abschnitt trägt das Theme einer Region, in der man war — die Seite blättert sich durch das eigene Jahr.

---

### 2026-07-28 · Drei Schriftrollen: Bedienung getrennt vom Inhalt

Das war der Grund, warum die App altmodisch statt clean wirkte: **Serifen auch in der Navigation, in Knöpfen, in Beschriftungen.** Literata ist eine schöne Leseschrift, aber in einer Seitenleiste liest sie sich wie eine Buchseite, nicht wie eine Oberfläche.

Neu:

| Rolle | Schrift | Wo |
|---|---|---|
| `--font-ui` | Inter | Navigation, Knöpfe, Felder, Etiketten, Metazeilen |
| `--font-text` | Literata | Tagebuchtext. In jeder Region dieselbe |
| `--font-display` | wechselnd | Titel und Überschriften. Regionen-Slot |

**Die alte Regel „höchstens zwei Familien" gilt weiter — aber für den Inhalt.** Eine Textschrift, eine Anzeigeschrift je Region. Die Bedienschrift steht daneben und ist nie regionsabhängig.

Die Grundschrift des `<body>` ist jetzt die Bedienschrift. Inhalt setzt sie ausdrücklich zurück. So ist der Standardfall richtig und die Ausnahme sichtbar.

---

### 2026-07-28 · Maßstab der Bedienoberfläche verkleinert

Alles war auf Inhaltsmaß gebaut: Knöpfe 44 px, Navigationszeilen 44 px, Beschriftungen 16 px. Das wirkt schwer.

Neue Maße, am Vorbild von Linear und Supabase: Navigationszeilen 34 px, Knöpfe 34/40 px, Bedientexte 12–14 px, Metazeilen 11 px in Versalien, Radien 7 px statt 8.

**Ausnahme bleibt der Daumenbereich am Handy:** Berührungsziele bleiben mindestens 44 px, auch wenn sie kleiner aussehen. Sichtbare Größe und Trefferfläche sind zwei verschiedene Dinge.

---

### 2026-07-28 · Seitenleiste neu gebaut

Kompakte Zeilen, Gruppen mit stiller Beschriftung, Hauptaktion oben, Nutzer-Chip unten mit Kürzel und Zahnrad. Die Wortmarke bleibt Serife — sie ist die Marke, nicht Bedienung.

Am Handy bekommt die untere Leiste jetzt eine leicht durchscheinende Fläche mit Weichzeichner, damit Inhalt darunter sichtbar bleibt.

---

### 2026-07-30 · Die Modi heißen „Seite" und „Fläche", nicht „Ruhig" und „Frei"

Der Umschalter zeigt den **aktuellen** Modus, las sich aber wie ein
Befehl. Englisch war „Quiet" — das klingt nach „sei still", nicht nach
„du bist auf der ruhigen Seite".

Neu: **Seite / Fläche**, englisch **Page / Canvas**. Beide beschreiben,
was man sieht, nicht wie man sich fühlen soll.

Intern heißen die Werte weiter `quiet` und `free` — das steht in der
Datenbank als Enum `entry_mode` und ist nicht die Nutzersprache.

---

### 2026-07-30 · Foto und Sichtbarkeit gehören dem Tag, nicht einem Modus

Beides stand in `RuhigerModus.tsx`. Auf der freien Fläche ließ sich die
Sichtbarkeit deshalb gar nicht ändern, und der Foto-Knopf hing zusätzlich
an `istLeer` — er verschwand nach dem ersten geschriebenen Satz.

Jetzt in `TagLeiste.tsx`, gerendert von der Tagesansicht außerhalb des
Moduswechsels.

**Die Regel dahinter:** Was eine Eigenschaft des Tages ist, gehört auf
die Tagesebene. Sonst laufen die beiden Darstellungen auseinander.

---

### 2026-07-30 · Preismodell: Frei mit Werbung, Pro ohne — Pro noch abgeschaltet

Das Gerüst steht in `src/lib/plan.ts`. `istPro()` gibt heute immer
`false` zurück; es gibt keine Bezahlung, keine Tabelle, keinen Webhook.

**Warum trotzdem jetzt:** Sobald an fünf Stellen `if (irgendwas)` steht,
um Werbung oder Grenzen zu schalten, wird der Umbau teuer. Eine
Funktion umzustellen ist billig.

Werbung ausschließlich im Feed, niemals im Log — das war schon vorher
gesetzt und bleibt.

---

### 2026-07-30 · Werbedichte: jede sechste Karte, mit vier Sperren

Instagram zeigt etwa jede vierte Karte als Anzeige, TikTok jede fünfte.
Voria nimmt jede sechste, plus vier Sperren:

* nie die erste Karte — die Antwort auf „was haben andere geteilt" darf
  keine Reklame sein
* nie die letzte — der Feed endet nicht mit Werbung
* nie zwei hintereinander
* gar keine, solange der Feed kürzer als sechs Beiträge ist

Anzeigen tragen **kein** Regionen-Theme, keinen Avatar, keinen
Stimmen-Knopf. Eine Anzeige, die sich wie ein Beitrag einfärbt, gibt
sich als einer aus.

---

### 2026-07-30 · Kein Scroll-Snap im Feed, stattdessen Doppelklick

Snap braucht gleich hohe Karten. Voria hat Beiträge mit Foto, ohne
Foto, mit zwei Zeilen und mit langem Absatz. Auf variablen Höhen lässt
Snap kurze Karten mit Leerraum stehen und schneidet lange ab.

Wichtiger noch: Snap nimmt dem Leser die Kontrolle. Überfliegen geht
dann nicht mehr. Das ist die Mechanik von TikTok, auf Verweildauer
gebaut — bei einem Feed, der Nebenprodukt eines Tagebuchs ist, ein
Widerspruch.

**Stattdessen:** Doppelklick ins Leere springt weich zum nächsten
Beitrag. Wer springen will, fordert es an. Nur auf die Fläche, nie auf
Text — ein Doppelklick auf Text markiert dort ein Wort.

---

### 2026-07-30 · Geteilte Beiträge bekommen eine eigene öffentliche Route

`/feed/[id]` steht in `GESCHUETZT` der Middleware. Ein dorthin geteilter
Link hätte Fremde auf die Anmeldeseite geschickt — Teilen, das nur für
Angemeldete funktioniert, ist kein Teilen.

Neu: `/b/[beitragId]`, außerhalb von `(app)`, ohne Seitenleiste, mit
Open-Graph-Karte für WhatsApp, Signal und Co.

**Sicher ist die Route nicht durch die Seite, sondern durch die
Datenbank.** `entries_read` gibt fremde Tage nur bei
`visibility = 'public'` heraus.

---

### 2026-07-30 · Kommentare: verschachtelt, nach Stimmen, bearbeitbar statt löschbar

Vier Festlegungen:

| Frage | Entscheidung |
|---|---|
| **Verschachtelung** | Antworten auf Antworten, aber **ausklappbar**. Ein Kommentar zeigt seine Antworten erst auf Anforderung |
| **Wo** | Im Fuß der Beitragskarte, neben Zustimmen. Der Fuß bekommt vier Knöpfe: **Zustimmen · Teilen · Repost · Kommentare** |
| **Sortierung** | Nach Stimmen |
| **Löschen** | Gar nicht. Nur **eigene bearbeiten**, und der Kommentar trägt danach sichtbar „bearbeitet" |

**Zur Sortierung, offen benannt:** Nach Stimmen widerspricht der
Feed-Entscheidung vom 28.07., die unter 200 Beiträgen bewusst
chronologisch sortiert. Bei Kommentaren ist das vertretbar — es sind
wenige pro Beitrag, und der beste steht oben statt der schnellste.
Sollte sich zeigen, dass die ersten Kommentare dauerhaft gewinnen, ist
eine Schwelle wie beim Feed der Ausweg.

**Zum Nicht-Löschen:** Das ist eine bewusste Härte. Wer etwas schreibt,
kann es korrigieren, aber nicht spurlos zurücknehmen — eine Antwort
darunter würde sonst ins Leere zeigen. Für Missbrauch braucht es später
Melden und Verbergen; das ersetzt Löschen nicht, sondern ist eine
andere Funktion.

**Eine Falle, vorab notiert:** `comment_votes` erzeugt zwischen
`comments` und `profiles` genau dieselbe Doppeldeutigkeit, die am
29.07. den Feed lahmgelegt hat. Der Fremdschlüssel muss von Anfang an
benannt werden: `profiles!comments_user_id_fkey(…)`.

---

### 2026-07-30 · Beiträge bleiben an Tage gebunden

Ein direkter Beitragseditor mit Kategoriewahl wurde vorgeschlagen und
**vorerst zurückgestellt**, nicht abgelehnt.

Heute gilt `posts.entry_id not null unique` — ein Beitrag *ist* ein
geteilter Tag. Daraus zieht Voria seinen Charakter: der Feed ist
Nebenprodukt des Tagebuchs, keine eigene Bühne. Ein eigener Editor
kehrt das um; danach gibt es zwei Sorten Inhalt und bei jedem Beitrag
die Frage, warum er nicht im Log steht.

**Empfohlener Weg, wenn es kommt:** Der Editor sieht aus wie Instagram,
legt innen aber still einen Tag mit heutigem Datum an. Das Modell
bleibt heil, die Bedienung fühlt sich richtig an. Kategorien gehen
unabhängig davon über `posts.category`.

---

### 2026-07-30 · Der Feed soll Geld verdienen — „optional" heißt nicht „nebensächlich"

Richtigstellung einer Fehldeutung, die sich in mehrere Dokumente
geschlichen hatte. Aus „Voria funktioniert vollständig ohne den Feed"
war stillschweigend „der Feed ist Beiwerk und wird zurückgestellt"
geworden. Das ist falsch.

**Beides gilt gleichzeitig:**

* Wer den Feed nie öffnet, hat ein vollständiges Tagebuch. Kein
  Nachfragen, kein halbleeres Profil, keine Funktion, die fehlt.
* Der Feed ist trotzdem die Stelle, an der Voria Geld verdient — über
  Werbung und über das, was Leute zum Wiederkommen bringt.

Daraus folgt für die Reihenfolge: Kommentare, Reposts und alles, was
den Feed lebendig macht, sind **keine Ablenkung vom Kern**. Man muss
sie nicht nutzen — aber sie müssen gut sein.

Unverändert bleibt die eiserne Regel: **niemals Werbung im Log.**

---

### 2026-07-30 · Rote Punkte sind erlaubt, aber abschaltbar — und „Stiller Modus" schaltet alles auf einmal

Die frühere Regel „keine roten Punkte, keine Gamification" war zu weit
gefasst. Ein Hinweis, dass jemand geantwortet hat, ist keine
Gamification — eine Serie, die reißt, wäre eine.

**Neue Regel:** Zähler und Punkte für *Ereignisse* (Antwort, neue
Folger, Upload von jemandem, dem man folgt) sind erlaubt. Zähler für
*Verhalten* (Serien, Abzeichen, Fortschritt, „mehr als letztes Jahr")
bleiben verboten.

Alles davon ist in den Einstellungen einzeln abschaltbar. Dazu ein
**Stiller Modus** als ein Schalter, der die ruhige Nutzung in einem
Zug herstellt: keine Hinweise, kein Feed-Anstoß, nichts Soziales im
Blick. Wird er ausgeschaltet, steht alles wieder so, wie es vorher
war — der Schalter überschreibt die Einzeleinstellungen, er löscht sie
nicht. Das ist der Unterschied zwischen einem Modus und einem
Rundumschlag.

---

### 2026-07-30 · Der Feed bekommt zwei Reiter: „Für dich" und „Folge ich"

Aus der Idee eines eigenen Bereichs „Mein Voria" wurden zwei Reiter
über dem Feed, nach dem Muster, das `/suche` schon benutzt.

Gründe: Ein eigener Hauptbereich für „Leute, denen ich folge" wäre ein
fünfter Punkt in einer Navigation, die bewusst vier hat. Und ein
verstecktes Menü — etwa drei Punkte im Feed — findet niemand.

„Für dich" ist der bestehende Feed samt Kaltstart-Regel. „Folge ich"
zeigt ausschließlich Beiträge von Gefolgten, chronologisch. Beides
braucht keine neue Tabelle: `follows` liegt vor.

---

### 2026-07-30 · Karte v2 — vorgemerkt, nicht begonnen

Die Entscheidung vom 28.07. („Die Karte ist keine Karte") bleibt für
Version 1 bestehen. Der Wunsch nach einer echten zweiten Fassung ist
festgehalten und wird zu gegebener Zeit eigens entschieden.

Hängt an der Normalisierung der Orte — solange `place_name` Freitext
ist, gibt es nichts, was sich sinnvoll verorten ließe.

---

### 2026-07-30 · Pro: was drin ist, und die Regel darüber

**Die Regel steht über allem: Pro begrenzt, was man ANLEGT — niemals,
was man LIEST.** Läuft ein Abo aus, bleibt jeder Tag lesbar und
exportierbar. Ein Tagebuch, das sich selbst einsperrt, zerstört das
Versprechen, auf dem Voria steht. Diese Regel gilt vor jedem
Merkmal und vor jeder Zahl.

Enthalten, in dieser Reihenfolge:

1. **Keine Werbung** — der Einstieg
2. **PDF-Satz des Jahres**, später das gedruckte Fotobuch
3. **Originale sichern** — heute liegt nur die Anzeigefassung in der
   Cloud; volle Auflösung ist ein echter Kostenblock und deshalb ein
   ehrliches Pro-Merkmal
4. **Unbegrenzte Fotos** je Tag

**Ausdrücklich nicht hinter Pro:** gemeinsame Reisen (bestraft den
nicht zahlenden Mitreisenden), der Jahresrückblick (er ist das
Marketing und muss teilbar bleiben), und alles am Schreiben selbst.

### 2026-07-30 · Abwicklung über einen Merchant of Record, nicht über Stripe direkt

Paddle oder Lemon Squeezy statt Stripe. Bei Stripe verkauft der
Betreiber selbst und schuldet in jedem EU-Land die dortige
Umsatzsteuer. Ein Merchant of Record verkauft an seiner Stelle und
zahlt aus. Das kostet ein paar Prozent und spart die gesamte
Steuerabwicklung — bei den erwarteten Beträgen der Unterschied
zwischen „läuft nebenbei" und „lohnt sich nicht".

Technisch klein, weil die Naht steht: `istPro()` in `src/lib/plan.ts`
gibt heute immer `false`. Es braucht eine Tabelle `subscriptions` und
einen Webhook. Kein Code außerhalb von `plan.ts` muss wissen, dass es
Geld gibt.

**Sommerpreise ja, Countdown nein.** Rabattcodes kann der Anbieter.
„Die App drängt nicht" gilt beim Verkaufen genauso — sonst ist es
keine Regel.

**Offen und vor dem App-Bau zu entscheiden:** Apple und Google
verlangen für digitale Abos ihre eigene Kaufabwicklung, 15–30 %. Wer im
Web kauft und sich in der App nur anmeldet, ist der übliche Weg. Das
muss geklärt sein, bevor die App gebaut wird, nicht danach.

### 2026-07-30 · Pro-Aussehen: Materialschicht plus eigenes Theme, abschaltbar

Zwei Ebenen, und beide lassen die Struktur unberührt:

1. **Materialschicht** — dieselben elf Slots, dasselbe Ornament,
   dieselben Abstände, nur edler ausgeführt: Goldfolie statt Linie am
   `.ornament-divider`, feineres Papier, Prägung am Titel. Sie nimmt
   die Farbe der jeweiligen Region auf, statt sie zu ersetzen, und
   funktioniert dadurch in allen zwölf Regionen von selbst.
2. **Ein dreizehntes Theme**, nur für Pro wählbar. Es ist ein Theme wie
   die anderen zwölf und hält sich an dieselben elf Slots.

**Beides ist abschaltbar.** Wer Pro hat und es schlicht mag, schaltet
es aus. Das ist die Voraussetzung dafür, dass die Materialschicht
überhaupt vertretbar ist: Sie darf niemandem aufgezwungen werden, der
für etwas anderes bezahlt hat.

Die Regel „Ein Theme ändert Atmosphäre, niemals Struktur" bleibt
unangetastet. Gold in Navigation, Knöpfen oder Rändern wurde
ausdrücklich verworfen — Bedienelemente bleiben global gleich.

**Nachtrag 31.07., nach dem ersten Entwurf von Claude Design:** Der
Entwurf schlug vier Designs statt eines vor (Basalt & Messing, Messing
& Elfenbein, Schiefer & Ader mit vier Aderfarben, Nordlicht &
Polarnacht). Entschieden: **zuerst nur Nordlicht & Polarnacht bauen**,
die anderen drei folgen später als Nachschub. PRO soll seinen Wert
über die Materialschicht und den PDF-Satz beweisen, nicht über die
Anzahl der Designs — acht Theme-Definitionen zu pflegen, bevor jemand
bezahlt hat, ist Lagerbestand auf Verdacht.

Ebenfalls entschieden: Das im Entwurf vorgeschlagene bewegte Nordlicht
(dauerhaft wandernder Hintergrund) bleibt **standardmäßig aus** und
wird ein eigener Schalter (`pro_bewegung`). Grund: Vorias
Bewegungsregeln kennen nur an eine Handlung gebundene Übergänge (Log
400 ms, Feed 200 ms); eine Kategorie „läuft immer, ohne Anlass" gibt es
bislang nicht, und ein wanderndes Licht hinter dem Text, während
jemand über etwas Schweres schreibt, passt nicht zu „die App drängt
nicht". Wer es will, schaltet es ein — sehr langsam, 48 Sekunden je
Durchlauf, und aus unter `prefers-reduced-motion`.

**Umgesetzt:** Migration `0010_pro_design.sql` (`pro_design`,
`pro_material`, `pro_bewegung` an `profiles`), Material-Tokens und die
Nordlicht-Definition in `src/styles/pro-designs.css`, gesetzt am
`<html>` in `src/app/layout.tsx` über `proAussehen()` in
`src/lib/plan.ts`. Die Wahl in den Einstellungen zeigt ein echtes
Blatt statt einer Merkmalsliste — siehe `ProWahl.tsx`.

**Technische Randbedingung, die die Umsetzung geprägt hat:**
`src/styles/tokens.css` ist auf diesem Rechner schreibgeschützt. Die
sieben Materialwerte (`--material-foil` und weitere) stehen deshalb in
`pro-designs.css` statt in Schicht 2 von `tokens.css` — inhaltlich
richtig verortet wäre Schicht 2, aber die Regel „kein Hex-Wert im
Komponentencode" ist damit trotzdem eingehalten, weil ein Stylesheet
kein Komponentencode ist. Wird die Sperre einmal aufgehoben, können die
Werte nach `tokens.css` wandern.

---

### 2026-07-30 · Pro-Vorschlag: zweimal die Woche, als Streifen, nie modal

Der Vorschlag, alle ein bis drei Stunden ein Pop-up zu zeigen, wurde
verworfen. Grund war nicht nur die Haltung („Die App drängt nicht"),
sondern die Nutzung: Ein Reisetagebuch wird abends für zehn Minuten
geöffnet. Ein Zeitgeber von Stunden bedeutet, dass praktisch jedes
Öffnen mit einem Verkaufsgespräch beginnt — auch das, bei dem jemand
über einen gestorbenen Großvater schreiben wollte.

**Festgelegt: höchstens zweimal je Woche.** Dazu:

* Ein **Streifen zum Wegwischen**, kein modaler Dialog. Modale sind
  für Entscheidungen, nicht für Angebote.
* **Nie**, während jemand schreibt.
* Nach dem **dritten Wegwischen drei Monate Ruhe.** Wer dreimal nein
  sagt, meint nein.
* Unabhängig davon und ohne Zeitgeber: der Vorschlag **im Moment des
  Wunsches** (beim Exportieren, an der Fotogrenze) und der dauerhafte
  Eintrag „Pro werden" im Profil.

Das Intervall liegt als **eine Zahl an einer Stelle**, damit es sich
nach echten Zahlen ändern lässt statt nach Bauchgefühl.

Anlass war ein Fund beim Wettbewerb: Travel Diaries zeigt sein
Mitgliedschafts-Pop-up ungefragt auf dem Dashboard. Die erste Reaktion
darauf war „schwach", nicht „interessant".

### 2026-07-30 · Es heißt „smart", nicht „KI"

Nach außen wird nichts als KI vermarktet. Nicht aus Scheu, sondern
weil „KI-Tagebuch" genau die Erwartung weckt, die Voria nicht erfüllen
will: dass die App für einen schreibt.

**Was es geben soll:** automatische Verschlagwortung von Fotos, eine
bessere Anstoßfrage aus dem, was der Tag schon hergibt, und später
semantische Suche („Tage, an denen ich erschöpft war") über
Einbettungen. Das kann kein Volltextindex, und es ist der einzige
Punkt, an dem ein Modell etwas beiträgt, was die vorhandene Suche
prinzipiell nicht kann.

**Was es nicht geben soll: den Tagestext aus Stichworten schreiben
lassen.** Wenn jemand in zehn Jahren nachliest, wie sich sein Leben
angefühlt hat, und der Text stammt von einem Modell, liest er eine
Lüge über sein eigenes Leben. Das ist der eine Ort, an dem Voria nicht
schummeln darf. Ein Modell darf fragen, nicht antworten.

### 2026-07-30 · Vom Wettbewerb übernommen: die Buchansicht

Travel Diaries zeigt das Tagebuch im Editor als aufgeschlagenes Buch
mit umblätterbaren Seiten. Das wird übernommen, weil es das Produkt
als **Gegenstand** zeigt statt als Liste — und weil es bei Voria drei
Dinge auf einmal löst: die Pro-Vorschau, die PDF-Vorschau und später
die Fotobuch-Vorschau sind dasselbe Bauteil.

Ebenfalls übernommen: ein **Titelbild je Reise**. `trips.cover_photo_id`
steht seit `0001_init.sql` im Schema und wird bisher nirgends benutzt.

**Nicht übernommen:** Kapitel (der Tag ist die bessere Einheit),
Stilauswahl von Hand (die zwölf Regionen machen das automatisch), und
ausgegraute Pro-Knöpfe in der Werkzeugleiste — die zeigen Abwesenheit,
und Voria verkauft Anwesenheit.

---

### 2026-07-30 · Voria startet im Feed, nicht im Log

Wer die App öffnet, soll etwas vorfinden statt ein leeres Blatt. Der
Log ist einen Griff weit weg, und wer lieber dort startet, stellt es
in den Einstellungen um.

Das ist kein Widerspruch zu „der Log ist der Kern". Der Kern ist, wo
die Arbeit passiert — der Einstieg ist, wo man ankommt. Ein Tagebuch,
das einen beim Öffnen anschweigt, wird seltener geöffnet.

**Der Stille Modus überschreibt das auf den Log** — nach derselben
Regel wie bei den Hinweisen: Er schreibt die Wahl nicht um. Wer ihn
ausschaltet, startet wieder dort, wo er vorher gestartet ist.

Entschieden wird in `middleware.ts`, und die Abfrage läuft nur, wenn
tatsächlich umgeleitet wird — nicht bei jedem Aufruf.

### 2026-07-30 · Die Feed-Reiter ducken sich beim Lesen weg

Die Leiste klebt oben, verschwindet aber, sobald man nach unten liest,
und kommt bei einem Stück Hochscrollen zurück. Beim Lesen braucht
niemand einen Umschalter; ein fester Balken kostet dauerhaft Platz,
und ein Balken, der bei jedem Ruckeln auftaucht, ist schlimmer als
gar keiner.

Deshalb zwei Feinheiten: eine Schwelle von sechs Pixeln, damit nichts
flackert, und ganz oben ist die Leiste immer da.

### 2026-07-30 · Rückmeldungen: eine Tabelle ohne Leserecht

Kein Ticketsystem, kein Fremddienst, keine E-Mail — eine Zeile in
`feedback`, gelesen wird im Supabase-Dashboard. Das trägt die nächsten
tausend Nutzer und lässt sich später ersetzen, ohne dass etwas daran
hängt.

**Absichtlich keine `select`-Regel.** Rückmeldungen enthalten
regelmäßig Dinge, die andere nichts angehen: Fehlerbeschreibungen mit
Namen darin, Ärger über jemanden, manchmal eine Adresse. Ohne
`select`-Regel gibt PostgREST nichts heraus, an niemanden. Die
Migration bricht ab, wenn jemand später doch eine anlegt.

Das Formular hat als eine der wenigen Stellen in Voria einen
Absendeknopf. Der Rest speichert von selbst, weil dort das eigene
Tagebuch entsteht — eine Nachricht an jemand anderen darf nicht
verschickt werden, solange man noch tippt.

---

### 2026-07-31 · Scroll-Snap doch — aber `proximity`, nicht `mandatory`

Teilweise Rücknahme der Entscheidung vom 30.07. („Kein Scroll-Snap im
Feed"). Der Anlass: Ein kräftiger Wisch soll höchstens eine Karte
überspringen, nicht zwanzig.

Momentum-Scrolling lässt sich mit JavaScript nicht bremsen — die
Trägheit läuft im Compositor, und jeder Versuch dagegenzuhalten ruckelt.
Das einzige Mittel dafür ist `scroll-snap-stop: always`, und das setzt
Snap voraus.

**Die alte Begründung bleibt richtig, trifft aber nur `mandatory`:**
„Snap zwingt jeden Bildlauf in ein Raster. Das setzt gleich hohe Karten
voraus." Bei `proximity` wird nur gefangen, wer ohnehin fast auf einer
Karte steht — Überfliegen und Stehenbleiben zwischen zwei Karten
bleiben möglich. `scroll-snap-stop: always` wirkt trotzdem.

Gilt ausschließlich auf der Feed-Seite, über eine Klasse am `<html>`.
Wenn es sich im Browser falsch anfühlt: die Regel `.feed-scrollen` in
`seiten.css` löschen, dann ist der alte Zustand zurück.

### 2026-07-31 · Gelesenes rutscht nach hinten, es verschwindet nicht

`post_views` merkt sich, was jemand gesehen hat. Ungelesenes steht
danach zuerst.

**Nicht ausgeblendet**, obwohl das naheliegt: Voria hat zwei Beiträge
im Bestand. Verschwände Gelesenes, wäre der Feed nach dem ersten
Durchgang leer — und ein leerer Feed ist genau das, was der Kaltstart
nicht verträgt.

**Der Vermerk ändert die Reihenfolge nicht sofort.** Kein
`revalidatePath` beim Merken: sonst rutschen die Karten unter dem
Finger weg, während man sie liest. Er wirkt beim nächsten Öffnen, und
das ist der ganze Zweck.

Als Nebenwirkung ist der Feed damit auf eine Datenbankfunktion
umgestellt (`feed_laden`), weil „Ungelesenes zuerst" über eine
Verknüpfung sortiert und PostgREST nur Spalten der Haupttabelle
ordnen kann. Dieselbe Lage wie bei `similarity()` in Migration 0007.

### 2026-07-31 · Dritter Reiter „Entdecken", nur am Rechner

Beiträge aus Regionen, in denen der Leser noch nicht war. Nutzt das
Einzige, was kein Wettbewerber hat — die zwölf Regionen —, hilft gegen
den Kaltstart, und ist der einzige Ort in Voria, an dem eine Auswahl
getroffen wird, ohne aufdringlich zu sein.

Am Handy bleiben es zwei Reiter: drei nebeneinander wären dort je knapp
über 100 px breit, treffbar, aber gedrängt. Über die Adresse ist
„Entdecken" trotzdem erreichbar, und wer dort steht, sieht den Reiter
auch am Handy — sonst käme man aus einem unsichtbaren Reiter nicht
heraus.

Gefiltert wird in TypeScript, nicht in SQL: Welche Region eine Reise
trägt, rechnet `regionForTrip` aus ihren Ländern, und diese Zuordnung
steht in `src/themes/regions.ts`. Bei größerem Bestand gehört sie als
abgeleitete Spalte nach Postgres.

---

### 2026-07-31 · Die Marke liegt außerhalb des Theme-Systems

Voria hat zwölf Regionen, die Farbe und Anzeigeschrift wechseln. Die
Marke darf davon nichts mitmachen — sonst ist sie keine.

Der Anlass war ein Fehler, der lange unbemerkt dastand: Die Wortmarke
las `--font-display`, einen Regionen-Slot. Mit einem aktiven
PRO-Design wechselte „Voria" von Newsreader zu Cormorant Garamond, je
nach Einstellung des Nutzers. Dasselbe stand an drei Stellen —
Seitenleiste, Startseite und Anmeldung.

**Vier eigene Werte in `globals.css`, die kein Theme anfassen darf:**

| | |
|---|---|
| `--marke-primaer` | `#2F6060`. Der feste Wert, so auch im Zeichen und in der Manifestdatei. Ändert sich nie |
| `--marke-sichtbar` | Derselbe Ton, im Dunkeln aufgehellt. **Nur** hell/dunkel darf ihn ändern |
| `--marke-signal` | `#C8402A`, der rote Punkt aus dem Zeichen — die Ortsmarke auf der Buchseite |
| `--marke-schrift` | Newsreader, fest |

Der Punkt taucht jetzt als kleine Ortsmarke hinter dem Wort auf. Er ist
das einzige warme Zeichen im ganzen System und bleibt deshalb sparsam.

**Mitgefunden und behoben:** Das PRO-Design setzte seine elf Slots auf
`:root` und färbte damit Navigation und Knöpfe mit um. Es wirkt jetzt
nur noch auf Inhaltsflächen. Damit bleibt die Markenfarbe in der
Bedienoberfläche sichtbar, egal welches Theme läuft — und genau das
war der Wunsch nach „einer klaren Farbe".

**`npm run pruefe:marke`** bewacht beides. Das Skript hat beim ersten
Lauf sofort eine dritte Stelle gefunden, die ich übersehen hatte.

**Keine eigene Hausschrift.** Sie kostet vier- bis fünfstellig oder
Monate, und der Ertrag steckt zu 90 % in einem einzigen Wort. Der Weg
ist stattdessen eine gezeichnete Wortmarke als SVG — einmal gemacht,
für immer stabil. Noch offen.

---

### 2026-07-31 · Kein künstlich unendlicher Feed

Vorgeschlagen wurde, am Ende des Feeds wieder von vorne zu beginnen,
damit er unendlich wirkt. Verworfen.

**Der praktische Grund:** Dieselben zwanzig Beiträge ein zweites Mal
erkennt jeder Nutzer binnen einer Minute. Es fühlt sich dann nicht
nach viel Inhalt an, sondern nach kaputt. Instagram wirkt unendlich,
weil es unendlich *ist* — nicht, weil es recycelt.

**Der zweite Grund kam aus dem Vorschlag selbst:** „Später sollte es
ja kein Ende mehr geben." Genau. Das Ende verschwindet von selbst,
sobald genug Leute schreiben. Es heute zu fälschen löst ein Problem,
das sich ohnehin auflöst, und hinterlässt Code, den später niemand
mehr anfassen mag.

**Was der Feed ohnehin schon tut:** `feed_laden` sortiert Ungelesenes
nur nach vorne, es blendet Gelesenes nicht aus. Man scrollt also durch
alles Neue und danach weiter durch das Bekannte. Ein Ende gibt es erst,
wenn wirklich jeder Beitrag durch ist.

**Gebaut wurde stattdessen ein Satz.** Vorher hörte die Liste einfach
auf — kein Wort, nichts, was aussieht wie ein Ladefehler. Jetzt steht
dort „Das war alles für heute." Erst ab der zweiten Ladung: Bei drei
Beiträgen wäre der Satz eine Bemerkung über die Leere.

---

### 2026-07-31 · Abos: der Webhook schreibt, sonst niemand

`subscriptions` hat **keine** insert-, update- oder delete-Regel. Der
Zahlungsanbieter meldet sich über `/api/paddle`, und diese Route
schreibt mit dem service_role-Schlüssel.

Gäbe es eine Schreibregel für `authenticated`, könnte sich jeder
Nutzer selbst ein Abo eintragen. Bei Geld ist „wer darf schreiben" die
einzige Frage, die zählt — die Migration prüft am Ende sogar
ausdrücklich, dass keine Schreibregel existiert, und bricht sonst ab.

**Bezahlt ist bezahlt, auch nach der Kündigung.** `laeuft_bis` steht
neben dem Status: Wer heute kündigt, behält PRO bis zum Ende der
bezahlten Periode. Ein gekündigtes Abo sofort abzuschalten wäre
Diebstahl. `past_due` zählt ebenfalls als bezahlt — der Anbieter
versucht die Abbuchung noch tagelang, und jemandem wegen einer
abgelaufenen Karte sofort das Tagebuch umzufärben wäre die falsche
Reaktion auf ein Problem, das sich meist von selbst löst.

**Im Zweifel frei.** Fällt die Abfrage aus, gilt „frei": Dann sieht
jemand Werbung und verliert sein Material — ärgerlich, aber harmlos.
Andersherum bekäme bei jedem Aussetzer die ganze Welt PRO geschenkt.

**Die Signaturprüfung ist die ganze Sicherheit dieser Route.** Sie
steht vor jedem Blick in den Inhalt, vergleicht zeitkonstant und
lehnt Meldungen über fünf Minuten Alter ab. Geprüft habe ich sie
gegen acht Fälle, darunter nachträglich geänderter Rumpf, falsches
Geheimnis, fehlende Signatur und Wiedereinspielung — alle abgelehnt.
**Nicht geprüft: der Aufruf von Paddle selbst.** Das geht erst mit
einem echten Konto.

---

### 2026-07-31 · Voria wird Nebenprodukt, nicht Hauptprodukt

Richtungsänderung, und die größte in diesem Dokument. Der Betreiber
tritt künftig als Indie-Entwickler auf und bringt **Olympos** als
Hauptprodukt heraus. Nexus Node, Nexus Arcade und Voria laufen
nebenher — Voria ausdrücklich als **passives Einkommen mit wenig
Werbung**.

**Was das für Voria bedeutet, nüchtern:**

Der Engpass war nie Geld, sondern der Kaltstart — es braucht grob
tausend aktive Schreiber, bevor der soziale Teil sich selbst trägt.
Diese tausend kommen bei einem Nebenprodukt **nicht durch Marketing**.
Damit ändert sich, was sich zu bauen lohnt:

| | |
|---|---|
| **Wichtiger** | Alles, was ohne Zutun wirkt: geteilte Beiträge als öffentliche Seiten, der Jahresrückblick als etwas, das man herzeigt, Suchmaschinen |
| **Unverändert** | Der Log. Er ist auch mit fünf Nutzern ein gutes Produkt |
| **Weniger dringend** | Alles, was Masse voraussetzt: Werbenetze, Feed-Gewichtung, Repost, Erwähnungen |

**Die praktische Folge:** `/b/<id>` ist nicht mehr nur eine
Visitenkarte, sondern der einzige Weg, auf dem Voria neue Leute
erreicht. Deshalb steht dort seit heute eine Einladung — siehe unten.

Nicht geändert wird die Preisstruktur: PRO bleibt, Werbung bleibt im
Feed, und die eiserne Regel „niemals Werbung im Log" erst recht.

### 2026-07-31 · Die Einladung hinter dem geteilten Beitrag

Auf `/b/<id>` erscheint eine Einladung zum Anlegen eines Kontos —
aber erst, wenn jemand über den Beitrag hinaus liest.

**Das ist kein Widerspruch zu „die App drängt nicht".** Die Regel gilt
der ANWENDUNG: Wer drin ist und schreibt, wird nicht angestupst.
`/b/<id>` ist aber das Schaufenster, nicht die Anwendung.

Drei Grenzen, damit es das bleibt:

1. **Der Beitrag bleibt ganz lesbar.** Nichts wird abgeschnitten oder
   hinter Nebel gelegt. Ein geteilter Link, der zur Falle wird, wird
   nicht mehr geteilt — und dann ist der ganze Weg tot.
2. **Erst nach dem Ende.** Nicht nach drei Sekunden, nicht beim
   Verlassen der Seite. Nur wenn jemand tatsächlich weiterliest.
3. **Einmal, und wegklickbar.** „Nur diesen Tag lesen" ist ein
   vollwertiger Weg, kein Kleingedrucktes.

### 2026-07-31 · Keine Bildschirmfotos auf der Startseite

Die Startseite zeigt drei Ansichten der App — als **echte
Oberfläche**, mit denselben Klassen und Tokens wie die Anwendung.

Ein Bildschirmfoto veraltet an dem Tag, an dem sich ein Abstand
ändert, und niemand merkt es: Eine PNG-Datei baut nicht mit. Bei zwölf
Regionen in hell und dunkel wären es vierundzwanzig Bilder, die alle
gleichzeitig veralten.

Ehrlich bleibt es dadurch, dass darunter steht, was man sieht:
Beispieltexte, kein echter Log.

---

### 2026-08-02 · Der Beitrags-Editor ist auf „Im Feed" vorgewählt

Wer „Beitrag erstellen" drückt, will posten. Ihn dann zuerst „Nur für
dich" abwählen zu lassen, ist eine Frage nach etwas, das er gerade
beantwortet hat.

**Die eiserne Regel bleibt unberührt.** Sie lautet: Jeder Tag ist
privat, bis man ihn ausdrücklich teilt. Der Tag draußen bleibt privat —
im Editor wird nichts gesichert, solange niemand den Knopf drückt. Wer
den Dialog wegklickt, hat nichts geteilt. Geändert hat sich nur die
Vorauswahl in einem Dialog, den man absichtlich geöffnet hat.

Eine **bestehende** Wahl wird nie überschrieben: Steht ein Tag auf „Wer
dir folgt", bleibt er dort. Vorgewählt wird nur, wo noch nichts
entschieden war.

Dazu die Beschriftungen, damit der Unterschied zwischen Öffnen und
Veröffentlichen sichtbar bleibt: Der Knopf am Tag heißt **„Beitrag
erstellen"** (er öffnet nur), der Knopf im Editor heißt **„Posten"** (er
veröffentlicht).

### 2026-08-02 · Der Feed hat keinen Kopf mehr

Über dem Feed stand eine Seitenüberschrift mit dem Wort „Feed". Sie
sagte nichts, was die Navigation nicht schon sagt, und machte den Anfang
zu einer Kante: Wer nach oben wischte, stieß auf eine Wand statt auf
Beiträge.

Ein Strom soll oben kein spürbares Ende haben. Geblieben ist die
Reiterleiste — sie trägt jetzt auch „Beitrag erstellen" und blendet sich
beim Lesen mit aus.

Dazu fängt die **erste** Karte nicht mehr per Scroll-Snap. Zwei
Fangpunkte wenige Dutzend Pixel auseinander (Seitenanfang und erste
Karte) ergaben oben ein Ziehen — genau das Gefühl von „hier ist oben",
das weg sollte. Alle übrigen Karten fangen weiter, die Wischbremse
bleibt.

### 2026-08-02 · Erklärungen sind abrufbar, nicht aufgedrängt

Zwischen „Beitrag erstellen" und dem Editor stand ein Dialog, der
erklärte, dass dabei ein Tag mit heutigem Datum entsteht. Gut gemeint,
falsche Stelle: Eine Erklärung, die man jedes Mal wegklicken muss, wird
nach dem zweiten Mal nicht mehr gelesen — sie ist dann nur noch ein
Klick.

Der Text ist nicht verschwunden, sondern hinter einem Fragezeichen
neben dem Knopf — **im Log, nicht im Feed**. Im Feed will man los.

Ein Dialog bleibt für einen Fall: wenn es nicht geht. Ohne Reise kann
kein Tag entstehen; das muss man erfahren, statt auf einen Knopf zu
drücken, der nichts tut.

Nebenbei aufgefallen: Der alte Dialog trug die Klassen `.grund`,
`.blatt` und `.zu` — **die es nirgends gibt**. `.dialog-grund` und
`.dialog-blatt` aus `bewegung.css` liefern nur die Animation, keine Lage
und keinen Hintergrund. Der Kasten stand also mitten im Seitenfluss,
ohne dass Build oder Konsole etwas gemeldet hätten.

---

## Noch offen

- **Repost.** Kommt (30.07. bestätigt) — man muss ihn nicht nutzen.
  Offen bleiben die zwei Fragen: zählt ein Repost als eigener Beitrag
  im Feed, oder wird der Ursprung mit einer Zeile „geteilt von …"
  gezeigt? Und wer bekommt die Stimmen, Ursprung oder Reposter?
- **Benachrichtigungen.** Jetzt gesetzt, weil rote Punkte erlaubt sind:
  eigene Tabelle, Ungelesen-Zähler, abschaltbar je Art. Trägt
  Erwähnungen, Antworten und Uploads von Gefolgten.
- **Karte v2.** Vorgemerkt, siehe oben. Setzt normalisierte Orte voraus.
- **Erwähnungen mit `@`.** Setzt Benachrichtigungen voraus, die es in
  Voria noch gar nicht gibt — eigene Tabelle, Ungelesen-Zähler,
  Glockensymbol
- **Orte normalisieren.** `place_name` ist Freitext. Entweder unscharfe
  Suche per `ilike` oder eine `places`-Tabelle mit Vorschlägen. Letzteres
  ist das Fundament für „wer war auch dort" und eine echte Karte
- **Gemeinsame Reisen.** Entschieden, nicht begonnen. Der Eingriff mit
  der größten Reichweite: alle Zugriffsregeln hängen an `user_id = auth.uid()`
- **Bleibt „Karte" ein eigener Hauptbereich?**
- **Offline-Konflikte.** Was passiert, wenn zwei Geräte denselben Tag
  offline ändern
- **Kaltstart des Feeds.** Ein Feed ohne Inhalt ist tot; es braucht etwa
  1000 aktive Poster
- **Domain**
