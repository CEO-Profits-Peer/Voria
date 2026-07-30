/**
 * Die Hülle für Impressum und Datenschutzerklärung.
 *
 * Bewusst außerhalb von `(app)`: Beide Seiten müssen ohne Anmeldung
 * erreichbar sein — genau darum geht es bei einer Pflichtangabe. Sie
 * tragen deshalb auch keine Navigation, nur den Weg zurück.
 *
 * Server-Komponente, deshalb kein styled-jsx. Die Stile stehen als
 * `.rechtsseite` in `src/styles/seiten.css`.
 */

export function Rechtsseite({
  titel,
  stand,
  children,
}: {
  titel: string;
  stand: string;
  children: React.ReactNode;
}) {
  return (
    <main className="seite rechtsseite">
      <h1 className="gross">{titel}</h1>
      <p className="stand">{stand}</p>
      {children}
    </main>
  );
}

/**
 * Eine Stelle, die noch ausgefüllt werden muss.
 *
 * Sichtbar als solche markiert, und zwar mit Absicht: Ein Platzhalter,
 * der aussieht wie eine Angabe, wird irgendwann für eine gehalten.
 * Eckige Klammern sind für jeden Leser eindeutig — auch für den, der
 * die Seite in einem halben Jahr aufschlägt.
 */
export function Platzhalter({ children }: { children: React.ReactNode }) {
  return <span className="platzhalter">[{children}]</span>;
}
