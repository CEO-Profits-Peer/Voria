import { redirect } from 'next/navigation';

export default function RueckblickStart() {
  redirect(`/rueckblick/${new Date().getFullYear()}`);
}
