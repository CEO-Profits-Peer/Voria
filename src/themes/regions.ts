/**
 * Zuordnung Land → Region.
 *
 * Jedes Land gehört genau einer der zwölf Regionen an. Ein einzelnes Land kann
 * später ein eigenes Theme bekommen, das die Region überschreibt — diese Tabelle
 * bleibt dann der Rückfallwert.
 *
 * Länder ohne Eintrag fallen auf `neutral` zurück (kein Theme, Basis-Tokens).
 */

export const REGIONS = [
  'nordeuropa',
  'alpen',
  'mittelmeer',
  'maghreb',
  'ostafrika',
  'naherOsten',
  'suedasien',
  'suedostasien',
  'ostasien',
  'ozeanien',
  'anden',
  'nordamerikaWest',
] as const;

export type Region = (typeof REGIONS)[number];
export type RegionOrNeutral = Region | 'neutral';

/**
 * Anzeigenamen stehen im Wörterbuch unter `regionen`, weil sie
 * übersetzbar sein müssen. Diese Tabelle bleibt als Rückfall für
 * Stellen ohne Sprachkontext (Protokolle, Fehlermeldungen).
 */
export const REGION_LABELS: Record<Region, string> = {
  nordeuropa: 'Nordeuropa & Skandinavien',
  alpen: 'Alpen & Mitteleuropa',
  mittelmeer: 'Mittelmeer',
  maghreb: 'Nordafrika & Maghreb',
  ostafrika: 'Ostafrika',
  naherOsten: 'Naher Osten',
  suedasien: 'Südasien',
  suedostasien: 'Südostasien',
  ostasien: 'Ostasien',
  ozeanien: 'Ozeanien',
  anden: 'Anden & Südamerika',
  nordamerikaWest: 'Nordamerika West & Polar',
};

/** ISO-3166-1 alpha-2 → Region. */
const COUNTRY_TO_REGION: Record<string, Region> = {
  // Nordeuropa & Skandinavien
  NO: 'nordeuropa', SE: 'nordeuropa', FI: 'nordeuropa', DK: 'nordeuropa',
  IS: 'nordeuropa', EE: 'nordeuropa', LV: 'nordeuropa', LT: 'nordeuropa',
  IE: 'nordeuropa', GB: 'nordeuropa', FO: 'nordeuropa',

  // Alpen & Mitteleuropa
  DE: 'alpen', AT: 'alpen', CH: 'alpen', LI: 'alpen', CZ: 'alpen',
  SK: 'alpen', PL: 'alpen', HU: 'alpen', SI: 'alpen', NL: 'alpen',
  BE: 'alpen', LU: 'alpen', FR: 'alpen', RO: 'alpen', BG: 'alpen',
  UA: 'alpen', BY: 'alpen', MD: 'alpen',

  // Mittelmeer
  IT: 'mittelmeer', ES: 'mittelmeer', PT: 'mittelmeer', GR: 'mittelmeer',
  HR: 'mittelmeer', ME: 'mittelmeer', AL: 'mittelmeer', MT: 'mittelmeer',
  CY: 'mittelmeer', RS: 'mittelmeer', BA: 'mittelmeer', MK: 'mittelmeer',
  TR: 'mittelmeer',

  // Nordafrika & Maghreb
  MA: 'maghreb', DZ: 'maghreb', TN: 'maghreb', LY: 'maghreb',
  EG: 'maghreb', MR: 'maghreb', EH: 'maghreb',

  // Ostafrika
  KE: 'ostafrika', TZ: 'ostafrika', UG: 'ostafrika', ET: 'ostafrika',
  RW: 'ostafrika', ZA: 'ostafrika', NA: 'ostafrika', BW: 'ostafrika',
  ZW: 'ostafrika', MZ: 'ostafrika', MG: 'ostafrika', ZM: 'ostafrika',
  SN: 'ostafrika', GH: 'ostafrika', NG: 'ostafrika', ML: 'ostafrika',

  // Naher Osten
  AE: 'naherOsten', SA: 'naherOsten', JO: 'naherOsten', IL: 'naherOsten',
  LB: 'naherOsten', OM: 'naherOsten', QA: 'naherOsten', KW: 'naherOsten',
  BH: 'naherOsten', IR: 'naherOsten', IQ: 'naherOsten', GE: 'naherOsten',
  AM: 'naherOsten', AZ: 'naherOsten', UZ: 'naherOsten', KZ: 'naherOsten',

  // Südasien
  IN: 'suedasien', NP: 'suedasien', LK: 'suedasien', BT: 'suedasien',
  BD: 'suedasien', PK: 'suedasien', MV: 'suedasien', AF: 'suedasien',

  // Südostasien
  TH: 'suedostasien', VN: 'suedostasien', KH: 'suedostasien', LA: 'suedostasien',
  MY: 'suedostasien', ID: 'suedostasien', PH: 'suedostasien', SG: 'suedostasien',
  MM: 'suedostasien', BN: 'suedostasien', TL: 'suedostasien',

  // Ostasien
  JP: 'ostasien', KR: 'ostasien', CN: 'ostasien', TW: 'ostasien',
  HK: 'ostasien', MO: 'ostasien', MN: 'ostasien', KP: 'ostasien',

  // Ozeanien
  AU: 'ozeanien', NZ: 'ozeanien', FJ: 'ozeanien', PF: 'ozeanien',
  WS: 'ozeanien', TO: 'ozeanien', VU: 'ozeanien', NC: 'ozeanien',
  PG: 'ozeanien', SB: 'ozeanien', CK: 'ozeanien',

  // Anden & Südamerika
  PE: 'anden', BO: 'anden', EC: 'anden', CL: 'anden', AR: 'anden',
  CO: 'anden', BR: 'anden', UY: 'anden', PY: 'anden', VE: 'anden',
  GY: 'anden', SR: 'anden', MX: 'anden', GT: 'anden', CR: 'anden',
  PA: 'anden', NI: 'anden', HN: 'anden', SV: 'anden', BZ: 'anden',
  CU: 'anden', DO: 'anden', JM: 'anden',

  // Nordamerika West & Polar
  US: 'nordamerikaWest', CA: 'nordamerikaWest', GL: 'nordamerikaWest',
  SJ: 'nordamerikaWest', AQ: 'nordamerikaWest',
};

/**
 * Region eines Landes. Unbekannte Codes ergeben `neutral` —
 * die App bleibt dann auf den Basis-Tokens, ohne Fehler.
 */
export function regionForCountry(code: string | null | undefined): RegionOrNeutral {
  if (!code) return 'neutral';
  return COUNTRY_TO_REGION[code.toUpperCase()] ?? 'neutral';
}

/**
 * Region einer Reise. Eine Reise kann mehrere Länder berühren —
 * es gewinnt das Land mit den meisten Tagen. Bei Gleichstand das erste.
 *
 * `override` aus der Datenbank schlägt die Berechnung immer.
 */
export function regionForTrip(
  countries: { code: string; days: number }[],
  override?: RegionOrNeutral | null,
): RegionOrNeutral {
  if (override) return override;
  if (countries.length === 0) return 'neutral';

  const byDays = [...countries].sort((a, b) => b.days - a.days);
  return regionForCountry(byDays[0].code);
}
