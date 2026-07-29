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
| `datum.ts` | Drei Datumshilfen, bewusst ohne Bibliothek |

## Regeln hier

**Ein Inhaltsmodell, zwei Darstellungen.** `blocks` trägt `position` (Reihenfolge)
und Layout (x, y, w, h, rotation, z). Ruhiger Modus liest die Reihenfolge,
Open Space das Layout. Niemals zwei Strukturen bauen.

**Kein Speichern-Knopf.** Text wird 900 ms nach der letzten Eingabe gesichert.
Keine Rückmeldung, kein Zeichenzähler, keine Wortzahl.

**Keine Gamification.** Kein Streak, kein Fortschritt, keine Ermahnung.

**Griffe im Open Space:** 26 px sichtbar, 44 px Trefferfläche über `::after`.
Drehen und Skalieren sind bewusst Zwei-Hand-Gesten — siehe ENTSCHEIDUNGEN.md.
