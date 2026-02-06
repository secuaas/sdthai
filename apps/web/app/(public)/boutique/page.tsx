import { ExternalLink, ShoppingCart, Clock, Truck } from 'lucide-react';

export default function BoutiquePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-black text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <ShoppingCart className="h-16 w-16 mx-auto mb-6 text-sdblue" />
          <h1 className="font-aclonica text-5xl mb-6">
            Notre Boutique en Ligne
          </h1>
          <p className="text-xl max-w-3xl mx-auto mb-8">
            Commandez facilement nos plats thaïlandais authentiques via notre plateforme de commande Climbee
          </p>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-aclonica text-4xl mb-12 text-center">
            Comment Commander ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="w-16 h-16 bg-sdblue rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="font-aclonica text-2xl mb-4">Choisissez</h3>
              <p className="text-gray-700">
                Parcourez notre menu complet sur Climbee et sélectionnez vos plats préférés
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="w-16 h-16 bg-sdblue rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="font-aclonica text-2xl mb-4">Commandez</h3>
              <p className="text-gray-700">
                Passez votre commande avant 20h pour une livraison J+2
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <div className="w-16 h-16 bg-sdblue rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="font-aclonica text-2xl mb-4">Dégustez</h3>
              <p className="text-gray-700">
                Recevez vos plats frais à domicile ou retirez-les dans un point de vente
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <a
              href="https://climbee.app/s/sd-thai-food"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-sdblue text-white px-10 py-5 rounded-full text-xl font-semibold hover:bg-black transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <ShoppingCart className="h-6 w-6" />
              Accéder à la Boutique Climbee
              <ExternalLink className="h-6 w-6" />
            </a>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-aclonica text-4xl mb-12 text-center">
            Pourquoi Commander en Ligne ?
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex gap-4">
              <Clock className="h-12 w-12 text-sdblue flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-xl mb-2">Conservation 17 Jours</h3>
                <p className="text-gray-700">
                  Nos plats se conservent jusqu&apos;à 17 jours au réfrigérateur. Commandez pour toute la semaine !
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Truck className="h-12 w-12 text-sdblue flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-xl mb-2">Livraison Rapide</h3>
                <p className="text-gray-700">
                  Commande avant 20h = Livraison J+2 dans tout le canton de Vaud
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <ShoppingCart className="h-12 w-12 text-sdblue flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-xl mb-2">Commande Minimum 40 CHF</h3>
                <p className="text-gray-700">
                  Profitez de la livraison à domicile pour un montant minimum de 40 CHF
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <ExternalLink className="h-12 w-12 text-sdblue flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-xl mb-2">Plateforme Sécurisée</h3>
                <p className="text-gray-700">
                  Paiement sécurisé via Climbee, plateforme suisse de confiance
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Menu Teaser */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="font-aclonica text-4xl mb-8 text-center">
            Découvrez Notre Menu
          </h2>
          <p className="text-center text-xl text-gray-700 mb-12 max-w-2xl mx-auto">
            Pad Thai, Curry Vert, Tom Yum, Massaman, et bien plus encore...
            Plus de 30 plats authentiques préparés par le Chef Dumrong
          </p>
          <div className="text-center">
            <a
              href="https://climbee.app/s/sd-thai-food"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-sdblue transition"
            >
              Voir le Menu Complet
              <ExternalLink className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
