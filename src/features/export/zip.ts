/**
 * Ein ZIP-Archiv bauen — ohne Bibliothek, im Browser.
 *
 * WARUM IM BROWSER UND NICHT AUF DEM SERVER
 *
 * Auf Vercel läuft jede Route in einer Funktion mit begrenztem
 * Arbeitsspeicher und begrenzter Laufzeit. Ein Export mit dreihundert
 * Fotos müsste dort alles gleichzeitig halten und innerhalb weniger
 * Sekunden ausliefern — das geht bei den ersten echten Nutzern gut und
 * scheitert genau dann, wenn jemand viel gesammelt hat. Also bei dem,
 * für den der Export am wichtigsten ist.
 *
 * Im Browser gibt es diese Grenzen nicht, und es passt zu Voria: Fotos
 * werden schon beim Hochladen auf dem Gerät verkleinert. Das Gerät
 * kann das.
 *
 * WARUM OHNE BIBLIOTHEK
 *
 * Ein ZIP ohne Kompression ist ein einfaches Format — Kopf, Daten,
 * Verzeichnis am Ende. Die Fotos sind bereits AVIF oder WebP und
 * lassen sich nicht sinnvoll weiter verkleinern; Deflate darüber
 * kostet Rechenzeit und spart nichts. Damit fällt der einzige Grund
 * für eine Abhängigkeit weg.
 *
 * GRENZE: Kein ZIP64. Das Archiv darf also unter 4 GB bleiben und
 * höchstens 65.535 Einträge haben. Bei einem Reisetagebuch ist beides
 * weit weg — `zipBauen` wirft trotzdem, statt still ein kaputtes
 * Archiv zu liefern.
 */

export interface ZipEintrag {
  name: string;
  daten: Uint8Array;
}

/* ---------- CRC32, wie das Format es verlangt ---------------- */

const CRC_TABELLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c >>> 0;
  }
  return t;
})();

function crc32(daten: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < daten.length; i++) c = CRC_TABELLE[(c ^ daten[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/* ---------- Schreibhilfen ------------------------------------ */

class Puffer {
  private teile: Uint8Array[] = [];
  laenge = 0;

  schreibe(u: Uint8Array) {
    this.teile.push(u);
    this.laenge += u.length;
  }

  /** Vier Bytes, kleinstes zuerst — so will es das Format. */
  u32(n: number) {
    const b = new Uint8Array(4);
    new DataView(b.buffer).setUint32(0, n >>> 0, true);
    this.schreibe(b);
  }

  u16(n: number) {
    const b = new Uint8Array(2);
    new DataView(b.buffer).setUint16(0, n & 0xffff, true);
    this.schreibe(b);
  }

  alsBlob(): Blob {
    return new Blob(this.teile as BlobPart[], { type: 'application/zip' });
  }
}

/**
 * Datum und Uhrzeit im Format von MS-DOS.
 *
 * Ja, wirklich: ZIP speichert Zeitstempel bis heute so, mit
 * Zwei-Sekunden-Auflösung und Jahren ab 1980. Ohne das zeigt jedes
 * Entpackprogramm den 1. Januar 1980 an, und das sieht nach Fehler aus.
 */
function dosZeit(d: Date): { zeit: number; datum: number } {
  return {
    zeit: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
    datum: ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  };
}

export function zipBauen(eintraege: ZipEintrag[]): Blob {
  if (eintraege.length > 0xffff) {
    throw new Error('Zu viele Dateien für ein Archiv ohne ZIP64.');
  }

  const kodierer = new TextEncoder();
  const jetzt = dosZeit(new Date());

  const daten = new Puffer();
  const verzeichnis = new Puffer();
  let anzahl = 0;

  for (const e of eintraege) {
    const name = kodierer.encode(e.name);
    const summe = crc32(e.daten);
    const versatz = daten.laenge;

    if (versatz > 0xffffffff) {
      throw new Error('Archiv über 4 GB — ZIP64 wäre nötig.');
    }

    /* Kopf der Datei */
    daten.u32(0x04034b50);
    daten.u16(20); // benötigte Fassung
    /*
     * Bit 11 setzt „Name ist UTF-8". Ohne das liest Windows Umlaute
     * in Reisetiteln als Zeichensalat — und Reisetitel haben Umlaute.
     */
    daten.u16(0x0800);
    daten.u16(0); // Verfahren 0 = ohne Kompression
    daten.u16(jetzt.zeit);
    daten.u16(jetzt.datum);
    daten.u32(summe);
    daten.u32(e.daten.length);
    daten.u32(e.daten.length);
    daten.u16(name.length);
    daten.u16(0);
    daten.schreibe(name);
    daten.schreibe(e.daten);

    /* Eintrag im Verzeichnis am Ende */
    verzeichnis.u32(0x02014b50);
    verzeichnis.u16(20); // erstellt von
    verzeichnis.u16(20); // benötigt
    verzeichnis.u16(0x0800);
    verzeichnis.u16(0);
    verzeichnis.u16(jetzt.zeit);
    verzeichnis.u16(jetzt.datum);
    verzeichnis.u32(summe);
    verzeichnis.u32(e.daten.length);
    verzeichnis.u32(e.daten.length);
    verzeichnis.u16(name.length);
    verzeichnis.u16(0); // Zusatzfeld
    verzeichnis.u16(0); // Kommentar
    verzeichnis.u16(0); // Datenträger
    verzeichnis.u16(0); // interne Merkmale
    verzeichnis.u32(0); // externe Merkmale
    verzeichnis.u32(versatz);
    verzeichnis.schreibe(name);

    anzahl++;
  }

  const ende = new Puffer();
  ende.u32(0x06054b50);
  ende.u16(0);
  ende.u16(0);
  ende.u16(anzahl);
  ende.u16(anzahl);
  ende.u32(verzeichnis.laenge);
  ende.u32(daten.laenge);
  ende.u16(0);

  return new Blob([daten.alsBlob(), verzeichnis.alsBlob(), ende.alsBlob()], {
    type: 'application/zip',
  });
}
