/**
 * Voria — Service Worker.
 *
 * Warum das früh kommt und nicht später: Ein Reisetagebuch wird genau
 * dann benutzt, wenn kein Netz da ist. Abends im Hostel, im Zug, auf
 * einer Fähre. Eine App, die dann eine Fehlerseite zeigt, hat versagt.
 *
 * ============================================================
 * WAS HIER SCHON EINMAL SCHIEFGEGANGEN IST — bitte lesen
 * ------------------------------------------------------------
 * Vorher wurden Skripte und Stylesheets „erst Cache, dann Netz"
 * bedient. Das hat nach einem neuen Build die ganze App lahmgelegt:
 *
 *   * Die Seiten sahen normal aus (HTML und CSS kamen frisch)
 *   * Aber React ist nie hydriert
 *   * Also tat kein einziger Klick etwas — keine Knöpfe, keine
 *     Auswahlfelder, keine Umschalter
 *   * Es funktionierte nur noch, was ohne JavaScript geht, also
 *     das reine <form action=…> beim Anlegen einer Reise
 *   * Keine Fehlermeldung. Nicht in der Konsole, nicht im Terminal.
 *
 * Nachweisbar war es nur daran, dass an den DOM-Knoten die
 * React-Schlüssel (__reactFiber / __reactProps) fehlten. Nach
 * Abmelden des Service Workers und Leeren der Caches war sofort
 * alles in Ordnung.
 *
 * Ursache ist die Bauart: Ein Service Worker, der Build-Artefakte
 * „erst Cache" ausliefert und seinen Cache über eine handgepflegte
 * Konstante versioniert, kann HTML aus Build B mit JavaScript aus
 * Build A mischen. Diese Mischung bricht die Hydration — lautlos,
 * weil React den Abbruch nur intern behandelt.
 *
 * DESHALB GILT HIER:
 *
 *   Skripte und Stylesheets  erst Netz, dann Cache
 *
 * Solange Netz da ist, gewinnt immer der aktuelle Build. Der Cache
 * ist nur das Sicherheitsnetz für offline. Geschwindigkeit kostet
 * das nichts: alles unter /_next/static/ ist inhaltsgehasht und wird
 * mit `immutable` ausgeliefert — dafür ist der Browser-Cache da, der
 * Service Worker muss es nicht zusätzlich tun.
 *
 * Fotos und Schriften bleiben „erst Cache". Die ändern sich unter
 * ihrer Adresse nie, da ist es richtig.
 * ============================================================
 *
 * Schreibende Anfragen werden NICHT abgefangen. Ein stiller Fehlschlag
 * beim Speichern wäre schlimmer als eine sichtbare Fehlermeldung.
 */

const VERSION = 'voria-v3';
const HUELLE = `${VERSION}-huelle`;
const SEITEN = `${VERSION}-seiten`;
const BILDER = `${VERSION}-bilder`;

const IMMER_DA = ['/offline', '/manifest.webmanifest', '/icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(HUELLE)
      // Einzeln, damit eine fehlende Datei nicht die ganze
      // Installation scheitern lässt.
      .then((c) => Promise.all(IMMER_DA.map((u) => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((namen) =>
        Promise.all(namen.filter((n) => !n.startsWith(VERSION)).map((n) => caches.delete(n))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const anfrage = e.request;

  // Schreibendes nie abfangen.
  if (anfrage.method !== 'GET') return;

  const url = new URL(anfrage.url);

  // Fremde Ursprünge außer Bildern in Ruhe lassen.
  const istBild = anfrage.destination === 'image' || /\.(avif|webp|jpe?g|png)$/i.test(url.pathname);
  if (url.origin !== self.location.origin && !istBild) return;

  // Anmeldung und API immer frisch — nie aus dem Cache.
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) return;

  if (istBild) {
    e.respondWith(cacheZuerst(anfrage, BILDER, 300));
    return;
  }

  // Schriften: unter ihrer Adresse unveränderlich, also Cache zuerst.
  if (anfrage.destination === 'font') {
    e.respondWith(cacheZuerst(anfrage, HUELLE, 40));
    return;
  }

  /*
   * Skripte und Stylesheets: NETZ ZUERST.
   *
   * Nicht umstellen auf „Cache zuerst", auch wenn es schneller
   * aussieht. Siehe die Erklärung ganz oben — genau das hat die
   * Hydration zerstört.
   */
  if (anfrage.destination === 'script' || anfrage.destination === 'style') {
    e.respondWith(netzZuerstMitCache(anfrage, HUELLE, 160));
    return;
  }

  if (anfrage.mode === 'navigate') {
    e.respondWith(seiteNetzZuerst(anfrage));
    return;
  }
});

/** Für Dinge, die sich unter ihrer Adresse nie ändern. */
async function cacheZuerst(anfrage, name, grenze) {
  const speicher = await caches.open(name);
  const treffer = await speicher.match(anfrage);
  if (treffer) return treffer;

  try {
    const antwort = await fetch(anfrage);
    if (antwort.ok) {
      // Bewusst awaited: sonst rennt das Aufräumen gegen das Schreiben.
      await speicher.put(anfrage, antwort.clone());
      await aufraeumen(name, grenze);
    }
    return antwort;
  } catch {
    return Response.error();
  }
}

/**
 * Für Build-Artefakte: online gewinnt immer der aktuelle Build,
 * offline rettet der Cache.
 */
async function netzZuerstMitCache(anfrage, name, grenze) {
  const speicher = await caches.open(name);

  try {
    const antwort = await fetch(anfrage);
    if (antwort.ok) {
      await speicher.put(anfrage, antwort.clone());
      await aufraeumen(name, grenze);
    }
    return antwort;
  } catch {
    const treffer = await speicher.match(anfrage);
    return treffer ?? Response.error();
  }
}

/** Seiten: aktuell, aber offline lesbar. */
async function seiteNetzZuerst(anfrage) {
  const speicher = await caches.open(SEITEN);
  try {
    const antwort = await fetch(anfrage);
    if (antwort.ok) await speicher.put(anfrage, antwort.clone());
    return antwort;
  } catch {
    const treffer = await speicher.match(anfrage);
    if (treffer) return treffer;
    const ersatz = await caches.match('/offline');
    return ersatz ?? new Response('Offline', { status: 503 });
  }
}

/** Ältestes zuerst wegwerfen, damit der Speicher nicht unbegrenzt wächst. */
async function aufraeumen(name, grenze) {
  const speicher = await caches.open(name);
  const schluessel = await speicher.keys();
  if (schluessel.length <= grenze) return;
  for (const k of schluessel.slice(0, schluessel.length - grenze)) {
    await speicher.delete(k);
  }
}
