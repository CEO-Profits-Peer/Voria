# features/auth

Anmeldung, Registrierung, Abmeldung.

| Datei | Zweck |
|---|---|
| `actions.ts` | Server Actions, legen bei der Registrierung auch das Profil an |
| `AuthFormular.tsx` | Ein Formular für beide Modi |

Die Sitzung wird in `src/middleware.ts` erneuert — Server Components
dürfen keine Cookies schreiben.

## Regeln hier

**Fehlertexte verraten nicht, ob eine Adresse existiert.** „Diese Kombination
aus E-Mail und Passwort passt nicht."

**Ganze Sätze, keine Ausrufezeichen.**
