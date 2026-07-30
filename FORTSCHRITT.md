# Voria — Fortschritt

Live: https://voria-travel.vercel.app

Ich führe hier mit, was tatsächlich behoben oder gebaut ist, und was
davon ich selbst geprüft habe. Zahlen darin sind echt gezählt, nicht
gerundet.

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

## Behoben — 12 Fehler

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

Der teuerste war Nummer 4. Er hat mehrere andere Fehler vorgetäuscht:
weil React nicht hydrierte, tat kein Klick etwas, und es sah aus, als
sei „Übernehmen" kaputt. Funktionierte nur, was ohne JavaScript geht —
also das nackte `<form action={…}>`.

---

## Gebaut — 8 Funktionen

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
7. **Wächterskript** `npm run pruefe:stile` — findet ungescopete
   styled-jsx-Regeln, den Fehler aus Nummer 3.
8. **Deployment** auf Vercel, Adresse aus `VERCEL_URL` statt
   festverdrahtetem localhost.

Dazu 5 Migrationen (`0004` Profil-Trigger, `0005` Suchindizes) und drei
Dokumente: `START.md`, `DEPLOY.md`, `QUEUE.md`.

---

## Was ich selbst geprüft habe — und was nicht

Das ist die wichtigste Spalte in diesem Dokument.

**Im Browser nachgewiesen:**

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

Der Grund ist derselbe wie immer: `next build` läuft in meiner
Umgebung nicht — die SWC-Binary in `node_modules` ist Windows-spezifisch —
und `tsc --noEmit` braucht über dem gemounteten Laufwerk Minuten statt
Sekunden. Geprüft habe ich stattdessen Klammernbilanz aller berührten
Dateien, beidseitige Vollständigkeit jedes neuen i18n-Schlüssels und
das Wächterskript.

**Vor dem nächsten Deploy also:** `npm run pruefen` und
`npm run build`. Wenn dabei etwas hochkommt, ist es meins.

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

## Nächste Ziele

Drei Stück, in dieser Reihenfolge. Mehr setze ich mir nicht — bei
fünfzehn offenen Punkten wird jede Liste zur Wunschliste.

**Ziel 1 — Diesen Stand grün bekommen.**
`npm run pruefen`, `npm run build`, Migration `0005`, Deploy. Danach
prüfe ich im Browser durch, was oben in der zweiten Liste steht.

**Ziel 2 — Kommentare mit Likes.**
Vier Entscheidungen brauche ich vorher von dir; sie stehen in
`QUEUE.md` unter Punkt 4. Eine Falle kenne ich schon:
`comment_votes` erzeugt genau dieselbe Doppeldeutigkeit, die den Feed
lahmgelegt hat (Nummer 9). Der Fremdschlüssel muss von Anfang an
benannt werden.

**Ziel 3 — Erwähnungen mit `@`.**
Baut auf Kommentaren und der Personensuche auf. Offene Frage:
Benachrichtigungen gibt es in Voria noch gar nicht — das wäre ein
eigenes Stück samt Tabelle und Ungelesen-Zähler.

**Ausdrücklich nicht als Ziel:** Repost, direkter Beitragseditor und
gemeinsame Reisen. Alle drei ändern das Datenmodell, und beim
Beitragseditor rührt es an Vorias Kern — dass ein Beitrag ein geteilter
Tag ist und nichts anderes. Dazu will ich eine Entscheidung von dir,
keine Vermutung von mir.
