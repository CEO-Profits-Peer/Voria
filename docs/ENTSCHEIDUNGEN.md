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

## Noch offen

- **Preismodell.** Werbung nur im Feed denkbar, nie im Log. Durch niedrige Speicherkosten ist ein Free-Start realistisch
- **Bleibt „Karte" ein eigener Hauptbereich?** Wurde von Claude Design vorgeschlagen, nicht bewusst entschieden
- **Offline-Konflikte.** Was passiert, wenn zwei Geräte denselben Tag offline ändern
- **Kaltstart des Feeds.** Ein Feed ohne Inhalt ist tot; es braucht etwa 1000 aktive Poster
- **Domain**
