# VORIA — Gesamtbeschreibung

Stand: 28. Juli 2026. Dies ist das Leitdokument. Wenn eine andere Datei ihm widerspricht, gilt dieses hier.

---

## 1. Das Produkt

Voria ist ein Reisetagebuch für Browser und App. Menschen schreiben auf, wo sie waren und wie es sich angefühlt hat, legen ihre Fotos dazu und können Einträge freiwillig öffentlich teilen.

> Voria ist der Ort, an dem jemand in zehn Jahren sitzt und nachliest, wie sich sein Leben angefühlt hat.

An diesem Satz wird jede Entscheidung gemessen. Voria ist kein Werkzeug zur Reiseverwaltung und kein soziales Netzwerk mit Reise-Thema.

**Das Unterscheidungsmerkmal:** Jede Weltregion hat ihre eigene Atmosphäre in der Oberfläche — Material, Licht und Handwerk statt Flaggen und Landesfarben. Man blättert durch das Tagebuch und erkennt an der Stimmung, wo man war, bevor man ein Wort gelesen hat.

**Der Wettbewerb:** Polarsteps kann Karten und Tracking, ist gestalterisch aber flach. Day One ist schön und still, aber ohne Reisebezug und ohne Soziales. Instagram hat Reichweite, vernichtet aber Kontext. Voria will die Sorgfalt von Day One, den Reisebezug von Polarsteps und ein soziales Element, das man vollständig ignorieren kann.

---

## 2. Getroffene Entscheidungen

| Thema | Entscheidung | Begründung |
|---|---|---|
| **Name** | Voria | Zwei bis drei Silben, offener Klang. Bestehende Marken liegen in Beratung und Animation, nicht in Consumer-Apps. Sicherer als Vora, das mit einer YC-finanzierten Gesundheits-App in beiden App Stores kollidiert |
| **Plattform** | Web zuerst | Next.js als installierbare Web-App. Später native Hülle über Capacitor — dieselbe Oberfläche, aber echter Offline-Speicher, Fotobibliothek und Store-Präsenz, ohne die UI neu zu bauen |
| **Reihenfolge** | Struktur und Aussehen vor Inhalt | Leere Bereiche sind in Ordnung, aber die App muss überall begehbar sein und gut aussehen |
| **Themes** | Regionen-Engine, 12 Regionen | Länder erben von ihrer Region. Skaliert auf 195 Länder ohne 195 × Designarbeit |
| **Speicher** | Anzeigeversion in der Cloud, Original lokal | AVIF bei 2560 px Kantenlänge ist Faktor 10–15 kleiner und auf jedem Bildschirm identisch |
| **Speicheranbieter** | Cloudflare R2 | Keine Egress-Gebühren — bei einer bildlastigen App der Posten, der andere Anbieter tötet. 10 GB dauerhaft gratis |
| **Geschäftsmodell** | Noch offen | Werbung nur im Social-Feed denkbar, nie im Log. Durch die niedrigen Speicherkosten ist ein Free-Start realistisch |

**Offen und bewusst vertagt:** Preismodell, ob „Karte" ein eigener Hauptbereich bleibt, Domainwahl, Zeitpunkt der nativen App.

---

## 3. Aufbau der App

Vier Hauptbereiche, feste Reihenfolge, unten am Handy und seitlich am Desktop identisch.

**Log** — der Kern. Reisen, Tage, Einträge, Fotos.

**Karte** — Reiserouten und besuchte Länder. Vorläufig, siehe offene Punkte.

**Feed** — das freiwillige Soziale. Beiträge, Upvotes, Folgen.

**Du** — Profil, eigene Reisen, Follower, Einstellungen.

### Die zwei Schreibmodi

Ein Tag kann auf zwei Arten dargestellt werden, und das ist die zentrale Produktidee:

**Ruhig** — eine Buchseite. Eine Textspalte, Fotos als ruhige Blöcke im Fluss, großzügig gesetzt, kaum Bedienelemente. Zum Schreiben am Abend.

**Frei (Open Space)** — ein Schuhkarton. Texte und Fotos frei platzierbar, leicht gedreht, überlappend, auf einer texturierten Fläche. Zum Sammeln und Anordnen.

**Beide zeigen dieselben Daten.** Der Wechsel verliert nichts. Wie das technisch gelöst ist, steht in Abschnitt 5.

---

## 4. Technischer Aufbau

| Schicht | Wahl | Warum |
|---|---|---|
| Oberfläche | Next.js 15, App Router, TypeScript | Eine Codebasis für Handy und Desktop, gute Bildbehandlung, später per Capacitor nativ einpackbar |
| Datenbank & Konten | Supabase (Postgres, Auth, Row Level Security) | Zugriffsrechte liegen in der Datenbank, nicht in der Anwendung — entscheidend für „Full Privacy" |
| Bilder | Cloudflare R2 | Kein Egress, günstig, S3-kompatibel |
| Betrieb | Vercel | Vorschau-Deployments pro Änderung, nichts läuft auf deinem Rechner |
| KI | Gemini API | Später: aus Stichworten Tagestext, Auto-Verschlagwortung, Ortserkennung |
| Später nativ | Capacitor | Bestehende Oberfläche in nativer Hülle |

**Alles beginnt im kostenlosen Tarif.** Supabase, R2 und Vercel haben dauerhafte Gratis-Kontingente, die für Entwicklung und die ersten hundert Nutzer reichen.

---

## 5. Datenmodell

Neun Tabellen. Die wichtigste Entscheidung steht bei `blocks`.

**profiles** — Anzeigename, Benutzername, Beschreibung, Avatar, ob privat.

**trips** — eine Reise. Titel, Zeitraum, Titelbild, Sichtbarkeit, optionale Regionen-Überschreibung.

**trip_countries** — welche Länder eine Reise berührt, mit Datum. Daraus wird die Region abgeleitet.

**entries** — ein Tag. Datum, optionaler Titel, Ort mit Koordinaten, Darstellungsmodus, Sichtbarkeit.

**blocks** — der Inhalt eines Tages. Typ (Text, Foto, Objekt), Reihenfolge, Inhalt oder Foto-Verweis — **und** Position, Größe, Drehung, Ebene.

> **Ein Inhaltsmodell, zwei Darstellungen.** Der ruhige Modus ignoriert die Layout-Felder und rendert die Blöcke der Reihe nach. Der Open Space nutzt sie. Deshalb geht beim Wechsel nie etwas verloren, und deshalb gibt es keine doppelte Datenhaltung. Wer im Open Space etwas verschiebt und in den ruhigen Modus wechselt, sieht denselben Text an derselben Stelle in der Reihenfolge.

**photos** — Verweise auf R2, Maße, Aufnahmezeit, Koordinaten, Blurhash für den Ladezustand, Dateigröße.

**posts** — ein geteilter Eintrag. Ohne Eintrag kein Beitrag.

**votes** und **follows** — das Soziale.

**Zugriffsrechte liegen in Postgres.** Jede Tabelle bekommt Row Level Security. Ein privater Eintrag ist nicht deshalb privat, weil die Oberfläche ihn nicht zeigt, sondern weil die Datenbank ihn nicht herausgibt.

---

## 6. Die Foto-Strecke

Der kostenkritische Teil des Produkts.

1. Nutzer wählt Fotos aus
2. **EXIF wird gelesen** — Datum und Koordinaten. Daraus werden Tag, Ort und Land automatisch vorbelegt. Das ist der eigentliche „smarte" Teil und der größte Wow-Moment
3. Im Browser verkleinern auf 2560 px Kantenlänge und als AVIF kodieren — aus 4 MB werden etwa 300 KB
4. Zusätzlich ein 320-px-Vorschaubild und ein Blurhash
5. Beides über eine signierte URL direkt nach R2, ohne Umweg über den Server
6. **Das Original bleibt auf dem Gerät.** Später optional für zahlende Nutzer mit hochladbar

**Was das kostet:** Rund 200 MB pro aktivem Nutzer und Jahr. Bei 100.000 Nutzern etwa 20 TB, also grob 300 € im Monat. Mit unkomprimierten Originalen wären es mehrere Tausend.

---

## 7. Die Theme-Engine

**Drei Schichten.** Primitive Rohwerte, semantische Tokens, Regionen-Slots. Komponenten dürfen ausschließlich semantische Tokens lesen — kein Hex-Wert und keine Primitive direkt im Komponentencode. Das wird per Lint-Regel erzwungen.

**Elf Slots** darf eine Region setzen:

`accent-primary` · `accent-soft` · `canvas-tint` · `raised-tint` · `texture-base` · `texture-opacity` · `texture-scale` · `texture-blend` · `ornament-divider` · `ornament-corner` · `ornament-tint` · `font-display`

Alles andere ist global: Abstände, Anordnung, Komponentengrößen, Navigationsposition, Radien, Zeilenhöhen, Motion.

> **Ein Theme ändert Atmosphäre, niemals Struktur.** Wer in Marokko sucht, findet alles dort, wo es in Norwegen stand.

**Zwölf Regionen:** Nordeuropa & Skandinavien · Alpen & Mitteleuropa · Mittelmeer · Nordafrika & Maghreb · Ostafrika · Naher Osten · Südasien · Südostasien · Ostasien · Ozeanien · Anden & Südamerika · Nordamerika West & Polar.

Jedes Land wird per statischer Tabelle einer Region zugeordnet. Das Theme hängt am Wurzelelement der Reise oder des Eintrags, nicht global — dadurch kann ein Feed Beiträge aus verschiedenen Regionen nebeneinander zeigen.

**Fertig belegt:** Ostasien und Nordafrika & Maghreb, jeweils hell und dunkel. Die restlichen zehn folgen nach demselben Rezept.

---

## 8. Repo-Struktur

Bewusst so gebaut, dass sich auch in einem großen Projekt schnell orientieren lässt und Änderungen wenig Kontext brauchen.

```
voria/
├─ CLAUDE.md                  Karte des Projekts — immer zuerst lesen
├─ docs/
│   ├─ ARCHITEKTUR.md
│   ├─ DATENMODELL.md
│   ├─ THEMES.md
│   └─ ENTSCHEIDUNGEN.md      jede Entscheidung mit Datum und Begründung
├─ src/
│   ├─ app/                   nur Routen, absichtlich dünn
│   ├─ features/              die eigentliche Logik, nach Fachbereich
│   │   ├─ log/               Reisen, Tage, Blöcke, beide Modi
│   │   ├─ social/            Feed, Beiträge, Votes, Folgen
│   │   ├─ profile/
│   │   └─ auth/
│   ├─ ui/                    Design-System-Komponenten
│   ├─ themes/                zwölf Regionen, je eine Datei
│   ├─ lib/                   supabase, r2, exif, bildverarbeitung
│   └─ styles/tokens.css
└─ supabase/migrations/
```

**Vier Regeln, die den Überblick sichern:**

Jeder Ordner unter `features/` hat eine eigene kurze `CLAUDE.md`, die in fünf Zeilen sagt, was dort liegt und was nicht. Wer an einer Stelle arbeitet, liest nur diese eine Datei statt den halben Baum.

Dateien bleiben unter etwa 200 Zeilen. Wird eine länger, wird sie geteilt.

`ui/` kennt keine Fachlogik und `features/` schreibt kein eigenes CSS. Diese Trennung hält die Theme-Engine zusammen.

`docs/ENTSCHEIDUNGEN.md` hält fest, was warum entschieden wurde. Damit werden geklärte Fragen nicht ein zweites Mal diskutiert — das spart bei jeder späteren Sitzung mehr, als es beim Schreiben kostet.

---

## 9. Phasen

**Phase 0 — Gerüst.** Repo, Tokens, Theme-Engine, Konten, Datenmodell, Deployment. Die App ist überall begehbar, aber leer. *Läuft gerade.*

**Phase 1 — Der Log.** Reisen anlegen, Tage schreiben, Fotos hochladen mit EXIF-Auslesung, beide Modi, die sechzehn wichtigsten Bildschirme.

**Phase 2 — Das Soziale.** Beiträge, Feed, Votes, Folgen, Profile.

**Phase 3 — Breite.** Restliche zehn Regionen, Website, Preismodell, native Hülle.

---

## 10. Was noch fehlt

**Produktentscheidungen:** Preismodell. Ob „Karte" ein eigener Hauptbereich bleibt oder in den Log wandert. Wie Reisen mit mehreren Personen funktionieren.

**Technisch ungeklärt:** Offline-Verhalten im Detail — was passiert, wenn zwei Geräte denselben Tag offline ändern. Der Kaltstart des Feeds. Wie Nutzer gemeldete Inhalte gemeldet und geprüft werden.

**Ideen, die noch nicht eingeplant sind:** Fotobuch-Druck als Umsatzquelle. Jahresrückblick als viraler Anstoß. Gemeinsame Reisen.
