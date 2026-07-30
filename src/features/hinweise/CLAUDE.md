# features/hinweise

Benachrichtigungen. Vier Arten, mehr sollen es nicht werden.

| Datei | Zweck |
|---|---|
| `queries.ts` | Liste laden, Ungelesene zählen |
| `actions.ts` | Abhaken, Schalter setzen |
| `HinweisListe.tsx` | Die Liste |
| `HinweisSchalter.tsx` | Die vier Schalter samt Stillem Modus |
| `AlsGelesen.tsx` | Hakt nach dem Rendern ab |

## Regeln hier

**Ereignisse ja, Verhalten nein.** Eine Antwort, ein neuer Follower, ein
geteilter Tag — das sind Ereignisse. Eine gerissene Serie, ein Fortschritt,
ein „du warst lange nicht da" wären Verhalten. Dafür gibt es kein Feld, und es
soll keins geben.

**Hinweise entstehen nur per Trigger.** `0008_hinweise.sql` legt sie an. Es
gibt bewusst **keine `insert`-Regel** auf `notifications` — niemand soll sich
selbst oder anderen Hinweise schreiben können.

**Der Schalter wird beim Schreiben geprüft, nicht beim Anzeigen.** Ein Hinweis,
den niemand sehen will, soll gar nicht erst entstehen. Folge davon, und sie ist
gewollt: Wer den Stillen Modus ausschaltet, bekommt keinen Stapel nachgereicht,
sondern fängt sauber an.

**Der Stille Modus überschreibt, er löscht nicht.** Eigene Spalte in
`profiles`, die drei Einzelschalter bleiben unberührt. In der Oberfläche werden
sie ausgegraut und nicht auf „aus" gestellt — man soll sehen, wohin man
zurückkehrt.

**Ein Punkt, keine Zahl.** Wie viele es genau sind, ändert nichts an dem, was
man tut. Eine wachsende Zahl drängt.

## Zwei Fallen, die schon zugeschnappt sind

**Fremdschlüssel benennen.** `notifications` zeigt zweimal auf `profiles`
(`user_id` und `actor_id`). Ohne `profiles!notifications_actor_id_fkey`
antwortet PostgREST mit `HTTP 300` / `PGRST201` — lautlos, wie beim Feed am
29.07.

**Nicht während des Renderns schreiben.** `hinweiseGelesen()` in der
Server-Komponente aufzurufen lehnt Next.js ab, `revalidatePath` dort erst
recht. Der Build merkt nichts davon, weil die Seite dynamisch ist und beim
Bauen nie läuft. Deshalb `AlsGelesen.tsx`.
