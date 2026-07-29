# Voria auf Vercel bringen

Reihenfolge einhalten. Schritt 4 vor Schritt 5, sonst funktioniert die
Registrierung auf der Live-Seite nicht.

---

## 0. Meinen Fehlversuch wegräumen

Ich habe versucht, das Git-Repo aus meiner Linux-Umgebung anzulegen.
Das ging schief: auf dem Windows-Laufwerk darf ich keine Dateien
löschen, deshalb liegt dort eine Sperrdatei, die Git blockiert.

Einmal aufräumen, dann ist der Ordner sauber:

```powershell
cd "C:\Users\Admin1\Documents\Privat\CODING\AVORA _ VORA\voria"
Remove-Item -Recurse -Force .git
```

Der Rest passiert unter Windows, dort funktioniert Git normal.

---

## 1. Repo anlegen und prüfen

```powershell
git init -b main
git add -A
```

**Vor dem Commit die Sicherheitsprüfung.** In `.env.local` steht der
`SUPABASE_SERVICE_ROLE_KEY` — der umgeht jede Zugriffsregel. Landet er
auf GitHub, kann jeder alle Daten aller Nutzer lesen und löschen.

```powershell
git status --short | Select-String "env"
```

Erwartet ist **nur** `.env.local.example`. Steht dort `.env.local` ohne
`.example`, nicht committen — dann greift `.gitignore` nicht und wir
schauen erst nach.

Wenn es passt:

```powershell
git commit -m "Voria: Reisetagebuch, Stand vor dem ersten Deploy"
```

---

## 2. Auf GitHub schieben

Du hast das Repo schon. Adresse einsetzen:

```powershell
git remote add origin https://github.com/DEIN-NAME/DEIN-REPO.git
git push -u origin main
```

Verlangt Git nach Zugangsdaten: nimm die GitHub CLI (`gh auth login`)
oder einen Personal Access Token. Ein Passwort direkt eintippen
funktioniert bei GitHub seit Jahren nicht mehr.

---

## 3. Vercel-Projekt anlegen

1. [vercel.com/new](https://vercel.com/new) → GitHub-Repo importieren
2. Framework wird als **Next.js** erkannt — nichts umstellen
3. Build Command, Output Directory, Install Command: **leer lassen**
4. **Noch nicht auf Deploy klicken.** Erst Schritt 4.

Wenn du schon deployed hast: kein Problem, Variablen eintragen und
unter *Deployments* neu bauen lassen.

---

## 4. Umgebungsvariablen eintragen

Vercel → Projekt → **Settings** → **Environment Variables**.
Alle vier für *Production*, *Preview* und *Development* setzen.

| Name | Wert | Anmerkung |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://….supabase.co` | Adresse, kein Geheimnis |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_…` | darf im Browser landen |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci…` | **geheim**, nie mit `NEXT_PUBLIC_` |
| `STORAGE_DRIVER` | `supabase` | |

Die Werte stehen in deiner örtlichen `.env.local`.

`NEXT_PUBLIC_SITE_URL` brauchst du **nicht**. Ich habe
`src/lib/site-url.ts` dafür angelegt: die Adresse kommt sonst aus
`VERCEL_PROJECT_PRODUCTION_URL` bzw. `VERCEL_URL`, die Vercel selbst
setzt. Das ist wichtig für Vorschau-Deployments — die haben bei jedem
Push eine andere Adresse, die eine fest eingetragene Variable nie
treffen könnte. Erst wenn du eine eigene Domain hast, trägst du sie
hier ein.

> `NEXT_PUBLIC_SUPABASE_URL` wird auch **beim Bauen** gelesen, nicht
> nur zur Laufzeit: `next.config.ts` baut daraus die erlaubten
> Bildquellen. Fehlt sie beim Build, werden alle Fotos aus Supabase
> vom Bild-Optimierer blockiert.

Danach: **Deploy**.

---

## 5. Supabase auf die neue Adresse einstellen

Ohne diesen Schritt schickt die Registrierung Bestätigungslinks nach
`localhost` — auf dem Handy führt das ins Leere.

Supabase Dashboard → **Authentication** → **URL Configuration**:

**Site URL**

```
https://DEIN-PROJEKT.vercel.app
```

**Redirect URLs** (alle drei eintragen)

```
https://DEIN-PROJEKT.vercel.app/auth/callback
https://DEIN-PROJEKT-*.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

Die mittlere Zeile mit dem Sternchen deckt die Vorschau-Deployments ab,
die dritte behält deine örtliche Entwicklung am Leben.

---

## 6. Ist die Datenbank schon bereit?

Ja. Migrationen leben in Supabase, nicht im Deployment — `0001` bis
`0004` hast du dort bereits ausgeführt. Vercel ändert daran nichts.

Zur Kontrolle im SQL Editor:

```sql
select
  (select count(*) from auth.users)                        as konten,
  (select count(*) from profiles)                          as profile,
  (select count(*) from pg_trigger
    where tgname = 'voria_auth_nutzer_angelegt')           as trigger_da;
```

`konten` und `profile` müssen gleich sein, `trigger_da` muss `1` sein.

---

## 7. Nach dem Deploy prüfen

In dieser Reihenfolge, weil jeder Punkt auf dem vorigen aufbaut:

1. `/registrieren` mit einer zweiten E-Mail — kommt die Bestätigungsmail
   und zeigt der Link auf die Vercel-Adresse, nicht auf localhost?
2. Seitenleiste: stehen dort die Initialen und nicht `?`
   → wenn `?`, fehlt das Profil, siehe Schritt 6
3. `/log/neu` → Reise anlegen → landet sie in der Übersicht?
4. Einen Tag öffnen, Titel eintippen, Seite neu laden → hält der Titel?
5. Auf dem Handy öffnen und *Zum Startbildschirm hinzufügen* —
   das ist der Punkt, an dem sich die PWA beweist

---

## 8. Wenn nach einem Deploy nichts mehr reagiert

Die Seite sieht normal aus, aber kein Knopf tut etwas: dann liefert der
Service Worker JavaScript aus einem alten Build. Der Fix dagegen ist in
`public/sw.js` drin und die Version steht auf `v3`, aber ein bereits
installierter alter Worker hält sich zäh.

Chrome DevTools → **Application** → **Service Workers** → *Unregister*,
dann **Storage** → *Clear site data*, neu laden.

Die ausführliche Erklärung steht in `START.md`.
