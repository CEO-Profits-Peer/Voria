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

## 3. Free-Modus: mehrere Textfelder — das größte Stück

Im Free-Modus lässt sich derzeit **gar kein** Text anlegen. Der
Plus-Knopf in `OpenSpace.tsx` ruft `aufHinzufuegen`, und in
`Tagesansicht.tsx` steht dahinter `() => setFotoOffen(true)` — er
öffnet also nur den Fotowähler. `OpenSpace` ruft `textSpeichern` nie
auf; vorhandene Textblöcke sind dort verschiebbar, aber nicht
bearbeitbar.

Das Datenmodell kann es schon: `blocks` trägt `kind = 'text'` samt
`x, y, w, h, rotation, z`. Es fehlt die Bedienung.

Zu bauen:

* Text hinzufügen (Plus-Knopf mit Auswahl Text/Foto statt direkt Foto)
* Im Block schreiben, verzögert speichern wie im ruhigen Modus
* Mehrere Textblöcke gleichzeitig, jeder mit eigener Position
* Löschen — die Knöpfe dafür stehen schon in `OpenSpace.tsx`

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
