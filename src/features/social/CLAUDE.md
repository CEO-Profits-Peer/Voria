# features/social

Feed, Beiträge, Upvotes, Folgen. Vollständig optional — der Log
funktioniert ohne diesen Bereich.

| Datei | Zweck |
|---|---|
| `queries.ts` | Feed laden, inklusive Kaltstart-Regel und Reiter |
| `konstanten.ts` | Werte für Server **und** Browser. Importiert nichts |
| `actions.ts` | Voten, Folgen, Nachladen |
| `FeedStrom.tsx` | Hält die Liste, lädt nach, mischt die Werbung |
| `FeedReiter.tsx` | „Für dich" und „Folge ich" als Verweise |
| `BeitragKarte.tsx` | Ein Beitrag, im Theme seiner Region |
| `kommentarQueries.ts` | Kommentare lesen und zum Baum falten |
| `kommentarActions.ts` | Schreiben, bearbeiten, mitstimmen |
| `Kommentare.tsx` | Der Bereich unter der Karte, lädt beim Aufklappen |
| `KommentarZeile.tsx` | Ein Kommentar samt Antworten, ruft sich selbst auf |
| `Schreibfeld.tsx` | Das Feld für neu, antworten und bearbeiten |

## Regeln hier

**Kaltstart:** Unter 200 Beiträgen wird chronologisch sortiert. Ein
Algorithmus ohne Datenmenge ist schlechter als keiner. Im Reiter
„Folge ich" gilt das immer — dort hat der Nutzer die Auswahl schon
getroffen.

**Nichts Serverseitiges in eine Client-Komponente ziehen.** `queries.ts`
hängt über `createServerClient` an `next/headers`. Holt eine
Client-Komponente von dort auch nur eine Zahl, wandert der ganze
Server-Client ins Browser-Bündel und der Build bricht ab — mit einer
Meldung, die von `pages/` spricht, das es hier gar nicht gibt.
Gemeinsame Werte gehören in `konstanten.ts`. **`tsc` bemerkt das
nicht, nur `npm run build`.**

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
