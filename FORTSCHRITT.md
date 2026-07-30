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

## Behoben — 13 Fehler

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

Der teuerste war Nummer 4. Er hat mehrere andere Fehler vorgetäuscht:
weil React nicht hydrierte, tat kein Klick etwas, und es sah aus, als
sei „Übernehmen" kaputt. Funktionierte nur, was ohne JavaScript geht —
also das nackte `<form action={…}>`.

Nummer 13 ist lehrreich, weil die Ursache eine Ebene früher lag als der
Fehler: Der Browser beginnt die Auswahl beim zweiten `mousedown`, also
bevor `dblclick` überhaupt feuert. Im Doppelklick-Handler war es dafür
schon zu spät — dort ließ sich die Markierung nur noch wegräumen,
nachdem sie zu sehen war. `user-select: none` wäre der falsche Ausweg
gewesen: dann ließe sich auch der Text eines Beitrags nicht mehr
markieren.

---

## Gebaut — 16 Funktionen

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

Dazu 7 Migrationen (`0004` Profil-Trigger, `0005` Suchindizes,
`0006` Kommentare, `0007` unscharfe Personensuche) und die Dokumente
`START.md` und `DEPLOY.md`.

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
