# Voria — Stand und Plan

Stand: 29. Juli 2026, nachts. Ersetzt `OFFENE_AKTIONEN.md`.

---

## Teil 1 · Was fertig ist

**Fundament**
Next.js 15, TypeScript, Supabase mit Zugriffsregeln in Postgres, Speicher über Supabase
(R2 vorbereitet, aber nicht nötig), Offline über Service Worker, installierbar als App.

**Gestaltung**
Alle zwölf Regionen hell und dunkel, Texturen und Ornamente als eingebettetes SVG,
drei Schriftrollen (Bedienung, Text, Titel), Bewegungssystem mit Rücksicht auf
`prefers-reduced-motion`.

**Log**
Reisen anlegen und bearbeiten, Länder verwalten, Tage, ruhiger Modus mit automatischem
Speichern, Open Space mit Aufheben und Ablegen, Fotos mit EXIF-Auslesung und
AVIF-Komprimierung, Vollansicht mit Wischen, Teilen in drei Stufen.

**Sozial**
Feed mit Votes, Beitragsdetail, fremde Profile mit Folgen.

**Weiteres**
Volltextsuche, „Deine Welt", Jahresrückblick, Profil bearbeiten, Passwort zurücksetzen,
Einstellungen mit Regionen-Vorschau, Deutsch und Englisch, Startseite, Fehler- und
Ladeseiten.

**21 Seiten · 80 Dateien · rund 7.900 Zeilen.**

---

## Teil 2 · Was als Nächstes drankommt

### Diese Woche — damit du es überhaupt beurteilen kannst

1. **Eine Reise mit Land `MA` anlegen und einen Tag schreiben.** Ohne Inhalt siehst du
   nichts von dem, was Voria ausmacht.
2. **Supabase-Typen erzeugen** (`npx supabase gen types`) und die sechs `any`-Stellen
   aufräumen. Bis dahin sind Feed und Rückblick nicht typsicher.
3. **Open Space auf einem echten Handy testen.** Die riskanteste Interaktion im Produkt.
4. **Bestätigungs-URL in Supabase eintragen** — sonst läuft die Registrierungs-E-Mail
   ins Leere.

### Nächste zwei Wochen — bevor jemand anderes es sieht

5. Fotos wirklich löschen (Blöcke gehen, Dateien bleiben liegen)
6. Follower- und Following-Listen als eigene Seiten
7. Zeitleiste nach Wochen und Monaten
8. Reisedauer aus den Einträgen berechnen statt fest auf 1
9. Bildgrößen im Feed korrigieren — spart Bandbreite

### Vor einer Veröffentlichung — nicht verhandelbar

10. Anwaltliche Markenrecherche für „Voria"
11. Impressum und Datenschutzerklärung
12. Meldefunktion für Beiträge
13. Fehlerprotokollierung, damit Abstürze bei Nutzern sichtbar werden
14. Sicherungskopien der Datenbank
15. Kostenwarnung bei Supabase (5 GB Ausgang pro Monat im Free-Tarif)

### Später — Produkt, nicht Technik

16. Preismodell entscheiden
17. Offline-Konflikte lösen (zwei Geräte, derselbe Tag)
18. Benachrichtigungen in einer Form, die nicht drängt
19. Gemeinsame Reisen
20. Fotobuch-Druck

---

## Teil 3 · Was noch entschieden werden muss

| Frage | Warum es drängt | Bis wann |
|---|---|---|
| **Preismodell** | Bestimmt, ob Werbeflächen im Feed vorgesehen werden | vor Phase 3 |
| **Domain** | Braucht eine Markenrecherche, nicht nur eine Websuche | vor Veröffentlichung |
| **Bleibt „Karte" ein Hauptbereich?** | Nie bewusst entschieden, nur von Claude Design vorgeschlagen | wenn du sie benutzt hast |
| **Gemeinsame Reisen** | Ändert das Datenmodell — je früher, desto billiger | vor Phase 2 |
| **GitHub-Repo** | Ohne Repo gibt es keine Sicherung und keine Vorschau-Deployments | diese Woche |

---

## Teil 4 · Entscheidungen mit Zeitachse

Die vollständige Begründung steht in `ENTSCHEIDUNGEN.md`. Hier nur der Verlauf,
damit man sieht, wie das Produkt entstanden ist.

**27. Juli — Grundlagen**
Name Voria statt Vora (YC-finanzierte Namensvetterin in beiden App Stores) ·
Web zuerst, native App später über Capacitor · Anzeigefassung in der Cloud,
Original auf dem Gerät · Cloudflare R2 als Ziel, Supabase Storage als Start

**28. Juli — Gestaltung**
Regionen-Engine mit zwölf Regionen · elf Theme-Slots statt zehn ·
ein Inhaltsmodell für beide Schreibmodi · Zugriffsrechte in Postgres ·
leerer erster Tag in Variante B · Drehen und Skalieren als Zwei-Hand-Gesten ·
Open-Space-Fläche zoomt nicht · Texturen als eingebettetes SVG ·
Screens vor Regionen

**28. Juli — Ausbau**
Offline über Service Worker · Teilen pro Tag statt pro Konto ·
die Karte ist keine Karte · Suche als deutscher Volltextindex ·
Jahresrückblick statt Feed-Wachstum · Zweisprachigkeit über Cookie

**28./29. Juli — Oberfläche**
Drei Schriftrollen: Bedienung getrennt vom Inhalt · Maßstab der
Bedienoberfläche verkleinert · Seitenleiste neu gebaut

---

## Teil 5 · Bekannte Fehler, die ich selbst verursacht habe

Damit sie nicht wieder passieren.

**`var()` ohne inneren Rückfallwert.** `var(--font-inter), sans-serif` wird ungültig,
wenn `--font-inter` fehlt — und die Schrift fällt auf den geerbten Wert zurück, also
auf Serife. Richtig ist `var(--font-inter, ui-sans-serif)`. Das hat die ganze
Oberfläche altmodisch aussehen lassen.

**Gestaltung in Media Queries versteckt.** Alle Abstände und Höhen der Seitenleiste
lagen im `@media`-Block. Schlug er fehl, stand die Leiste ungestaltet da. Jetzt steht
die Gestaltung außerhalb, umgeschaltet wird nur die Sichtbarkeit.

**Bildschirmfüllende Textur mit `mix-blend-mode`.** `position: fixed` plus Blend-Modus
zwingt den Browser bei jedem Scrollen zu einem neuen Kompositionsdurchlauf. Das war die
Ursache für die Zähigkeit. Entfernt.

**Klassennamen doppelt vergeben.** `.seite` gab es global und in zwei Komponenten.
Vor jedem neuen Klassennamen in `seiten.css` nachsehen.

**`:root:not([data-region])`** trifft immer, weil `<html>` nie ein `data-region` trägt.
Hat alle Ornamente stillgelegt.
