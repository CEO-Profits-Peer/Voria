'use client';

/**
 * Blendet die Scrollleiste aus — nur im Feed.
 *
 * Der Feed lädt endlos nach. Eine Leiste, deren Griff bei jedem
 * Nachladen kleiner wird, behauptet eine Länge, die es nicht gibt; sie
 * ist dort kein Anhaltspunkt mehr, sondern eine Unruhe am Rand.
 *
 * Gescrollt wird weiter ganz normal — Rad, Wischen, Leertaste,
 * Bild-ab und die Tastatur bleiben unberührt. Ausgeblendet ist nur die
 * Anzeige.
 *
 * WARUM EINE KLASSE AM `<html>` UND KEIN CSS AUF DER SEITE
 *
 * Die Leiste gehört dem Sichtfeld, nicht einem Element darin. Ein
 * `overflow: hidden` auf einem Kasten der Seite würde sie nicht
 * treffen. Deshalb wird die Klasse beim Betreten gesetzt und beim
 * Verlassen wieder entfernt — sonst blieben alle anderen Seiten ohne
 * Leiste zurück.
 */

import { useEffect } from 'react';

export function OhneScrollleiste() {
  useEffect(() => {
    document.documentElement.classList.add('ohne-scrollleiste');
    return () => document.documentElement.classList.remove('ohne-scrollleiste');
  }, []);

  return null;
}
