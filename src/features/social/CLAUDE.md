# features/social

Feed, Beiträge, Upvotes, Folgen. Vollständig optional — der Log
funktioniert ohne diesen Bereich.

| Datei | Zweck |
|---|---|
| `queries.ts` | Feed laden, inklusive Kaltstart-Regel |
| `actions.ts` | Voten und Folgen |
| `BeitragKarte.tsx` | Ein Beitrag, im Theme seiner Region |
| `kommentarQueries.ts` | Kommentare lesen und zum Baum falten |
| `kommentarActions.ts` | Schreiben, bearbeiten, mitstimmen |
| `Kommentare.tsx` | Der Bereich unter der Karte, lädt beim Aufklappen |
| `KommentarZeile.tsx` | Ein Kommentar samt Antworten, ruft sich selbst auf |
| `Schreibfeld.tsx` | Das Feld für neu, antworten und bearbeiten |

## Regeln hier

**Kaltstart:** Unter 200 Beiträgen wird chronologisch sortiert. Ein
Algorithmus ohne Datenmenge ist schlechter als keiner.

**Jeder Beitrag trägt sein Regionen-Theme.** Deshalb sieht der Feed aus wie
ein Stapel Postkarten und nicht wie eine Tabelle. Das ist der sichtbarste
Unterschied zu Instagram — nicht wegwerfen.

**Motion ist hier schneller:** `motion-feed`, 200 ms. Im Log sind es 400.

**Ein Beitrag braucht immer einen Eintrag.** `posts.entry_id` ist unique.

**Kommentare werden nicht gelöscht, nur bearbeitet.** Das steht nicht in
der Oberfläche, sondern in der Datenbank: `0006_kommentare.sql` hat
bewusst keine `delete`-Regel, und schreiben darf der Client nur die
Spalte `text` — `vote_count` und `edited_at` wären sonst über dieselbe
UPDATE-Anweisung erreichbar.

**Jede Einbettung von `profiles` braucht ihren Fremdschlüssel.** Mit
`votes`, `follows` und jetzt `comment_votes` gibt es mehrere Wege
dorthin. PostgREST antwortet sonst mit `HTTP 300` — ohne Eintrag in
Konsole oder Terminal.
