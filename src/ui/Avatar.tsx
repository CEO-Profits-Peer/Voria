/**
 * Profilbild — oder die Initialen, wenn keines da ist.
 *
 * Eine Komponente für alle Stellen: Feed, Suche, Seitenleiste, Profil.
 * Vorher stand der Initialen-Kreis drei Mal getrennt im Code
 * (`.vo-avatar`, `.person-avatar`, und im Feed gar nicht) — mit den
 * Bildern wären daraus drei Stellen geworden, die auseinanderlaufen.
 *
 * Bewusst KEIN next/image: die Bilder sind quadratisch und maximal
 * 256 px, der Optimierer hätte hier nichts zu tun und würde nur einen
 * Umweg über den Server einbauen. Fotos im Feed nutzen weiter FotoBild.
 *
 * Kein 'use client' — die Komponente hat keinen Zustand. Damit
 * funktioniert sie auch in Server-Komponenten wie dem App-Layout.
 * Deshalb liegen die Stile in verweise.css statt in einem
 * <style jsx>-Block.
 */

import { bildUrl } from '@/lib/bild-url';

export function Avatar({
  bild,
  name,
  groesse = 40,
}: {
  /** Speicherschlüssel aus profiles.avatar_url, oder null. */
  bild?: string | null;
  /** Für die Initialen und als Alternativtext. */
  name: string;
  groesse?: number;
}) {
  const initialen = name.trim().slice(0, 2) || '?';

  return (
    <span
      className="vo-avatar-kreis"
      style={{ width: groesse, height: groesse, fontSize: Math.round(groesse * 0.38) }}
      data-bild={Boolean(bild)}
    >
      {bild ? (
        // Alt bleibt leer: der Name steht in jedem Fall daneben, eine
        // Wiederholung wäre für Screenreader nur Lärm.
        <img src={bildUrl(bild)} alt="" width={groesse} height={groesse} loading="lazy" />
      ) : (
        <span aria-hidden>{initialen}</span>
      )}
    </span>
  );
}
