# Was jetzt ansteht

Stand: 30. Juli 2026 · Live: https://voria-travel.vercel.app

Sortiert nach dem, was blockiert — nicht nach dem, was am meisten Spaß
macht. **Die Begründung steht bei jedem Punkt**, nicht in einer zweiten
Datei; `QUEUE.md` ist hierin aufgegangen.

Was fertig ist und was davon geprüft wurde, steht in `FORTSCHRITT.md`.
Warum etwas so ist, in `docs/ENTSCHEIDUNGEN.md`.

---

## A. Sofort, weil ungeprüft (du)

Das ist der wichtigste Block. **Neun Funktionen sind gebaut, aber nie
im Browser ausgeführt worden.**

```powershell
npm run pruefen
npm run build
```

**Vor dem Deploy zwei Migrationen ausführen**, in dieser Reihenfolge:

1. `0006_kommentare.sql` — **blockierend.** Der Feed fragt
   `comments(count)` mit ab; ohne die Tabelle schlägt die ganze
   Feed-Abfrage fehl und der Feed ist leer. Der Fehler landet in der
   Serverkonsole, sichtbar ist nur die leere Seite.
2. `0007_leute_unscharf.sql` — **blockierend für die Personensuche.**
   `leuteSuchen` ruft jetzt die Datenbankfunktion `leute_suchen`; ohne
   sie findet der Reiter „Leute" niemanden mehr.

Beide prüfen sich am Ende selbst und brechen mit einer Meldung ab,
wenn etwas fehlt.

Danach im Browser durchgehen, in dieser Reihenfolge:

| Was | Wo | Worauf achten |
|---|---|---|
| Jahre im Log | `/log`, Reisen aus zwei Jahren | Überschriften da? **Zahl der Tage je Karte richtig?** Riskanteste Änderung — schlägt `entries(count)` fehl, sieht die Seite aus, als gäbe es keine Reisen |
| Kommentare | Feed → dritter Knopf im Fuß | Schreiben, antworten, aufklappen, eigenen bearbeiten → steht „bearbeitet" da? |
| Kommentar-Stimme | Feed → Kommentar → Pfeil | Zähler zählt, und der Kommentar bekommt **kein** „bearbeitet" |
| Bereich offen lassen | Feed → Kommentare auf → antworten | Bleibt der Bereich offen? `revalidatePath('/feed')` baut die Serverseite neu — größte offene Unsicherheit |
| Doppelklick | Feed, in die Leere neben den Karten | Springt weich zum nächsten Beitrag, **ohne die Bilder blau zu markieren** |
| Feed-Reiter | Feed → „Folge ich" | Nur Gefolgte? Reiter im Adressfeld? Neu laden behält ihn? |
| Reiterwechsel | Feed → nachladen → auf den anderen Reiter | Stehen dort wirklich **andere** Beiträge, nicht die alten? |
| Niemandem folgen | Neues Konto → „Folge ich" | Hinweis statt leerer Fläche, und die Reiter bleiben bedienbar |
| Nachladen | Feed mit mehr als 10 Beiträgen, langsam scrollen | Kommen die nächsten zehn, **bevor** man unten ankommt? Steht keiner doppelt? |
| Werbung nach dem Nachladen | Feed, zweiter Stapel | Immer noch jede sechste Karte über die **ganze** Liste — nicht je Stapel neu |
| Keine Scrollleiste | Feed betreten und wieder verlassen | Leiste im Feed weg, danach wieder da, **und die Seite ruckt seitlich nicht** |
| Anderer Tag | Reiseseite, unter der Tagesliste | Datumsfeld öffnet sich, Sprung auf den gewählten Tag |
| Suchtreffer | `/suche` → Tage | Gesuchtes Wort im Auszug farbig hinterlegt |
| Textblöcke | Tag → Fläche → Plus → Text | Tippen, neu laden, verschieben, zweiter Block, löschen |
| Profilbild | `/du/bearbeiten` | Hochladen, erscheint es in Feed, Suche, Seitenleiste? |
| Personensuche | `/suche` → Reiter „Leute" | `qualle`, `lore`, Folgen-Knopf |
| Tippfehler | `/suche` → „Leute" → einen Namen **falsch** tippen | Wird er trotzdem gefunden? Steht der beste Treffer oben? |
| Private Profile | Ein Profil auf privat, dann danach suchen | Darf **nicht** auftauchen — sonst läuft `leute_suchen` mit falschen Rechten |
| Teilen | Feed → Teilen | Link in einem privaten Fenster öffnen — ohne Anmeldung sichtbar? |
| Tagesleiste | Tag, beide Modi | Foto und Sichtbarkeit in **Seite** und **Fläche** erreichbar? |
| Werbung | Feed | Erst ab Beitrag 7, nie zwei hintereinander, nie zuletzt |

Kommt beim Bauen etwas hoch, ist es meins.

---

## B. Klein und ohne Entscheidung (ich)

**Erledigt:** doppelter „Heute schreiben" · Bearbeiten-Seite auf i18n ·
vergangene Tage schreiben · Jahres-Gruppierung · Suchtreffer
hervorheben · Doppelklick markiert keine Bilder mehr. Einzelheiten in
`FORTSCHRITT.md`.

**Offen:**

1. **Konto löschen** — technisch räumt `on delete cascade` schon alles
   weg, es fehlt nur der Knopf. Brauchst du für die
   Datenschutzerklärung.
2. **`picsum.photos` aus `next.config.ts` entfernen** — steht dort nur
   für die Testdaten. Vor dem echten Start raus, sonst darf jeder
   Bilder von dort in Voria einbetten.
3. **Region auf geteilten Seiten** — `trip_countries_all` verlangt
   `t.user_id = auth.uid()`. Nichtangemeldete sehen `/b/<id>` deshalb
   ohne Regionen-Theme. Kosmetisch, aber falsch.
4. **Zurück-Knopf auf fremden Profilen** — `/u/[name]` hat keinen. Man
   kommt nur über die Browser-Taste zurück, und auf dem Handy als PWA
   gibt es die nicht sichtbar.
5. **Kurzinfo beim Überfahren des Namens im Feed** — Follower, Anzahl
   Beiträge, Bio. Braucht eine eigene Abfrage; verzögert laden, sonst
   schickt jedes Überfahren eine Anfrage. Am Handy gibt es kein Hover —
   dort ersatzlos.

---

## C. Der Feed als Geschäftsmodell

Seit dem 30.07. richtiggestellt: **der Feed ist optional für den
Nutzer, aber nicht nebensächlich für Voria.** Wer ihn nie öffnet, hat
ein vollständiges Tagebuch — trotzdem verdient Voria dort sein Geld.
Also gut bauen, nicht zurückstellen. Siehe `docs/ENTSCHEIDUNGEN.md`.

### „Für dich" und „Folge ich" — GEBAUT, ungeprüft

Zwei Reiter über dem Feed, nach dem Muster aus `/suche`. Kein eigener
Hauptbereich (die Navigation hat bewusst vier), kein verstecktes Menü
hinter drei Punkten (findet niemand).

* **Für dich** — der bestehende Feed samt Kaltstart-Regel
* **Folge ich** — nur Beiträge von Gefolgten, immer chronologisch

Verweise statt Knöpfe: der Reiter steht im Adressfeld, überlebt das
Neuladen und lässt sich weitergeben.

Drei Dinge, die dabei Aufmerksamkeit brauchten:

**Leere Gefolgtenliste.** Ohne Rückzieher baut PostgREST `in.()` — eine
Bedingung ohne Inhalt, die je nach Fassung wirft oder **alles**
durchlässt. Das zweite wäre schlimmer: der Reiter zeigte dann Fremde.

**Der Reiter muss beim Nachladen mit.** Sonst holt „Folge ich" ab der
zehnten Karte den offenen Feed nach.

**`key={reiter}` am `FeedStrom`.** Ohne ihn sieht React dieselbe Stelle
im Baum und lässt `useState(start)` unberührt — im neuen Reiter stünden
die Beiträge des alten.

### Benachrichtigungen — jetzt gesetzt

Rote Punkte sind erlaubt, solange sie **Ereignisse** melden (Antwort,
neue Folger, Upload von Gefolgten) und nicht **Verhalten** (Serien,
Abzeichen, Fortschritt). Alles einzeln abschaltbar.

Nötig: eigene Tabelle, Ungelesen-Zähler, Glockensymbol. Trägt danach
auch Erwähnungen mit `@`.

### Stiller Modus

Ein Schalter in den Einstellungen, der die ruhige Nutzung in einem Zug
herstellt: keine Hinweise, nichts Soziales im Blick. Beim Ausschalten
steht alles wieder wie vorher — **der Schalter überschreibt die
Einzeleinstellungen, er löscht sie nicht.** Das ist der Unterschied
zwischen einem Modus und einem Rundumschlag, und es ist der Punkt, an
dem die Umsetzung schiefgehen kann.

### Repost

Kommt. Offen bleiben zwei Fragen, die das Ergebnis ändern:

1. Zählt ein Repost im Feed als eigener Beitrag, oder wird der Ursprung
   mit einer Zeile „geteilt von …" gezeigt?
2. Bekommt der Ursprungsverfasser die Stimmen, oder der Reposter?

Braucht `posts.repost_of`. Der Fuß der Beitragskarte hat heute drei
Knöpfe und bekommt dann den vierten — bis dahin steht dort bewusst
nichts Totes.

### Erwähnungen mit `@`

Baut auf Kommentaren und der Personensuche auf. Erwähnungen beim
Speichern **als IDs ablegen, nicht als Text** — sonst zeigt die
Erwähnung ins Leere, sobald jemand seinen Benutzernamen ändert.
Setzt Benachrichtigungen voraus.

---

## D. Größer, Entscheidung nötig (du)

### Beitrag direkt erstellen

**Rührt an Vorias Kern.** Heute gilt `posts.entry_id not null unique` —
ein Beitrag *ist* ein geteilter Tag. Ein eigener Editor kehrt das um;
danach gibt es zwei Sorten Inhalt und bei jedem Beitrag die Frage,
warum er nicht im Log steht.

Mein Vorschlag bleibt: der Editor sieht aus wie Instagram, legt innen
aber still einen Tag mit heutigem Datum an. Modell bleibt heil.
Kategorien gehen unabhängig davon über `posts.category`.

### Orte suchen — und die Grundlage für Karte v2

`place_name` ist Freitext — jeder schreibt „Marrakesch", „marrakech",
„Marrakesh". Zwei Wege:

1. **Freitext behalten**, unscharf per `ilike`. Schnell gebaut, bleibt
   ungenau.
2. **Orte normalisieren** — Tabelle `places`, Vorschläge beim Tippen,
   `entries.place_id` als Verweis. Mehr Arbeit, aber das Fundament für
   „wer war auch dort" **und für Karte v2**.

Karte v2 ist vorgemerkt und hängt an dieser Entscheidung: solange die
Orte Freitext sind, gibt es nichts, was sich verorten ließe.

### Bereiste Orte auf fremden Profilen

Die Zahlen stehen dort, die Orte nicht. Ableitbar wären sie aus
`trip_countries` — aber `trips_read` gibt fremde Reisen nur bei
`visibility = 'public'` heraus, und das steht bei niemandem.

Also erst die Entscheidung: **Können Reisen überhaupt öffentlich
werden, oder werden die Länder aus den geteilten Tagen abgeleitet?**
Dieselbe Regel ist der Grund, warum `/b/<id>` ohne Regionen-Theme
erscheint (Block B, Punkt 3) — es lohnt sich, beides zusammen zu
entscheiden.

### Gemeinsame Reisen

Entschieden, nicht angefangen. Der Eingriff mit der größten Reichweite:
alle Zugriffsregeln auf `trips`, `entries` und `blocks` hängen heute an
`user_id = auth.uid()`.

---

## E. Vor dem ersten echten Nutzer

* **Export.** Steht sonst nirgends und ist trotzdem das Wichtigste.
  „Der Ort, an dem du in zehn Jahren nachliest" ist ein Versprechen
  über zehn Jahre — glaubwürdig nur, wenn die Daten mitkommen können.
  JSON plus Fotos als Vertrauensarbeit, gesetztes PDF als Pro-Merkmal
  und Vorstufe zum Fotobuch-Druck.
* **Offline schreiben.** In der Gesamtbeschreibung steht, Voria
  funktioniere ohne Netz. Der Service Worker cached aber nur das
  Lesen — es gibt weder IndexedDB noch eine Warteschlange für
  Schreibvorgänge. Wer abends im Hostel ohne Netz tippt, verliert den
  Text. Das ist kein fehlendes Extra, das ist die Kernnutzung.
* **Datenschutzerklärung und Impressum.** Du speicherst E-Mail-Adressen
  in `auth.users` bei einem US-Dienst. Ich bin kein Anwalt — das ist
  nur der Hinweis, dass es ansteht.
* **`SUPABASE_SERVICE_ROLE_KEY` neu erzeugen.** In `.env.local` steht
  ein Kommentar von dir selbst, dass das noch offen ist.
* **Bezahlung anbinden** — `istPro()` gibt heute immer `false` zurück.
* **Echte Anzeigen** statt der Platzhalter in `features/social/werbung.ts`.
* **Verwaiste Profilbilder aufräumen.** Beim Tauschen bleibt das alte
  liegen — bewusst, damit ein fehlgeschlagenes Löschen nicht das Setzen
  verhindert. Gehört in einen Job.
* **`npm audit`: 12 Meldungen.** Betreffen Build-Werkzeuge, nicht den
  ausgelieferten Code. **Nicht** `--force` ausführen, das setzt Next
  zurück und bricht das Projekt.

---

## Zwei Dinge, die noch nicht bewiesen sind

**Kurzer Fremdscreen beim Laden (~0,3 s).** Beim vollen Seitenaufruf
gibt es ihn nicht — auf der Live-Seite gemessen: CSS fertig bei
2067 ms, First Paint erst bei 3868 ms. CSS blockiert also korrekt.
Bleibt die Client-Navigation: `src/app/loading.tsx` zeigt eine
zentrierte Zeile „Laden", und `AppShell.tsx` erzwingt mit
`<main key={pfad}>` bei jedem Pfadwechsel einen Neuaufbau — der alte
Inhalt verschwindet sofort, statt stehen zu bleiben. Nachstellen:
DevTools → Network → *Slow 4G*, dann zwischen Log und Karte wechseln.
Abhilfe wäre `key={pfad}` entfernen, ein Skelett statt „Laden", oder
beides.

**Der Kaltstart bleibt der eigentliche Engpass.** Ein Feed ohne Inhalt
ist tot; es braucht grob tausend aktive Schreiber, bevor der soziale
Teil sich selbst trägt. Solange muss Voria als reines Tagebuch
überzeugen. Der geplante Anstoß ist der Jahresrückblick — etwas, das
man herzeigen will, entstanden aus dem, was ohnehin da ist.

Dazu gehört: **berühmte Leute gibt es nicht von selbst.** Die
Personensuche findet niemanden, solange niemand da ist — das ist kein
Suchproblem, sondern dasselbe Kaltstartproblem. Denkbar wäre eine
kleine redaktionelle Liste zum Start.

---

## Mein Vorschlag für die nächsten drei

1. **Block A abarbeiten** — Migration einspielen, deployen, die Liste
   durchgehen. Es liegt viel Ungeprüftes aufeinander.
2. **„Für dich" / „Folge ich"** — klein, die Daten liegen vor, und es
   macht den Feed sofort brauchbarer.
3. **Benachrichtigungen** — trägt danach Erwähnungen, Antworten und
   Uploads von Gefolgten. Ohne sie bleibt jede Erwähnung folgenlos.

Export und Offline-Schreiben stehen in Block E, gehören aber vor den
ersten echten Nutzer — nicht vor den nächsten Feed-Baustein.
