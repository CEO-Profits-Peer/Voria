# Voria — Karte des Projekts

Reisetagebuch für Browser und App. Diese Datei zuerst lesen, dann gezielt weiter.

> Voria ist der Ort, an dem jemand in zehn Jahren sitzt und nachliest, wie sich sein Leben angefühlt hat.

## Wo liegt was

| Ordner | Inhalt |
|---|---|
| `src/app/` | Nur Routen. Absichtlich dünn — keine Logik hier |
| `src/features/log/` | Reisen, Tage, Blöcke, beide Schreibmodi, Fotos |
| `src/features/social/` | Feed, Beiträge, Votes, Folgen, Kommentare |
| `src/features/hinweise/` | Benachrichtigungen und der Stille Modus |
| `src/features/pro/` | Der PRO-Streifen und seine Regeln |
| `src/features/tutorial/` | Die Führung für neue Nutzer |
| `src/features/export/` | Archiv, lesbare Reisen, gesetzter Bogen |
| `src/features/profile/` | Profil und Einstellungen mit Regionen-Vorschau |
| `src/features/auth/` | Anmeldung, Registrierung, Sitzung |
| `src/features/marketing/` | Öffentliche Startseite |
| `src/ui/` | Design-System-Komponenten. Kennt keine Fachlogik |
| `src/themes/` | Länder-zu-Regionen-Zuordnung |
| `src/styles/` | `tokens.css` · `regions.css` · `seiten.css` · `globals.css` |
| `src/lib/` | supabase, storage, exif, bild |
| `supabase/migrations/` | Datenmodell und Zugriffsregeln |

Jeder Ordner unter `features/` hat eine eigene `CLAUDE.md`. Für Arbeit an einem
Bereich reicht diese Datei plus die des Bereichs — nicht den ganzen Baum lesen.

## Tiefer nachlesen

- `docs/GESAMTBESCHREIBUNG.md` — Produkt, Markt, Phasen
- `docs/ENTSCHEIDUNGEN.md` — was warum entschieden wurde.
  **Vor einer Diskussion hier nachsehen**, damit Geklärtes nicht neu verhandelt wird

## Regeln, die nicht verhandelbar sind

**Komponenten lesen nur semantische Tokens.** Kein Hex-Wert, keine Primitive
(`--neutral-500`) direkt im Komponentencode. Erlaubt: `--surface-*`,
`--content-*`, `--accent-*`, `--border-*`, `--space-*`, `--radius-*`,
`--size-*`, `--motion-*`, `--font-*`, `--leading-*`, `--tracking-*`,
`--weight-*`, `--state-*`.

**Ein Theme ändert Atmosphäre, niemals Struktur.** Eine Region darf genau elf
Slots setzen (`regions.css`, Kopfkommentar). Abstände, Anordnung, Größen,
Navigationsposition und Radien sind global. Wer in Marokko sucht, findet alles
dort, wo es in Norwegen stand.

**Ein Inhaltsmodell, zwei Darstellungen.** `blocks` trägt Reihenfolge *und*
Layout. Ruhiger Modus nutzt die Reihenfolge, Open Space das Layout. Niemals
zwei getrennte Strukturen bauen.

**Zugriffsrechte liegen in Postgres**, nicht in der Oberfläche. Jede neue
Tabelle bekommt Row Level Security. `createServiceClient()` umgeht sie —
nur für Aufgaben ohne Nutzerbezug, nie in einer Route, die Nutzerdaten
ausliefert.

**Keine Gamification — aber Hinweise sind erlaubt.** Die Trennlinie läuft
zwischen Ereignis und Verhalten. Ein roter Punkt für „jemand hat geantwortet"
ist in Ordnung; Streaks, Abzeichen, Fortschrittsanzeigen und „mehr als letztes
Jahr" bleiben verboten. Wer drei Wochen nichts schreibt, wird nicht ermahnt.

Alles Hinweisende ist einzeln abschaltbar, dazu ein **Stiller Modus** als
Sammelschalter. Er überschreibt die Einzeleinstellungen und löscht sie nicht —
beim Ausschalten steht alles wieder wie vorher.

**Kein Speichern-Knopf.** Der Entwurf bleibt liegen und wird verzögert
gesichert. Kein Zeichenzähler, keine Wortzahl.

**Dateien bleiben unter etwa 200 Zeilen.** Wird eine länger, teilen.

## Was Voria von der Konkurrenz unterscheidet

Drei Dinge. Wenn eine Änderung eines davon schwächt, ist sie falsch.

1. **Zwölf Regionen-Themes** aus Material, Licht und Handwerk — nicht Flaggen
   und Landesfarben. Kein Wettbewerber hat das.
2. **EXIF-Automatik.** Fotos hineinwerfen, Tage und Orte stehen da. Niemand
   tippt ab, was das Telefon längst weiß.
3. **Das Soziale ist wirklich optional.** Der Log ist vollständig ohne Feed.

## Starten

```bash
npm install
npm run dev
```

Voraussetzung: `.env.local` mit den Supabase-Werten und die Migration aus
`supabase/migrations/0001_init.sql` im SQL Editor ausgeführt.

Der Speicher-Bucket in Supabase muss `photos` heißen und öffentlich lesbar sein.

## Migrationen

In dieser Reihenfolge im Supabase SQL Editor ausführen:

1. `0001_init.sql` — neun Tabellen, Zugriffsregeln, Trigger
2. `0002_storage.sql` — Foto-Bucket samt Schreibregeln
3. `0003_suche.sql` — deutscher Volltextindex über Einträge
4. `0004_profil_trigger.sql` — Profil entsteht beim Registrieren
5. `0005_leute_suchen.sql` — Trigramm-Indizes für die Personensuche
6. `0006_kommentare.sql` — Kommentare und ihre Stimmen
7. `0007_leute_unscharf.sql` — Personensuche mit Tippfehlertoleranz
8. `0008_hinweise.sql` — Benachrichtigungen, Trigger, vier Schalter
9. `0009_start_und_rueckmeldung.sql` — Startbereich und Rückmeldungen
10. `0010_pro_design.sql` — Voria PRO: Design, Material, Bewegung
11. `0011_gelesen.sql` — Gelesen-Merker und der Feed als Funktion
12. `0012_stimmen_schuetzen.sql` — Spaltenrechte auf `posts`
13. `0013_abos.sql` — Abonnements. **Keine Schreibregel**, nur der
    Webhook darf hinein
14. `0014_pro_streifen.sql` — wann der PRO-Hinweis zuletzt stand
15. `0015_tutorial.sql` — Stand der Führung für neue Nutzer
16. `0016_geteilte_region.sql` — geteilte Beiträge zeigen ihr Theme

**Row Level Security kennt keine Spalten.** Wer eine Zeile bearbeiten
darf, darf jede Spalte darin bearbeiten — also auch einen Zähler, den
ein Trigger pflegt. Für jede Tabelle mit einem solchen Zähler gehört
deshalb `revoke update … from authenticated` plus ein `grant update
(spalte)` auf genau die inhaltlichen Felder dazu. Steht so bei
`comments` (0006), `notifications` (0008) und `posts` (0012).

**Jede Migration muss wiederholbar sein.** Der Supabase-Editor führt
ein Skript als **eine Transaktion** aus: Scheitert die Prüfung am Ende,
wird alles zurückgerollt — die Funktion, die Tabelle, die Regel. Nur
`create type` überlebt das in manchen Fassungen. Beim zweiten Versuch
stand dann „type already exists", und man kam gar nicht mehr weiter.

Deshalb ohne Ausnahme: `if not exists` an Tabellen, Spalten und
Indizes, `create or replace` an Funktionen, `drop … if exists` vor
Regeln und Triggern, und Typen in einem `do`-Block mit Prüfung. Indizes
brauchen dafür einen **Namen** — ohne den vergibt Postgres bei jedem
Lauf einen neuen.

**Zwei Migrationen legen den Feed lahm, wenn sie fehlen:** `0006`
(der Feed fragt `comments(count)` mit ab) und `0011` (`ladeFeed` ruft
die Funktion `feed_laden`). In beiden Fällen wird der Fehler geloggt,
sichtbar ist nur eine leere Seite.

## Sprache

Zweisprachig über `src/i18n/`. Cookie `voria-sprache`, kein Routensegment.

- Server-Komponenten: `const { t, locale } = await texte()` aus `@/i18n/server`
- Client-Komponenten: `const { t, locale } = useT()` aus `@/i18n/Sprachraum`

**Kein sichtbarer Text direkt im Code.** Neue Texte zuerst in `de.ts`,
dann in `en.ts` — TypeScript erzwingt, dass beide dieselben Schlüssel haben.

## Typografie — die wichtigste Regel

**Drei Rollen, streng getrennt.** Wer das verwechselt, macht die App sofort altmodisch.

| Rolle | Schrift | Wo |
|---|---|---|
| `--font-ui` | Inter | Navigation, Knöpfe, Felder, Etiketten, Metazeilen, Zähler |
| `--font-text` | Literata | Tagebuchtext. Nur dort, wo gelesen wird |
| `--font-display` | wechselnd | Titel und Überschriften. Regionen-Slot |

Die Grundschrift des `<body>` ist die **Bedienschrift**. Inhalt setzt sie ausdrücklich
auf `--font-text` zurück. Wenn du irgendwo `font-family: var(--font-text)` schreibst,
muss dort etwas stehen, das gelesen und nicht bedient wird.

**Maße der Bedienoberfläche:** Navigationszeilen 34 px · Knöpfe 34/40 px ·
Bedientext 12–14 px · Metazeilen 11 px in Versalien · Radien 7 px.
Berührungsziele am Handy bleiben trotzdem ≥ 44 px — sichtbare Größe und
Trefferfläche sind zwei verschiedene Dinge.

## Bewegung

`src/styles/bewegung.css` hält die wiederverwendbaren Bewegungen:
`.eintritt` (gestaffelt, Log) · `.eintritt-feed` (schnell) ·
`.dialog-grund` / `.dialog-blatt` · `.foto-auf` · `.modus-wechsel`.

Log 400 ms, Feed 200 ms. Nie Bounce, nie Feder. Alles unter
`prefers-reduced-motion` abgeschaltet.

## Klassennamen

Komponenten dürfen keine Klasse so nennen wie eine globale in `seiten.css`
(`.seite`, `.raster`, `.mittig`, `.strom`, `.zahlen`, `.formular`, `.anlegen`,
`.rund`, `.still`). Das ist schon zweimal passiert und kostete beide Male Zeit.

## Stand

Phase 0 und Phase 1 gebaut, dazu ein Teil von Phase 2 und 3.

**Offene Aktionen:** vollständig in `ANSTEHEND.md`.

**Steht:** Tokens · alle zwölf Regionen hell und dunkel · Anmeldung ·
Reisen anlegen und bearbeiten · Länder verwalten · Tage · ruhiger Modus ·
Open Space mit Aufheben und Ablegen · Foto-Strecke mit EXIF und
Komprimierung · Foto-Vollansicht mit Wischen · Teilen in drei Stufen ·
Feed mit Votes · Beitragsdetail · fremde Profile mit Folgen ·
Volltextsuche · „Deine Welt" · Profil · Einstellungen mit
Regionen-Vorschau · Startseite · Offline über Service Worker ·
installierbar als App · Fehler-, Lade- und Offline-Seiten.

**Fehlt:** Beiträge melden · Erwähnungen · Repost · gemeinsame Reisen ·
Export · Offline-Schreiben · Fotobuch-Druck · Preisseite und
Bezahlung. Voria PRO hat seit dem 31.07. eine erste Materialschicht
und ein Design (Nordlicht & Polarnacht) — `istPro()` liefert aber
weiterhin immer `false`, also ist noch niemand PRO.

**Ungeprüft:** Der Code ist syntaktisch und strukturell geprüft, aber
noch nie ausgeführt worden. Beim ersten `npm run dev` sind Nachbesserungen
an den Supabase-Typen zu erwarten.
