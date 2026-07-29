/**
 * Die eigene Adresse ermitteln.
 *
 * Gebraucht für Links, die in E-Mails landen — dort hilft ein
 * relativer Pfad nicht, es muss die vollständige Adresse hinein.
 *
 * Vorher stand im Code fest `process.env.NEXT_PUBLIC_SITE_URL ??
 * 'http://localhost:3000'`. Auf Vercel bricht das an zwei Stellen:
 *
 *   * Vergisst man die Variable, verschickt die Produktion Links
 *     nach localhost. Der Nutzer klickt und landet nirgends.
 *   * Vorschau-Deployments haben bei jedem Push eine andere Adresse.
 *     Eine fest eingetragene Variable kann die nie treffen.
 *
 * Deshalb die Reihenfolge unten. Vercel setzt die beiden VERCEL_-
 * Variablen selbst, ohne dass man etwas eintragen muss.
 */

export function seitenUrl(): string {
  // 1. Ausdrücklich gesetzt — gewinnt immer. Für eine eigene Domain.
  const eigen = process.env.NEXT_PUBLIC_SITE_URL;
  if (eigen) return ohneSchrägstrich(mitSchema(eigen));

  // 2. Die stabile Produktionsadresse des Vercel-Projekts.
  const produktion = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (produktion) return ohneSchrägstrich(mitSchema(produktion));

  // 3. Die Adresse dieses einzelnen Deployments — trifft auch Vorschauen.
  const deployment = process.env.VERCEL_URL;
  if (deployment) return ohneSchrägstrich(mitSchema(deployment));

  // 4. Örtliche Entwicklung.
  return 'http://localhost:3000';
}

/** Vercel liefert die Adressen ohne Schema. */
function mitSchema(wert: string): string {
  return /^https?:\/\//.test(wert) ? wert : `https://${wert}`;
}

function ohneSchrägstrich(wert: string): string {
  return wert.replace(/\/+$/, '');
}
