# Was jetzt ansteht

Stand: 30. Juli 2026 · Live: https://voria-travel.vercel.app

Sortiert nach dem, was dich blockiert — nicht nach dem, was am meisten
Spaß macht. Vollständige Begründungen zu jedem Punkt stehen in
`QUEUE.md`.

---

## A. Sofort, weil ungeprüft (du)

Das ist der wichtigste Block. **Fünf Funktionen sind gebaut, aber von
mir nie ausgeführt worden.** Ich kann in meiner Umgebung nicht bauen —
die SWC-Binary in `node_modules` ist Windows-spezifisch.

```powershell
npm run pruefen
npm run build
```

Danach im Browser durchgehen, in dieser Reihenfolge:

| Was | Wo | Worauf achten |
|---|---|---|
| Textblöcke | Tag → Fläche → Plus → Text | Tippen, neu laden, verschieben, zweiter Block, löschen |
| Profilbild | `/du/bearbeiten` | Hochladen, erscheint es in Feed, Suche, Seitenleiste? |
| Personensuche | `/suche` → Reiter „Leute" | `qualle`, `lore`, Folgen-Knopf |
| Teilen | Feed → Teilen | Link in einem privaten Fenster öffnen — ohne Anmeldung sichtbar? |
| Tagesleiste | Tag, beide Modi | Foto und Sichtbarkeit in **Seite** und **Fläche** erreichbar? |
| Werbung | Feed | Erst ab Beitrag 7, nie zwei hintereinander, nie zuletzt |
| Doppelklick | Feed, in die Leere neben den Karten | Springt weich zum nächsten Beitrag |

Kommt beim Bauen etwas hoch, ist es meins.

---

## B. Klein und ohne Entscheidung (ich)

1. ~~**Doppelter „Heute schreiben"**~~ — **erledigt.** Die Zeile
   erscheint jetzt nur noch, wenn es für heute keinen Tag gibt. Vorher
   stand der heutige Tag zweimal in der Liste: einmal mit Titel, einmal
   als Einladung, ihn anzulegen — beide führten an dieselbe Stelle.
2. **Vergangene Tage schreiben** — `/log/[reiseId]/[datum]` kann das
   längst, es fehlt nur ein Datumswähler statt „Heute schreiben".
3. ~~**Bearbeiten-Seite hartcodiert Deutsch**~~ — **erledigt.** Zehn
   Klartexte durch i18n ersetzt, in beiden Sprachen. Dabei fiel auf,
   dass auch `REGION_LABELS` nur deutsche Namen hat — die
   Regionen-Auswahlliste brach also mitten in die falsche Sprache um.
   Nutzt jetzt `t.regionen`.
4. **Jahres-Gruppierung in `/log`** — flache Liste, ab etwa dreißig
   Reisen ein langer Scroll ohne Halt.
5. **Konto löschen** — technisch räumt `on delete cascade` schon alles
   weg, es gibt nur keinen Knopf. Brauchst du für die
   Datenschutzerklärung.
6. **`picsum.photos` aus `next.config.ts` entfernen** — steht dort nur
   für die Testdaten. Vor dem echten Start raus, sonst darf jeder
   Bilder von dort in Voria einbetten.
7. **Region auf geteilten Seiten** — `trip_countries_all` verlangt
   `t.user_id = auth.uid()`. Nichtangemeldete sehen `/b/<id>` deshalb
   ohne Regionen-Theme. Kosmetisch, aber falsch.

8. **Suchtreffer hervorheben** — der Auszug zeigt den Fundort, aber das
   gesuchte Wort ist darin nicht markiert. Achtung: der Text darf nicht
   als HTML eingesetzt werden, sonst ist es eine Lücke. Aufteilen und
   als React-Knoten bauen.
9. **Zurück-Knopf auf fremden Profilen** — `/u/[name]` hat keinen. Man
   kommt nur über die Browser-Taste zurück, und auf dem Handy als PWA
   gibt es die nicht sichtbar.
10. **Kurzinfo beim Überfahren des Namens im Feed** — Follower, Anzahl
    Beiträge, Bio. Braucht eine eigene Abfrage; sinnvoll erst mit
    Verzögerung laden, sonst schickt jedes Überfahren eine Anfrage.
    Auf dem Handy gibt es kein Hover — dort ersatzlos.

---

## C. Größer, Entscheidung nötig (du)

Hier baue ich nicht drauflos, weil die Antwort das Ergebnis ändert.

### Kommentare mit Likes

Vier Fragen:

* **Verschachtelung** — flache Liste oder Antworten auf Antworten?
  Flach ist ruhiger und passt besser zu Voria.
* **Wo** — aufklappbar in der Feed-Karte oder nur auf `/feed/[id]`?
* **Sortierung** — chronologisch oder nach Stimmen?
* **Löschen** — nur eigene, oder darf auch der Verfasser des Beitrags
  Kommentare unter seinem Tag entfernen?

Eine Falle kenne ich schon: `comment_votes` erzeugt genau dieselbe
Doppeldeutigkeit zwischen `comments` und `profiles`, die den Feed
lahmgelegt hat. Der Fremdschlüssel muss von Anfang an benannt werden.

### Erwähnungen mit `@`

Baut auf Kommentaren auf. Offene Frage: **Benachrichtigungen gibt es in
Voria noch gar nicht.** Eine Erwähnung, die niemand mitbekommt, ist
sinnlos — also käme eine Tabelle, ein Ungelesen-Zähler und ein
Glockensymbol dazu. Das ist ein eigenes Stück.

### Repost

Braucht `posts.repost_of` und eine Entscheidung: Zählt ein Repost im
Feed als eigener Beitrag, oder wird der Ursprung mit einer Zeile
„geteilt von …" angezeigt? Und: bekommt der Ursprungsverfasser die
Stimmen, oder der Reposter?

### Beitrag direkt erstellen

**Das rührt an Vorias Kern.** Heute gilt `posts.entry_id not null
unique` — ein Beitrag *ist* ein geteilter Tag. Daraus zieht Voria
seinen Charakter: der Feed ist Nebenprodukt des Tagebuchs, keine
eigene Bühne.

Mein Vorschlag bleibt: der Editor sieht aus wie Instagram, legt innen
aber still einen Tag mit heutigem Datum an. Modell bleibt heil.

### Orte suchen

`place_name` ist Freitext — jeder schreibt „Marrakesch", „marrakech",
„Marrakesh". Entweder unscharf per `ilike` (schnell, ungenau) oder eine
`places`-Tabelle mit Vorschlägen beim Tippen. Letzteres ist das
Fundament für „wer war auch dort" und eine echte Karte.

### Gemeinsame Reisen

Entschieden, aber nicht angefangen. Der Eingriff mit der größten
Reichweite: alle Zugriffsregeln auf `trips`, `entries` und `blocks`
hängen heute an `user_id = auth.uid()`.

---

## D. Vor dem ersten echten Nutzer

Kein Spaß, aber es fällt sonst später auf die Füße.

* **Datenschutzerklärung und Impressum.** Du speicherst E-Mail-Adressen
  in `auth.users` bei einem US-Dienst. Ich bin kein Anwalt — das ist
  nur der Hinweis, dass es ansteht.
* **`SUPABASE_SERVICE_ROLE_KEY` neu erzeugen.** In `.env.local` steht
  ein Kommentar von dir selbst, dass das noch offen ist.
* **Verwaiste Profilbilder aufräumen.** Beim Tauschen bleibt das alte
  liegen — bewusst, damit ein fehlgeschlagenes Löschen nicht das
  Setzen verhindert. Gehört in einen Job.
* **`npm audit`: 12 Meldungen.** Betreffen Build-Werkzeuge, nicht den
  ausgelieferten Code. **Nicht** `--force` ausführen, das setzt Next
  zurück und bricht das Projekt.

---

## Mein Vorschlag für die nächsten drei

1. **Block A abarbeiten** — bauen, deployen, die sieben Punkte prüfen.
   Ohne das stapeln wir Ungeprüftes auf Ungeprüftes.
2. **Block B, Punkte 1 bis 3** — drei kleine Fehler, kein Nachdenken
   nötig, spürbarer Unterschied.
3. **Kommentare** — sobald du mir die vier Fragen beantwortet hast.

Repost, Beitragseditor und gemeinsame Reisen halte ich bewusst zurück,
bis der Rest steht. Alle drei ändern das Datenmodell.
