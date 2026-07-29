# Voria — offene Aktionen

Stand: 28. Juli 2026. Sortiert nach dem, was zuerst blockiert.

---

## A · Bevor irgendetwas läuft

Ohne diese vier Schritte startet die App nicht.

1. **Migrationen einspielen.** Supabase → SQL Editor, in dieser Reihenfolge:
   `0001_init.sql` · `0002_storage.sql` · `0003_suche.sql`
2. **`npm install`** im Projektordner.
3. **`npm run dev`** und `localhost:3000` öffnen.
4. **Erste Fehler melden.** Der Code ist geprüft, aber nie ausgeführt worden.
   Was zuerst auffallen wird, steht unter B.

---

## B · Erwartete Nachbesserungen beim ersten Lauf

Nicht Faulheit, sondern das, was sich ohne laufende Datenbank nicht klären lässt.

**Supabase-Typen erzeugen.** An sechs Stellen steht `any`, weil die generierten
Typen fehlen. `npx supabase gen types typescript --project-id sxktgwnvwmhdrcwbllxc > src/lib/datenbank.ts`,
danach räume ich die Stellen auf. Betrifft `features/social/queries.ts`,
`profilQueries.ts`, `suche/actions.ts`, `karte/queries.ts`, `rueckblick/queries.ts`,
`log/queries.ts`.

**Verschachtelte Abfragen prüfen.** Supabase liefert bei
`select('a, b(c, d(e))')` je nach Beziehung ein Objekt oder ein Array.
Ich habe Objekt angenommen. Wenn Feed oder Rückblick leer bleiben,
liegt es fast sicher hier.

**`service_role`-Schlüssel.** Falls du ihn rotiert hast, muss der neue Wert
in Zeile 19 der `.env.local`.

**Bestätigungs-E-Mail.** In Supabase unter Authentication → URL Configuration
muss `http://localhost:3000/auth/callback` als Redirect erlaubt sein.

---

## C · Produkt: entschieden werden muss

| Thema | Warum es drängt |
|---|---|
| **Preismodell** | Bestimmt, ob Werbeflächen im Feed vorgesehen werden müssen. Je später, desto teurer der Umbau |
| **Domain** | `voria.app`, `voria.travel` oder mit Zusatz. Braucht eine Markenrecherche beim Anwalt, nicht nur eine Websuche |
| **Bleibt „Karte" ein Hauptbereich?** | Wurde von Claude Design vorgeschlagen, nie bewusst entschieden. „Deine Welt" trägt den Platz inzwischen, aber die Frage ist offen |
| **Gemeinsame Reisen** | Mehrere Personen, ein Tagebuch. Ändert das Datenmodell — je früher, desto billiger |
| **Impressum und Datenschutz** | In Deutschland Pflicht, sobald die Seite öffentlich ist |

---

## D · Technik: fehlt noch

**Offline-Konflikte.** Was passiert, wenn zwei Geräte denselben Tag offline
ändern? Aktuell gewinnt der letzte Schreibvorgang. Für ein Tagebuch, das
unterwegs benutzt wird, zu wenig.

**Beiträge melden.** Ein öffentlicher Feed ohne Meldefunktion ist rechtlich
und praktisch nicht haltbar, sobald Fremde posten.

**Benachrichtigungen.** Wer folgt, wer zustimmt. Bewusst zurückgestellt,
weil rote Punkte gegen die Gestaltungsregeln verstoßen — es braucht eine
Form, die nicht drängt.

**Fotos löschen.** Blöcke lassen sich entfernen, die Datei im Speicher bleibt.
Ein Aufräumjob fehlt.

**Rechtschreibung der Reisedauer.** `trip_countries.days` wird beim Anlegen
auf 1 gesetzt und nie berechnet. Sollte sich aus den Einträgen ergeben.

**Bildgrößen im Feed.** `sizes` steht auf einem festen Wert; im Feed sind die
Bilder schmaler als im Log. Kostet unnötig Bandbreite.

---

## E · Oberfläche: noch nicht gebaut

- Zeitleiste nach Wochen und Monaten (nur Tage vorhanden)
- Follower- und Following-Listen als eigene Seiten
- Beitrag aus einem Log-Eintrag heraus erstellen (nur über Teilen-Dialog)
- Entdecken und Suche im Feed
- Passwort zurücksetzen
- Profil bearbeiten: Anzeigename, Beschreibung, Avatar
- Fotos und Speicher in den Einstellungen
- Marketing: Preise, Datenschutz, Impressum

---

## F · Prüfen, was sich nicht am Schreibtisch prüfen lässt

**Open Space auf einem echten Handy.** Das Aufheben und Ablegen ist die
riskanteste Interaktion im Produkt. Sie muss mit dem Daumen im Zug getestet
werden, nicht mit der Maus.

**Literata bei Sonnenlicht.** Zwei Serifenschriften sind eine mutige Wahl.
16 px Fließtext auf einem Handydisplay im Freien — bitte draußen ansehen.

**Kontrast in allen zwölf Regionen.** Ich habe für Maghreb und Ostasien
gerechnet (jeweils rund 5:1). Die anderen zehn sind nach demselben Rezept
gebaut, aber nicht einzeln nachgemessen.

**Fotoaufnahme mit echten Bildern.** Der EXIF-Parser ist selbst geschrieben.
Er muss gegen Aufnahmen von iPhone, Android und einer Kamera laufen.

---

## G · Vor einer Veröffentlichung

1. Anwaltliche Markenrecherche für „Voria"
2. Impressum und Datenschutzerklärung
3. Meldefunktion für Beiträge
4. Aufräumjob für verwaiste Fotos
5. Fehlerprotokollierung, damit Abstürze bei Nutzern sichtbar werden
6. Sicherungskopien der Datenbank einrichten
7. Kostenwarnung bei Supabase, bevor der Free-Tarif reißt (5 GB Ausgang/Monat)

---

## Meine Empfehlung für die nächste Sitzung

**Zuerst A durchziehen und mir sagen, was die Konsole ausgibt.** Alles
Weitere ist Spekulation, solange die App nicht einmal gelaufen ist.

Danach in dieser Reihenfolge: Supabase-Typen erzeugen und die `any` aufräumen ·
Open Space auf dem Handy testen · Profil bearbeiten · Passwort zurücksetzen.
