import { Startseite } from '@/features/marketing/Startseite';

export const metadata = {
  title: 'Voria — dein Reisetagebuch',
  description:
    'Ein Reisetagebuch, das aussieht wie die Orte, an denen du warst. Schreib auf, wirf deine Fotos hinein — Datum, Ort und Land stehen dann schon da.',
};

/** Angemeldete Besucher schickt die Middleware direkt in den Log. */
export default function Wurzel() {
  return <Startseite />;
}
