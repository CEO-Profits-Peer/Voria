# Voria starten — vollständige Anleitung

Ziel: `npm run build` läuft durch, `npm start` liefert die echte UI auf
http://localhost:3000.

---

## Warum kein Klick funktionierte (Service Worker)

Im Browser getestet und bestätigt: **React hydrierte nicht.** An den
DOM-Knoten fehlten `__reactFiber` und `__reactProps`. Folge: kein
Knopf, kein Auswahlfeld, kein Umschalter tat etwas. Nur was ohne
JavaScript geht, funktionierte — das reine `<form action={…}>` beim
Anlegen einer Reise. Deshalb ging „Neue Reise", aber „Übernehmen" auf
der Bearbeiten-Seite nicht.

Keine Fehlermeldung. Nicht in der Konsole, nicht im Terminal.

Ursache: `public/sw.js` lieferte Skripte und Stylesheets „erst Cache,
dann Netz" aus und versionierte seinen Cache über eine handgepflegte
Konstante. Nach einem neuen Build mischt das HTML aus Build B mit
JavaScript aus Build A — und diese Mischung bricht die Hydration, weil
React den Abbruch nur intern behandelt.

Nachweis: Service Worker abgemeldet, Caches geleert, neu geladen →
React-Schlüssel sofort da, „Übernehmen" speicherte auf Anhieb.

Behoben: Skripte und Stylesheets laufen jetzt **erst Netz, dann
Cache**. Online gewinnt immer der aktuelle Build, offline rettet der
Cache. Geschwindigkeit kostet das nichts — alles unter
`/_next/static/` ist inhaltsgehasht und wird mit `immutable`
ausgeliefert, dafür ist der Browser-Cache da. Fotos und Schriften
bleiben „erst Cache", die ändern sich unter ihrer Adresse nie.
Zusätzlich precacht der Worker keine HTML-Seiten mehr — genau daraus
entstand die Mischung.

**Nicht zurückdrehen auf „Cache zuerst" für Skripte**, auch wenn es in
Messungen schneller aussieht. Der Kommentar oben in `sw.js` erklärt es.

Wenn du je wieder erlebst, dass die App aussieht wie immer, aber
nichts reagiert: Chrome DevTools → Application → Service Workers →
*Unregister*, dann Storage → *Clear site data*.

---

## Warum die Oberfläche ungestaltet aussah

Der Build war in Ordnung. Der Fehler saß tiefer und war unsichtbar:
**kein Build-Fehler, keine Warnung, keine Konsolenmeldung.**

Im laufenden Browser stand am Element:

```html
<nav class="jsx-b2772584a0f2df3a leiste">   ← Regel greift
<a   class="ziel">                          ← Regel greift NICHT
```

Im CSS-Bundle steht `.ziel.jsx-b2772584a0f2df3a`. Der zweite Teil fehlt
am Element, also passt der Selektor nie.

**Grund:** styled-jsx hängt seine Scope-Klasse nur an JSX-Elemente mit
kleinem Anfangsbuchstaben — echte DOM-Elemente wie `<nav>` oder `<span>`.
Importierte Komponenten mit großem Anfangsbuchstaben (`<Link>` aus
next/link) bekommen sie **nicht**.

In `AppShell.tsx` war jedes Navigationsziel ein `<Link>`. Deshalb war
genau die Navigation ungestaltet, während die Karte daneben normal
aussah — die besteht aus `<div>` und `<p>`.

Betroffen waren 9 Regeln in 4 Dateien:

| Datei | Regel | Behebung |
|---|---|---|
| `ui/AppShell.tsx` | `.neu`, `.ziel`, `.chip`, `.unten-ziel` | → `src/styles/huelle.css`, Präfix `vo-` |
| `ui/Bausteine.tsx` | `.karte` | → `src/styles/verweise.css` als `.vo-eintragskarte` |
| `features/auth/AuthFormular.tsx` | `.vergessen` | → `form :global(a.vergessen)` |
| `features/log/Tagesansicht.tsx` | `.zurueck` | → `.kopf :global(a.zurueck)` |

`features/marketing/Startseite.tsx` war schon richtig — dort stand
bereits `:global(a.anlegen)`.

**Zwei Regeln fürs Weiterbauen:**

1. Gestaltest du einen `<Link>` (oder eine andere importierte
   Komponente) im `<style jsx>`-Block, musst du `:global()` benutzen
   **und** über ein natives Elternelement scopen:
   `.kopf :global(a.zurueck) { … }`
2. Ist der `<Link>` selbst das Wurzelelement der Komponente, gibt es
   kein Elternelement zum Scopen. Dann gehören die Stile in eine echte
   CSS-Datei unter `src/styles/` mit Präfix `vo-`.

Dagegen gibt es jetzt einen Wächter:

```powershell
npm run pruefe:stile     # findet ungescopete Regeln
npm run pruefen          # typecheck + pruefe:stile
```

Der lief vorher nicht — deshalb ist es niemandem aufgefallen.

---

## Was kaputt war (jetzt behoben)

**1. Der Build-Abbruch — `next/headers` im Browser-Bundle**

`WeltRaster.tsx` beginnt mit `'use client'`, hat aber `landName` aus
`queries.ts` importiert. `queries.ts` importiert `supabase-server.ts`,
das wiederum `next/headers` importiert. Damit landete Server-Code im
Browser-Bundle → Build-Stopp. (Die Fehlermeldung redet von `pages/`,
das ist irreführend — ein `pages/`-Verzeichnis gibt es hier gar nicht.)

Behoben durch Aufteilung:

| Datei | Rolle |
|---|---|
| `src/features/karte/typen.ts` | **neu** — Typen + `landName`, client-sicher |
| `src/features/karte/queries.ts` | nur noch Server (`ladeWelt`), re-exportiert die Typen |
| `src/features/karte/WeltRaster.tsx` | importiert jetzt aus `./typen` |

**Regel für die Zukunft:** eine `'use client'`-Datei darf niemals — auch
nicht über drei Ecken — etwas importieren, das `next/headers` zieht.
Reine Typen (`import type`) sind unkritisch, die verschwinden beim
Kompilieren. Server Actions (`'use server'`) sind ebenfalls erlaubt.

**2. Typfehler, die den Build danach gestoppt hätten**

- `src/i18n/de.ts` — `as const` erzeugte Literaltypen, wodurch `en.ts`
  wortwörtlich die deutschen Sätze hätte enthalten müssen (~200 Fehler).
  Jetzt weitet der Typ `Weiten<T>` auf `string`, die Schlüssel bleiben
  aber erzwungen.
- `src/lib/supabase-server.ts`, `src/middleware.ts` — Cookie-Parameter
  hatten implizit `any`. Jetzt explizit typisiert.
- `src/features/log/Tagesansicht.tsx` — `id` doppelt im Objekt-Spread.

`npx tsc --noEmit` läuft jetzt fehlerfrei durch.

---

## Schritt für Schritt

### 0. Einmalig: verirrte Lockfile löschen

In `C:\Users\Admin1\` liegt eine `package-lock.json`, die zu keinem
Projekt gehört. Next hat deshalb den Benutzerordner für die Projektwurzel
gehalten. In `next.config.ts` ist das schon abgefangen
(`outputFileTracingRoot`), sauberer ist trotzdem:

```powershell
Remove-Item "C:\Users\Admin1\package-lock.json"
```

### 1. Ins Projekt wechseln

```powershell
cd "C:\Users\Admin1\Documents\Privat\CODING\AVORA _ VORA\voria"
```

### 2. Sauber neu installieren

Der `.next`-Ordner enthält noch den kaputten Cache von vorhin.

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm install
```

> Die Meldung *„12 high severity vulnerabilities"* betrifft
> Unterabhängigkeiten von Build-Werkzeugen, nicht den ausgelieferten
> Code. **Nicht** `npm audit fix --force` ausführen — das setzt Next
> auf eine ältere Version zurück und bricht das Projekt.

### 3. Typen prüfen (schnell, vor dem langen Build)

```powershell
npm run typecheck
```

Erwartete Ausgabe: nichts. Keine Ausgabe = kein Fehler.

### 4. Produktionsbuild

```powershell
npm run build
```

Erwartet: eine Tabelle aller Routen (`/log`, `/karte`, `/feed`, `/du`, …)
und `✓ Compiled successfully`.

### 5. Starten

```powershell
npm start
```

Dann im Browser: **http://localhost:3000**

Beenden mit `Strg + C`.

---

## Wichtig: `npm start` vs. `npm run dev`

| | `npm run dev` | `npm start` |
|---|---|---|
| Braucht vorher `npm run build` | nein | **ja, zwingend** |
| Erster Seitenaufruf | 3–15 s (kompiliert live) | sofort |
| Codeänderung sichtbar | automatisch | erst nach neuem Build |
| Was du siehst | dieselbe UI, nur langsamer | die echte Auslieferung |

**Zum Beurteilen der UI nimm `npm start`.** Die Ruckler und
Ladezeiten, die du im Dev-Modus gesehen hast, sind Artefakte des
Kompilierens im Hintergrund und existieren in der echten App nicht.

Wenn `npm start` mit *„Could not find a production build"* abbricht:
Schritt 4 wurde übersprungen oder ist fehlgeschlagen.

---

## Zugang zur App

Alles unter `/log`, `/karte`, `/feed`, `/du` ist durch die Middleware
geschützt und leitet ohne Anmeldung auf `/anmelden` um.

Beim ersten Start:

1. `/registrieren` — Benutzername (klein, 3–24 Zeichen), E-Mail, Passwort
   (mind. 10 Zeichen).
2. Supabase schickt eine Bestätigungsmail. Solange die nicht bestätigt
   ist, kommst du nicht rein.
   - Umgehen für den Test: Supabase Dashboard → **Authentication** →
     **Providers** → **Email** → *Confirm email* **aus**schalten.
3. `/anmelden`, dann `/log/neu` — erste Reise anlegen. `/karte` und
   `/rueckblick` sind vorher leer, das ist so gewollt.

---

## Wenn etwas klemmt

**Weiterhin ein `next/headers`-Fehler bei einer anderen Datei**
Die betroffene `'use client'`-Datei importiert einen *Wert* aus einem
Server-Modul. Zwei Auswege: entweder `import type { … }` daraus machen
(falls nur ein Typ gebraucht wird), oder den Helfer wie bei
`karte/typen.ts` in eine eigene, server-freie Datei ziehen.

**`Error: SUPABASE_SERVICE_ROLE_KEY fehlt in .env.local`**
`.env.local` wird nur beim Start gelesen. Server stoppen, starten.

**Port 3000 belegt**

```powershell
npx next start -p 3001
```

**Build hängt oder verhält sich merkwürdig**

```powershell
Remove-Item -Recurse -Force .next, node_modules
npm install
npm run build
```
