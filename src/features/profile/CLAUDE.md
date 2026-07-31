# features/profile

Profil und Einstellungen.

`Einstellungen.tsx` enthält die Regionen-Vorschau: alle zwölf Welten zum
Ausprobieren, bevor man dort war. Das ist bewusst ein Schaufenster und kein
Formular — es ist oft das Erste, was ein neuer Nutzer anschaut.

## Konto löschen

`kontoActions.ts` / `KontoLoeschen.tsx`. Der einzige Vorgang in Voria, der
sich nicht rückgängig machen lässt. Bestätigung durch Abtippen des eigenen
Benutzernamens, **serverseitig geprüft** — im Browser wäre der Vergleich nur
eine Höflichkeit. Erst die Dateien löschen (`storage.removeAllUnder`), dann
das Konto (`auth.admin.deleteUser`, räumt per Kaskade den Rest weg). Schlägt
das Löschen der Dateien fehl, bricht der Vorgang ab — ein halb gelöschtes
Konto ist schlimmer als ein bestehendes.

## Voria PRO — Aussehen

`ProWahl.tsx` / `proActions.ts`. Zeigt ein echtes Blatt statt einer
Merkmalsliste. Zwei Ebenen, unabhängig voneinander:

* **Material** (`pro_material`) — Goldfolie, feineres Papier, Prägung.
  Nimmt die Farbe der jeweiligen Region auf, ersetzt sie nicht.
* **Design** (`pro_design`) — ersetzt die Region vollständig, hält sich aber
  an dieselben elf Slots. Bisher nur `nordlicht`; weitere kommen als eigene
  Enum-Werte in einer neuen Migration dazu, siehe Kommentar in
  `0010_pro_design.sql`.

**Die Werte werden gesetzt, unabhängig davon, ob `istPro()` gerade wahr
ist.** So bleibt die Wahl erhalten, wenn ein Abo ausläuft und später wieder
beginnt. Sichtbar wird sie ausschließlich über `proAussehen()` in
`src/lib/plan.ts` — das ist die einzige Stelle, die beides zusammenführt.

`proWahlSetzen()` prüft den Feldnamen gegen eine feste Liste, bevor er in die
Abfrage geht. Ohne das ließe sich über den Parameter jede Spalte von
`profiles` beschreiben, nicht nur die drei PRO-Felder.

Styling liegt nicht hier, sondern in `src/styles/pro-designs.css` —
Komponenten setzen nur `data-pro-material` und `data-pro-design`.
