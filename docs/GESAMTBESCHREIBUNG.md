# VORIA — Gesamtbeschreibung

Stand: 30. Juli 2026 · Live: https://voria-travel.vercel.app

**Dies ist das Leitdokument.** Widerspricht eine andere Datei diesem
hier, gilt dieses. Die Begründung zu jeder einzelnen Festlegung steht
chronologisch in `ENTSCHEIDUNGEN.md`.

Wo welche Information steht:

| Datei | Inhalt |
|---|---|
| `docs/GESAMTBESCHREIBUNG.md` | Produkt, Geschäftsmodell, Aufbau — dieses hier |
| `docs/ENTSCHEIDUNGEN.md` | Warum etwas so ist. Chronologisch, wird nicht neu verhandelt |
| `ANSTEHEND.md` | Was zu tun ist, mit Begründung bei jedem Punkt |
| `FORTSCHRITT.md` | Was fertig ist und was davon geprüft wurde |
| `START.md` | Lokal starten, plus die Fehlerklassen dieses Projekts |
| `DEPLOY.md` | Vercel und Supabase einrichten |

Sechs Dateien, und jede beantwortet genau eine Frage. Es waren
zeitweise neun — `QUEUE.md`, `docs/OFFENE_AKTIONEN.md` und
`docs/STAND_UND_PLAN.md` sind am 30.07. in die übrigen aufgegangen.
Doppelt geführte Listen laufen auseinander, und dann traut man keiner
mehr.

---

## 1. Das Produkt

Voria ist ein Reisetagebuch für Browser und Handy. Menschen schreiben
auf, wo sie waren und wie es sich angefühlt hat, legen ihre Fotos dazu
und können einzelne Tage freiwillig öffentlich teilen.

> Voria ist der Ort, an dem jemand in zehn Jahren sitzt und nachliest,
> wie sich sein Leben angefühlt hat.

An diesem Satz wird jede Entscheidung gemessen. Voria ist kein Werkzeug
zur Reiseverwaltung und kein soziales Netzwerk mit Reise-Thema.

**Das Unterscheidungsmerkmal:** Jede Weltregion hat ihre eigene
Atmosphäre in der Oberfläche — Material, Licht und Handwerk statt
Flaggen und Landesfarben. Man blättert durch das Tagebuch und erkennt
an der Stimmung, wo man war, bevor man ein Wort gelesen hat.

**Der Wettbewerb:** Polarsteps kann Karten und Tracking, ist
gestalterisch aber flach. Day One ist schön und still, aber ohne
Reisebezug und ohne Soziales. Instagram hat Reichweite, vernichtet aber
Kontext. Voria will die Sorgfalt von Day One, den Reisebezug von
Polarsteps und ein soziales Element, das man vollständig ignorieren
kann.

---

## 2. Das angenehme Erlebnis — woraus es sich zusammensetzt

Nicht als Wunschliste, sondern als das, was im Code steckt und woran
man es messen kann.

### Die App drängt nicht

Es gibt keinen Speichern-Knopf. Der Entwurf bleibt liegen, Änderungen
gehen 700 Millisekunden nach dem letzten Anschlag von selbst weg. Es
gibt keine Bestenliste, keinen Fortschrittsbalken, kein „12 von 195
Ländern freigeschaltet", kein „mehr als letztes Jahr". Der Jahresrückblick
zeigt, was war — und bewertet es nicht.

Der Feed hat kein Scroll-Snap. Wer überfliegen will, überfliegt. Wer
springen will, doppelklickt.

### Der erste Bildschirm ist keine leere Fläche

Ein neuer Tag stellt eine einzige leise Frage und bietet den Weg zum
Foto an. Abends fängt man mit einem Bild an, nicht mit einem Satz. Ab
Tag zwei verschwindet die Frage — dann ist die Stille Wohltat statt
Hürde.

### Zwei Arten, denselben Tag zu sehen

**Seite** — eine Buchseite. Eine Textspalte, Fotos als ruhige Blöcke im
Fluss, großzügig gesetzt, kaum Bedienelemente. Zum Schreiben am Abend.

**Fläche** — ein Schuhkarton. Texte und Fotos frei platzierbar, leicht
gedreht, überlappend, auf einer texturierten Fläche. Zum Sammeln und
Anordnen.

Beide zeigen **dieselben Daten**. Der Wechsel verliert nichts.

### Es funktioniert ohne Netz

Ein Reisetagebuch wird genau dann benutzt, wenn kein Netz da ist —
abends im Hostel, im Zug, auf einer Fähre. Eine App, die dann eine
Fehlerseite zeigt, hat versagt.

### Privat ist die Voreinstellung

Jeder Tag ist privat, bis man ihn ausdrücklich teilt. Teilen ist eine
Entscheidung **pro Tag**, nicht pro Konto, und jederzeit zurücknehmbar.
Das ist nicht durch die Oberfläche gesichert, sondern durch Postgres:
ein privater Eintrag ist privat, weil die Datenbank ihn nicht
herausgibt.

### Es ist schnell auf schlechten Verbindungen

Fotos werden auf dem Gerät komprimiert, bevor sie hochgeladen werden —
aus 4 MB werden rund 300 KB, aus einem Profilbild rund 20 KB. Der
EXIF-Parser ist selbst geschrieben und wiegt 3 KB statt 90. Das zählt
genau dort, wo die App benutzt wird.

---

## 3. Geschäftsmodell und Profit-Vision

> Nüchtern vorweg: Die Zahlen unten sind **Annahmen**, keine Prognose.
> Voria hat noch keine Nutzer, kein Preisexperiment und keinen einzigen
> Werbekunden. Ich bin kein Finanzberater — das hier ist
> Produktstrategie, keine Anlageberatung.

### Die Struktur

**Zwei Ebenen, Werbung nur im Feed.**

| | Frei | Pro |
|---|---|---|
| Tagebuch, Fotos, Karte, Rückblick | vollständig | vollständig |
| Werbung im Feed | ja | nein |
| Fotos je Tag | 20 | 200 |
| Preis | 0 € | offen |

**Die eiserne Regel: niemals Werbung im Log.** Das Tagebuch ist der
Ort, an dem jemand über einen gestorbenen Großvater schreibt. Dort
gehört keine Reklame hin, unter keinen Umständen, auch nicht wenn die
Zahlen es nahelegen. Werbung existiert ausschließlich im Feed — dem
Teil, den man vollständig ignorieren kann.

**Kein Verkauf von Nutzerdaten, keine Weitergabe an Werbetreibende.**
Anzeigen werden kontextfrei ausgespielt. Das ist auch praktisch: Voria
hat gar nicht die Datenmenge, aus der sich Zielgruppen bilden ließen,
und der Versuch würde das Versprechen zerstören, auf dem das Produkt
steht.

### Warum das tragen kann

Der übliche Killer bildlastiger Apps ist **Egress** — die Kosten für
ausgehenden Datenverkehr. Zwei Entscheidungen entschärfen das:

1. **Nur die Anzeigefassung liegt in der Cloud.** Bei 100.000 Nutzern
   sind das rund 20 TB statt 250 TB.
2. **Cloudflare R2 hat keine Egress-Gebühren.** Der Umstieg ist
   vorbereitet: der Speicher liegt hinter `src/lib/storage.ts`,
   umgestellt wird über eine Umgebungsvariable.

Heute läuft alles auf Supabase Storage, weil R2 eine Kreditkarte
verlangt. **Was zuerst knapp wird, ist nicht der Speicherplatz, sondern
die 5 GB Egress im Supabase-Free-Tarif.** Das ist der Auslöser für den
Wechsel.

### Die drei Einnahmequellen, nach Nähe zum Produkt sortiert

**1. Pro-Abonnement.** Die ehrlichste Quelle: der Nutzer zahlt, der
Nutzer ist der Kunde. Day One verlangt rund 35 € im Jahr, Polarsteps
rund 15 €. Voria liegt dazwischen — das wäre zu testen, nicht zu
raten.

**2. Werbung im Feed.** Trägt die Freinutzer. Bei der gewählten Dichte
(jede sechste Karte) und ohne Zielgruppendaten sind die Erlöse je
Sichtkontakt niedrig. Das ist der Preis der Entscheidung und bewusst
akzeptiert.

**3. Partnerprogramme mit Reisebezug.** Bahnticket, Rucksack, eSIM,
Versicherung — die Testanzeigen zeigen genau diese Kategorien. Passt
zum Kontext, ohne Nutzerdaten zu brauchen. Muss als Werbung
gekennzeichnet bleiben, auch wenn es sich als Empfehlung tarnen ließe.

### Der Engpass ist nicht Geld, sondern der Kaltstart

**Ein Feed ohne Inhalt ist tot.** Es braucht grob tausend aktive
Schreiber, bevor der soziale Teil sich selbst trägt. Solange muss Voria
als reines Tagebuch überzeugen.

Das heißt aber **nicht**, dass der Feed nebensächlich wäre — die
Unterscheidung ist am 30.07. ausdrücklich richtiggestellt worden. Wer
den Feed nie öffnet, hat ein vollständiges Tagebuch; trotzdem ist der
Feed die Stelle, an der Voria Geld verdient. Beides gilt gleichzeitig.
Kommentare, Reposts und alles, was den Feed lebendig macht, sind also
keine Ablenkung vom Kern — man muss sie nicht nutzen, aber sie müssen
gut sein.

Der geplante Anstoß ist der **Jahresrückblick**: etwas, das man
herzeigen will, entstanden aus dem, was ohnehin da ist. Spotify und
Polarsteps machen damit ihr bestes Marketing, und es verlangt vom
Nutzer keine Verhaltensänderung.

### Was ansteht, bevor Geld fließt

* Bezahlung anbinden — heute gibt `istPro()` immer `false` zurück
* Datenschutzerklärung und Impressum
* Konto vollständig löschen (technisch räumt die Kaskade schon alles
  weg, es fehlt der Knopf)
* Echte Anzeigen statt der Platzhalter in `features/social/werbung.ts`
* `picsum.photos` aus `next.config.ts` entfernen

---

## 4. Aufbau der App

Vier Hauptbereiche, feste Reihenfolge, unten am Handy und seitlich am
Desktop identisch.

**Log** — der Kern. Reisen, Tage, Einträge, Fotos.

**Karte** — „Deine Welt": die zwölf Regionen als Raster. Besuchte
tragen ihr volles Theme, unbesuchte bleiben blass. Bewusst keine
Kachelkarte.

**Feed** — das freiwillige Soziale. Beiträge, Zustimmung, Folgen,
Werbung.

**Du** — Profil, Bild, Zahlen, Einstellungen.

Dazu außerhalb: `/suche` (Tage und Leute), `/rueckblick`,
`/u/[name]` (fremde Profile) und `/b/[id]` (geteilter Beitrag,
öffentlich).

---

## 5. Technischer Aufbau

| Schicht | Wahl | Warum |
|---|---|---|
| Oberfläche | Next.js 15, App Router, TypeScript | Eine Codebasis für Handy und Desktop, später per Capacitor nativ einpackbar |
| Datenbank & Konten | Supabase (Postgres, Auth, RLS) | Zugriffsrechte in der Datenbank, nicht in der Anwendung |
| Bilder | Supabase Storage, R2 vorbereitet | Hinter `src/lib/storage.ts`, umschaltbar über `STORAGE_DRIVER` |
| Betrieb | Vercel | Vorschau je Änderung, nichts läuft lokal |
| Offline | Service Worker | Netz zuerst für Skripte und Seiten, Cache für Fotos und Schriften |
| KI | Gemini API | Später: Tagestext aus Stichworten, Verschlagwortung |

### Das Datenmodell in einem Satz

`trips` → `entries` (ein Tag) → `blocks` (Text oder Foto).
`blocks` trägt **gleichzeitig** `position` für die Seite und
`x, y, w, h, rotation, z` für die Fläche — deshalb verliert der
Moduswechsel nichts.

`posts` hängt an `entries` mit `not null unique`: **ein Beitrag ist ein
geteilter Tag.**

### Drei Regeln, die nicht verhandelbar sind

1. **Jede neue Tabelle bekommt Row Level Security.** Ohne Ausnahme.
2. **Ein Theme ändert Atmosphäre, niemals Struktur.** Sonst wirken
   zwölf Themes wie zwölf Apps.
3. **Kein Code außerhalb von `storage.ts` importiert einen
   Storage-Client.**

---

## 6. Was in diesem Projekt lautlos scheitert

Der wichtigste Abschnitt für jeden, der hier weiterarbeitet. Zwölf
Fehler wurden bisher gefunden — **sieben davon meldeten weder Build
noch Konsole noch Terminal.**

| Falle | Symptom | Prüfung |
|---|---|---|
| styled-jsx scopet `<Link>` nicht | Regel greift nie, Element sieht ungestaltet aus | `npm run pruefe:stile` |
| Verschluckte Datenbankfehler | Formular kommt mit 200 zurück und sagt nichts | `error` immer prüfen und loggen |
| Doppeldeutige Einbettung in PostgREST | `HTTP 300`, Liste bleibt leer | Fremdschlüssel benennen |
| Service Worker mit altem JavaScript | Seite sieht normal aus, kein Klick tut etwas | React-Schlüssel am DOM prüfen |
| Fehlendes `revalidatePath` | Gespeichert, aber nirgends sichtbar | Nach jedem Schreiben mitdenken |
| RLS erlaubt mehr als gemeint | Fremde Daten in „deinen" Listen | `.eq('user_id', …)` trotz RLS |

**Daraus die Arbeitsregel: im Browser nachsehen, nicht dem grünen Build
glauben.**
