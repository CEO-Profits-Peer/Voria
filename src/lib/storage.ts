/**
 * Speicherschicht — bewusst austauschbar.
 *
 * Der Rest der App kennt nur `storage`. Ob dahinter Supabase Storage
 * oder Cloudflare R2 steckt, entscheidet eine Umgebungsvariable.
 *
 * Warum: R2 verlangt eine hinterlegte Kreditkarte, Supabase nicht.
 * Für Entwicklung und die ersten Nutzer reicht Supabase (1 GB, rund
 * 3.300 komprimierte Fotos). Sobald echte Mengen anfallen, lohnt der
 * Wechsel zu R2 wegen der fehlenden Egress-Gebühren — dann wird
 * STORAGE_DRIVER umgestellt und sonst nichts.
 *
 * Regel: Kein Code außerhalb dieser Datei importiert einen
 * Storage-Client direkt.
 */

export type StorageDriver = 'supabase' | 'r2';

export interface UploadTarget {
  /** URL, an die der Browser die Datei direkt schickt. */
  url: string;
  /** Felder, die dem Upload beigelegt werden müssen (nur bei R2 belegt). */
  fields?: Record<string, string>;
  /** Schlüssel, unter dem die Datei liegt — kommt in die Datenbank. */
  key: string;
}

export interface Storage {
  /** Signierte URL zum Hochladen, gültig für wenige Minuten. */
  createUploadTarget(key: string, contentType: string): Promise<UploadTarget>;
  /** Öffentliche Leseadresse für einen Schlüssel. */
  publicUrl(key: string): string;
  remove(key: string): Promise<void>;
}

const DRIVER = (process.env.STORAGE_DRIVER ?? 'supabase') as StorageDriver;

/** Ablageort: fotos/<nutzer>/<jahr>/<uuid>.<endung> */
export function photoKey(userId: string, id: string, ext: 'avif' | 'webp' | 'jpg') {
  return `fotos/${userId}/${new Date().getFullYear()}/${id}.${ext}`;
}

export function thumbKey(userId: string, id: string) {
  return `fotos/${userId}/thumbs/${id}.avif`;
}

/**
 * Ablageort für Profilbilder: fotos/<nutzer>/avatar/<uuid>.<endung>
 *
 * Der Pfad MUSS mit `fotos/<nutzer-id>/` beginnen — genau darauf prüft
 * die Schreibregel des Buckets in 0002_storage.sql. Ein Pfad wie
 * `avatare/<nutzer>/…` würde von der Datenbank abgelehnt.
 *
 * Die UUID im Namen ist wichtig: schriebe jeder sein Bild immer nach
 * `avatar.avif`, würde der Browser das alte aus seinem Cache zeigen,
 * teils tagelang. Neues Bild, neuer Name, kein Cache-Problem.
 */
export function avatarKey(userId: string, id: string, ext: 'avif' | 'webp' | 'jpg') {
  return `fotos/${userId}/avatar/${id}.${ext}`;
}

// ---------------------------------------------------------------
// Supabase Storage — Standard, keine Kreditkarte nötig
// ---------------------------------------------------------------

const SUPABASE_BUCKET = 'photos';

const supabaseStorage: Storage = {
  async createUploadTarget(key) {
    const { createServiceClient } = await import('./supabase-server');
    const supabase = createServiceClient();

    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .createSignedUploadUrl(key);

    if (error) throw new Error(`Upload-URL fehlgeschlagen: ${error.message}`);
    return { url: data.signedUrl, key };
  },

  publicUrl(key) {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return `${base}/storage/v1/object/public/${SUPABASE_BUCKET}/${key}`;
  },

  async remove(key) {
    const { createServiceClient } = await import('./supabase-server');
    const supabase = createServiceClient();
    const { error } = await supabase.storage.from(SUPABASE_BUCKET).remove([key]);
    if (error) throw new Error(`Löschen fehlgeschlagen: ${error.message}`);
  },
};

// ---------------------------------------------------------------
// Cloudflare R2 — später, wenn die Mengen es rechtfertigen
// ---------------------------------------------------------------

const r2Storage: Storage = {
  async createUploadTarget() {
    throw new Error(
      'R2 ist noch nicht eingerichtet. STORAGE_DRIVER auf "supabase" lassen, ' +
        'oder R2-Zugangsdaten in .env.local eintragen und diese Datei vervollständigen.',
    );
  },
  publicUrl(key) {
    return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;
  },
  async remove() {
    throw new Error('R2 ist noch nicht eingerichtet.');
  },
};

export const storage: Storage = DRIVER === 'r2' ? r2Storage : supabaseStorage;
export const activeDriver = DRIVER;
