import Link from 'next/link';
import { Rechtsseite, Platzhalter } from '@/features/marketing/Rechtsseite';

export const metadata = {
  title: 'Datenschutzerklärung · Voria',
  robots: { index: false, follow: true },
};

/**
 * Datenschutzerklärung — GERÜST.
 *
 * Was hier steht, ist die Bestandsaufnahme dessen, was Voria
 * tatsächlich verarbeitet — das ist der Teil, den ich aus dem Code
 * beantworten kann. Rechtsgrundlagen, Fristen und die Angaben zum
 * Verantwortlichen sind Platzhalter. Ich bin kein Anwalt.
 */
export default function DatenschutzSeite() {
  return (
    <Rechtsseite titel="Datenschutzerklärung" stand="Gerüst, noch nicht geprüft">
      <p className="warnung">
        <strong>Diese Seite ist noch nicht fertig.</strong> Die Aufstellung
        dessen, was Voria verarbeitet, stimmt mit dem Stand des Codes überein.
        Rechtsgrundlagen und Fristen sind Platzhalter und müssen von jemandem
        gesetzt werden, der dazu befugt ist.
      </p>

      <h2>Verantwortlicher</h2>
      <p>
        <Platzhalter>Name und Anschrift wie im Impressum</Platzhalter>
      </p>

      <h2>Welche Daten verarbeitet Voria</h2>

      <h3>Konto</h3>
      <p>
        Bei der Registrierung werden <strong>E-Mail-Adresse</strong> und ein
        verschlüsseltes Passwort gespeichert, dazu ein selbstgewählter
        Benutzername. Die Verwaltung übernimmt Supabase; die Daten liegen auf
        Servern in <Platzhalter>Region der Supabase-Instanz eintragen</Platzhalter>.
      </p>

      <h3>Inhalte</h3>
      <p>
        Tagebucheinträge, Fotos, Orte und Reisedaten speichert Voria so, wie
        sie eingegeben werden. <strong>Einträge sind privat, solange sie nicht
        ausdrücklich geteilt werden</strong> — das ist keine Einstellung der
        Oberfläche, sondern eine Regel in der Datenbank.
      </p>
      <p>
        Aus hochgeladenen Fotos liest Voria <strong>im Browser</strong> die
        EXIF-Daten aus, um Datum und Ort vorzuschlagen. Hochgeladen wird eine
        verkleinerte Fassung.
      </p>

      <h3>Soziales</h3>
      <p>
        Wer einen Tag teilt, macht dessen Inhalt für andere sichtbar.
        Zustimmungen, Kommentare, Folgen und die daraus entstehenden Hinweise
        werden gespeichert, solange das Konto besteht.
      </p>

      <h3>Rückmeldungen</h3>
      <p>
        Der Text einer Rückmeldung wird zusammen mit dem Konto gespeichert,
        von dem sie stammt, sowie mit der Seite, auf der sie abgeschickt wurde.
      </p>

      <h2>Was Voria nicht tut</h2>
      <ul>
        <li>Keine Weitergabe oder kein Verkauf von Nutzerdaten an Dritte.</li>
        <li>
          Keine Werbung im Tagebuch. Anzeigen erscheinen ausschließlich im
          Feed und werden <strong>ohne Nutzerdaten</strong> ausgespielt — es
          gibt keine Zielgruppenbildung und keine Zählpixel.
        </li>
        <li>Kein Tracking über Seiten hinweg, keine Analyse-Skripte.</li>
      </ul>

      <h2>Cookies</h2>
      <p>
        Voria setzt zwei: eines für die <strong>Anmeldung</strong> und eines
        für die <strong>Sprachwahl</strong>. Beide sind technisch notwendig,
        deshalb gibt es kein Zustimmungsfenster. Die Wahl zwischen hellem und
        dunklem Erscheinungsbild liegt im lokalen Speicher des Geräts und
        verlässt es nicht.
      </p>

      <h2>Dienstleister</h2>
      <p>
        <strong>Supabase</strong> — Datenbank, Konten, Dateispeicher.
        <br />
        <strong>Vercel</strong> — Auslieferung der Anwendung.
        <br />
        <Platzhalter>
          Auftragsverarbeitungsverträge und Angaben zur Übermittlung in
          Drittländer ergänzen
        </Platzhalter>
      </p>

      <h2>Deine Rechte</h2>
      <p>
        Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit
        und Widerspruch nach Art. 15 bis 21 DSGVO, dazu das Recht auf
        Beschwerde bei einer Aufsichtsbehörde.
      </p>
      <p>
        <strong>Konto löschen:</strong>{' '}
        <Platzhalter>Weg eintragen, sobald der Knopf gebaut ist</Platzhalter>.
        Beim Löschen des Kontos werden Reisen, Einträge, Fotos, Beiträge,
        Kommentare und Hinweise mitgelöscht.
      </p>

      <h2>Speicherdauer</h2>
      <p>
        <Platzhalter>Fristen je Datenart eintragen</Platzhalter>
      </p>

      <p className="zurueck">
        <Link href="/">Zurück zur Startseite</Link> ·{' '}
        <Link href="/impressum">Impressum</Link>
      </p>
    </Rechtsseite>
  );
}
