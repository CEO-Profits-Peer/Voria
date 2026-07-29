# Voria — offene Punkte

Stand: 30. Juli 2026. Live unter https://voria-travel.vercel.app

Reihenfolge ist Vorschlag, nicht Gesetz. Ganz oben steht, was
blockiert; weiter unten, was schön wäre.

---

## 1. Feed zeigt keine Beiträge — BEHOBEN, Deploy fehlt noch

Ursache gefunden, mit Fehlercode. Nicht das Teilen war schuld: in der
Datenbank standen längst zwei Beiträge, beide auf `public`. Die
**Feed-Abfrage selbst** schlug fehl.

PostgREST antwortete mit `HTTP 300`:

```
PGRST201: Could not embed because more than one relationship
          was found for 'posts' and 'profiles'
```

Es gibt zwei Wege von `posts` nach `profiles`:

1. `posts_user_id_fkey` — `posts.user_id → profiles.id` (gewollt)
2. über `votes` — `votes.post_id → posts` und `votes.user_id → profiles`

Der zweite entstand nebenbei, als die Stimmen-Tabelle dazukam. Seitdem
kann PostgREST nicht wählen und verweigert die Einbettung.

`ladeFeed` prüfte nur `if (!data) return []`. Der Fehler verschwand
lautlos, der Feed war dauerhaft leer, und es sah aus, als hätte niemand
etwas geteilt. Betroffen waren drei Seiten, weil `profilQueries.ts`
dieselbe Auswahl benutzt: `/feed`, `/u/[benutzername]`,
`/feed/[beitragId]`.

Behoben:

* `profiles!posts_user_id_fkey(...)` an beiden Stellen
* `error` wird geprüft und geloggt, in `ladeFeed` und
  `ladeProfilBeitraege`
* Gegen dieselbe REST-Anfrage verifiziert: `HTTP 200`, beide Beiträge
  samt Verfasser

**Merke für alles Weitere:** Sobald eine Tabelle über eine
Zwischentabelle wie `votes` oder `follows` ein zweites Mal auf
`profiles` zeigt, muss der Fremdschlüssel benannt werden. Bei
Kommentaren (Punkt 4) tritt das sofort wieder auf —
`comment_votes` erzeugt genau dieselbe Doppeldeutigkeit.

Noch offen, dabei aufgefallen: `trips_read` erlaubt fremde Reisen nur
bei `visibility = 'public'` — das ist die Sichtbarkeit der **Reise**,
nicht des Tages. Bei fremden Beiträgen kommt der `trips`-Teil deshalb
leer zurück, wodurch Region und Theme der Beitragskarte fehlen.
Kosmetisch, aber falsch.

---

## 2. Kurzer Fremdscreen beim Laden (~0,3 s)

Noch nicht bewiesen. Beim vollen Seitenaufruf gibt es ihn **nicht** —
gemessen auf der Live-Seite: CSS fertig bei 2067 ms, First Paint erst
bei 3868 ms. CSS blockiert also korrekt, ein Flash of Unstyled Content
ist ausgeschlossen.

Bleibt die Client-Navigation. Der plausibelste Kandidat im Code:

`src/app/loading.tsx` zeigt eine zentrierte Zeile „Laden". Beim
Wechsel zwischen Bereichen erscheint die, solange die Serverdaten
unterwegs sind. Verstärkt wird es durch `AppShell.tsx`:

```tsx
<main className="vo-inhalt" key={pfad}>
```

Das `key` erzwingt bei jedem Pfadwechsel einen vollständigen Neuaufbau.
Der alte Inhalt verschwindet dadurch sofort, statt bis zum Eintreffen
des neuen stehen zu bleiben — genau das lässt einen Zwischenschirm
aufblitzen.

**Drei Wege, von sanft nach gründlich:**

1. `key={pfad}` entfernen. Der alte Inhalt bleibt stehen, bis der neue
   da ist. Kostet die Eintrittsanimation pro Navigation.
2. `loading.tsx` durch ein Skelett ersetzen, das die Form der
   kommenden Seite andeutet. Dann ist der Wechsel kein Bruch mehr.
3. Beides.

Messen ließ sich das mit meinen Browserwerkzeugen nicht:
`requestAnimationFrame` läuft in dem gesteuerten Tab nicht durch, ich
bekam nur einen einzigen Frame. Zwei Screenshots zeigten ungestalteten
Inhalt, aber die halte ich für Artefakte der Aufnahme — im Ruhezustand
waren dieselben Elemente korrekt gestaltet. Am besten schaust du
selbst: DevTools → Network → Throttling auf *Slow 4G*, dann zwischen
Log und Karte wechseln. Dann dauert der Zustand lang genug, um ihn zu
erkennen.

---

## 3. Free-Modus: mehrere Textfelder — GEBAUT, ungetestet

Der Plus-Knopf öffnete nur den Fotowähler; Text ließ sich auf der
freien Fläche überhaupt nicht anlegen. Jetzt fragt er zuerst: Text oder
Foto.

Gebaut:

* `textBlockAnlegen(eintragId, lage)` in `actions.ts` — eigene Action,
  weil `textSpeichern(…, null, '')` keine Lage kennt und der Block
  sonst beim nächsten Laden auf den Standardplatz zurückspringt
* Geschrieben wird im Block selbst, verzögert gesichert nach 700 ms.
  Eine Uhr **pro Block**, sonst verschluckt das Tippen im zweiten das
  Sichern des ersten
* Beliebig viele Textblöcke, jeder mit eigener Position und Drehung
* Stiftgriff schaltet den Schreibmodus um. Solange geschrieben wird,
  sind Ziehen, Drehen und Aufheben abgeschaltet — sonst rutscht die
  Notiz weg, wenn man den Cursor setzt
* Alle Beschriftungen über i18n, in `de.ts` und `en.ts`

**Dabei ein latenter Absturz gefunden und behoben.** `lagen` wurde nur
beim ersten Rendern gefüllt. Kam danach ein Block hinzu — bisher durch
ein Foto aus dem Wähler —, stand unter seiner ID nichts, und
`lagen[b.id].x` lief in einen TypeError. Die freie Fläche stürzte also
ab, sobald man dort ein Foto einfügte. Jetzt werden neue Blöcke
nachgetragen und gelöschte entfernt, plus ein Rückfall direkt im
Rendern.

**Noch nicht getestet.** Ich kann auf diesem Rechner nicht bauen, und
das Verhalten hängt an Zeigergesten, die ich nur eingeschränkt
nachstellen kann. Nach dem Deploy prüfe ich im Browser:
Text anlegen, tippen, neu laden, verschieben, zweiter Block, löschen.

---

## 4. Kommentare mit Likes

Neu gewünscht, Vorbild X und Instagram im Web. Braucht eine neue
Tabelle plus Zugriffsregeln:

```sql
comments (id, post_id, user_id, text, parent_id, created_at, vote_count)
comment_votes (comment_id, user_id)
```

Offene Entscheidungen, bevor ich anfange:

* **Verschachtelung:** flache Liste oder Antworten auf Antworten?
  Flach ist ruhiger und passt besser zu Voria, X kann beides.
* **Wo:** unter dem Beitrag in `/feed/[beitragId]` oder aufklappbar
  direkt in der Feed-Karte?
* **Sortierung:** chronologisch oder nach Stimmen? Bei kleinen Zahlen
  ist chronologisch ehrlicher — dieselbe Überlegung wie beim Feed.
* **Löschen:** nur eigene, oder darf der Verfasser des Beitrags
  Kommentare unter seinem Tag entfernen?

`votes` und `vote_count` gibt es für Beiträge schon samt Trigger
`bump_vote_count` — das Muster lässt sich übernehmen.

---

## 4b. Leute finden und Profile sehen

**Gute Nachricht: die Hälfte steht schon.** `/u/[benutzername]` zeigt
bereits Name, Bio, Anzahl Follower, Anzahl Gefolgte, den Folgen-Knopf
und alle Beiträge der Person. `FolgenKnopf` und die `follows`-Tabelle
sind fertig.

Es fehlt:

* **Leute suchen.** `/suche` durchsucht ausschließlich `entries` über
  `textSearch('suche', …)`. Profile kommen dort nicht vor. Nötig ist
  eine zweite Abfrage auf `profiles` über `username` und
  `display_name`, plus eine Umschaltung im Suchergebnis
  („Tage" / „Leute").
* **Bereiste Orte auf dem Profil.** Die Zahlen sind da, die Landkarte
  nicht. Ließe sich aus `trip_countries` der öffentlichen Reisen
  ableiten — aber Achtung: `trips_read` gibt fremde Reisen nur bei
  `visibility = 'public'` heraus, und das steht bei niemandem. Ohne
  eine Entscheidung dazu bleibt die Liste leer.
* **Berühmte Leute** gibt es nicht von selbst. Das ist kein
  Suchproblem, sondern ein Kaltstartproblem: ohne Nutzer keine
  Profile. Denkbar wäre eine kleine redaktionelle Liste zum Start.

---

## 4c. Nach Orten im Feed suchen

`entries.place_name` ist ein freies Textfeld — jeder schreibt „Marrakesch",
„marrakech", „Marrakesh". Suche darauf findet dann wenig.

Zwei Wege, und das ist eine Entscheidung, keine Fleißarbeit:

1. **Freitext beibehalten**, Suche unscharf über `ilike`. Schnell
   gebaut, bleibt ungenau.
2. **Orte normalisieren** — eigene Tabelle `places`, beim Eintippen
   Vorschläge, `entries.place_id` als Verweis. Dann funktioniert Suche,
   Gruppierung und später eine echte Karte. Mehr Arbeit, aber das
   Fundament für „wer war auch dort".

Für die Suche im Feed hängt beides an `posts` → `entries` → Ort. Die
Länder liegen ohnehin schon strukturiert in `trip_countries`.

---

## 4d. Beitrag direkt erstellen — Architekturfrage, nicht nur Arbeit

Hier muss eine Entscheidung vor die Umsetzung, weil sie an Vorias Kern
rührt.

Derzeit gilt: **ein Beitrag IST ein geteilter Tag.** `posts.entry_id`
ist `not null unique` — kein Beitrag ohne Tagebucheintrag. Genau daraus
zieht Voria seinen Charakter: der Feed ist ein Nebenprodukt des
Tagebuchs, keine eigene Bühne. Deshalb gibt es keinen „Posten"-Knopf.

Ein direkter Beitragseditor mit Kategoriewahl kehrt das um. Dann gibt
es zwei Sorten Inhalt, zwei Wege sie zu schreiben, und die Frage
„warum steht das nicht in meinem Log" bei jedem Beitrag.

Drei Möglichkeiten:

1. **Nicht bauen.** Wer etwas teilen will, schreibt einen Tag und
   stellt ihn öffentlich. Ein Satz Begleittext geht im Teilen-Dialog
   schon heute.
2. **Beitrag legt still einen Tag an.** Nach außen ein Post-Editor,
   innen entsteht ein Eintrag mit heutigem Datum. Das Modell bleibt
   heil, die Bedienung fühlt sich wie Instagram an.
3. **Zweite Inhaltsart** mit `posts.entry_id` nullable. Ehrlichste
   Umsetzung deines Wunsches, aber der größte Eingriff — und Voria
   wäre danach eine andere App.

Mein Vorschlag ist 2. Kategorien lassen sich unabhängig davon
ergänzen (`posts.category`), das ist kleine Arbeit.

---

## 4e. Leute mit @ erwähnen

Baut auf den Kommentaren auf, geht aber auch in Beitragstexten. Nötig:

* Beim Tippen von `@` Vorschläge aus `profiles` — braucht die
  Personensuche aus 4b
* Erwähnungen beim Speichern auflösen und als IDs ablegen, nicht als
  Text. Sonst zeigt eine Erwähnung ins Leere, wenn jemand seinen
  Benutzernamen ändert
* Anzeige als Verweis auf `/u/[benutzername]`
* Offene Frage: Benachrichtigungen? Die gibt es in Voria noch gar
  nicht — das wäre ein eigenes Stück samt Tabelle und Ungelesen-Zähler

---

## 5. Vergangene Tage schreiben — klein

Die Route `/log/[reiseId]/[datum]` kann das bereits, `tagSichern()`
legt den Tag zum übergebenen Datum an. Auf der Reiseseite steht aber
nur „Heute schreiben" mit `heuteAlsDatum()`. Es fehlt ein Datumswähler.

Dabei mitnehmen: „Heute schreiben" erscheint derzeit **immer**, auch
wenn für heute schon ein Tag existiert — dann steht er doppelt in der
Liste.

---

## 6. Bearbeiten-Seite ist hartcodiert Deutsch

`src/features/log/ReiseBearbeiten.tsx` nutzt kein i18n: „Name der
Reise", „Erster Tag", „Länder", „Übernehmen" stehen als Klartext im
Code. Bei englischer Oberfläche bricht das mitten in der App in
Deutsch um. Die Schlüssel müssen in `de.ts` und `en.ts`.

---

## 7. Jahres-Gruppierung in /log

Die Übersicht ist eine flache Liste, sortiert nach Startdatum. Ab
etwa dreißig Reisen wird das ein langer Scroll ohne Halt. Überschriften
pro Jahr würden reichen.

Nebenbei: `ladeReisen()` holt über `entries(id)` sämtliche Eintrags-IDs
aller Reisen, nur um sie zu zählen. Funktioniert, lädt aber mit den
Jahren immer mehr mit. Ein `count` in der Abfrage wäre sauberer.

---

## 8. Gemeinsame Reisen

Entschieden: ja. Noch nicht angefangen. Braucht eine Tabelle für
Mitreisende und eine Erweiterung aller Zugriffsregeln auf `trips`,
`entries` und `blocks` — derzeit hängt alles an `user_id = auth.uid()`.
Das ist der Eingriff mit der größten Reichweite in diesem Dokument.

---

## 9. Preismodell einbauen, PRO deaktiviert

Entschieden: Gerüst jetzt, PRO abgeschaltet. Also eine Stelle, die
Grenzen kennt, ohne sie schon durchzusetzen.

---

## Erledigt

* Build-Abbruch durch `next/headers` in einer Client-Komponente
* Navigation ungestaltet — styled-jsx scopet `<Link>` nicht
* Kein Klick funktionierte — Service Worker lieferte JavaScript aus
  altem Build, Hydration brach lautlos ab
* „Neue Reise" ohne Wirkung — fehlendes Profil, Fremdschlüssel,
  verschluckter Fehler
* Profil entsteht jetzt per Trigger, nicht nach dem `signUp`
* Fremde öffentliche Reisen erschienen in „Deine Reisen", auf der
  Karte, im Rückblick und in der Reise-Zählung
* Titel und Ort eines Tages ohne `revalidatePath` — gespeichert, aber
  nirgends sichtbar
* Deployment auf Vercel, Adresse jetzt aus `VERCEL_URL` statt
  festverdrahtetem localhost
