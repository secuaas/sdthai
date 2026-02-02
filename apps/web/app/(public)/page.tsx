import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Users, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-primary/10 to-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Bienvenue chez SD Thai Food
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Plateforme de commande professionnelle pour les partenaires restaurateurs
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/produits">
                <Button size="lg">Voir les produits</Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Espace partenaire
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter text-center mb-12">
            Pourquoi choisir SD Thai Food ?
          </h2>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Commande simplifiée</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Passez vos commandes en quelques clics depuis votre espace partenaire
              </p>
            </div>
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Support dédié</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Une équipe à votre écoute pour accompagner votre activité
              </p>
            </div>
            <div className="flex flex-col items-center space-y-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Suivi en temps réel</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Suivez l'état de vos commandes en temps réel depuis votre dashboard
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
