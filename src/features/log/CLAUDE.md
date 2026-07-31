# features/log

Das Herz von Voria. Reisen, Tage, Blöcke, beide Schreibmodi, Fotos.

## Dateien

| Datei | Zweck |
|---|---|
| `queries.ts` | Lesen. Immer über den normalen Client — RLS entscheidet |
| `actions.ts` | Schreiben. Automatisches Speichern, kein Speichern-Knopf |
| `fotoActions.ts` | Foto eintragen, Block anlegen, Ort aus EXIF setzen |
| `Tagesansicht.tsx` | Wählt zwischen den Modi, trägt das Regionen-Theme |
| `RuhigerModus.tsx` | Die Buchseite. Enthält den leeren ersten Tag (Variante B) |
| `OpenSpace.tsx` | Die freie Fläche mit Aufheben und Ablegen |
| `FotoWaehler.tsx` | Auswahl, EXIF, Komprimierung, Upload |
| `FotoBild.tsx` | Ein Foto mit ruhigem Ladezustand |
| `TagLeiste.tsx` | Foto und Sichtbarkeit — gilt für beide Modi |
| `Tagestitel.tsx` | Der Titel — gilt für beide Modi |
| `datum.ts` | Drei Datumshilfen, bewusst ohne Bibliothek |

## Regeln hier

**Ein Inhaltsmodell, zwei Darstellungen.** `blocks` trägt `position` (Reihenfolge)
und Layout (x, y, w, h, rotation, z). Ruhiger Modus liest die Reihenfolge,
Open Space das Layout. Niemals zwei Strukturen bauen.

**Kein Speichern-Knopf.** Text wird 900 ms nach der letzten Eingabe gesichert.
Keine Rückmeldung, kein Zeichenzähler, keine Wortzahl.

**Erst aufs Gerät, dann ins Netz.** Jeder Anschlag geht sofort nach `entwurf.ts`
in den lokalen Speicher, erst danach läuft die Uhr fürs Sichern. Scheitert das
Sichern — kein Netz, Tab zu, Akku leer —, liegt der Entwurf noch da und wird
beim nächsten Öffnen eingesetzt. Vorher war der Absatz in diesem Fall fort,
ohne Meldung und ohne Spur. Genau der Fall, für den ein Reisetagebuch gebaut
ist: abends im Hostel, kein Netz.

Das ist **keine Synchronisierung**. Zwei Geräte, die denselben Tag offline
ändern, laufen weiterhin auseinander — offene Frage in `ENTSCHEIDUNGEN.md`.

**Keine Gamification.** Kein Streak, kein Fortschritt, keine Ermahnung.

**Was dem TAG gehört, gehört keinem Modus.** Titel, Ort, Foto und Sichtbarkeit
sind Eigenschaften des Tages und müssen in „Seite" **und** „Fläche" erreichbar
sein. Das ist dreimal schiefgegangen — Sichtbarkeit, Foto-Knopf, Titel. Wer
etwas Neues an den Tag hängt: eine Ebene höher bauen, nicht in einen Modus.

**Ruhe heißt nicht unsichtbar.** Der Titel trug `placeholder=""` plus
`::placeholder { color: transparent }`. Gemeint war „keine leere Zeile", das
Ergebnis war ein Feld, das niemand finden konnte. Zurückhaltend gestalten ja —
unauffindbar nein.

**Griffe im Open Space:** 26 px sichtbar, 44 px Trefferfläche über `::after`.
Drehen und Skalieren sind bewusst Zwei-Hand-Gesten — siehe ENTSCHEIDUNGEN.md.
