import Link from 'next/link';
import { Rechtsseite, Platzhalter } from '@/features/marketing/Rechtsseite';

export const metadata = {
  title: 'Impressum · Voria',
  /* Rechtsseiten gehören nicht in den Index einer Suchmaschine. */
  robots: { index: false, follow: true },
};

/**
 * Impressum — GERÜST, noch ohne Daten.
 *
 * Die Struktur folgt § 5 DDG (bis 2024 § 5 TMG) und § 18 Abs. 2 MStV.
 * Ich bin kein Anwalt: Das hier ist die Form, nicht die Rechtsberatung.
 * Vor dem ersten echten Nutzer muss jemand darüberschauen, der das
 * beurteilen darf.
 */
export default function ImpressumSeite() {
  return (
    <Rechtsseite titel="Impressum" stand="Gerüst, noch nicht ausgefüllt">
      <p className="warnung">
        <strong>Diese Seite ist noch nicht ausgefüllt.</strong> Sie steht
        hier als Gerüst, damit die Verweise nicht ins Leere führen. Vor dem
        Start muss jede eckige Klammer ersetzt und der Text von jemandem
        geprüft werden, der dazu befugt ist.
      </p>

      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        <Platzhalter>Vor- und Nachname oder Firmenname</Platzhalter>
        <br />
        <Platzhalter>Straße und Hausnummer</Platzhalter>
        <br />
        <Platzhalter>Postleitzahl und Ort</Platzhalter>
        <br />
        <Platzhalter>Land</Platzhalter>
      </p>

      <h2>Kontakt</h2>
      <p>
        E-Mail: <Platzhalter>adresse@example.com</Platzhalter>
        <br />
        Telefon: <Platzhalter>optional, nur wenn vorhanden</Platzhalter>
      </p>

      <h2>Umsatzsteuer-Identifikationsnummer</h2>
      <p>
        <Platzhalter>USt-IdNr. gemäß § 27 a UStG — entfällt bei Kleinunternehmern</Platzhalter>
      </p>

      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>
        <Platzhalter>Name und vollständige Anschrift</Platzhalter>
      </p>

      <h2>Streitschlichtung</h2>
      <p>
        Die Europäische Kommission stellt eine Plattform zur
        Online-Streitbeilegung bereit. Zur Teilnahme an einem
        Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle sind
        wir <Platzhalter>nicht verpflichtet und nicht bereit / bereit</Platzhalter>.
      </p>

      <p className="zurueck">
        <Link href="/">Zurück zur Startseite</Link> ·{' '}
        <Link href="/datenschutz">Datenschutzerklärung</Link>
      </p>
    </Rechtsseite>
  );
}
