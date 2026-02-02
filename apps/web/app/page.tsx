import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirection vers la page publique
  redirect('/produits');
}
