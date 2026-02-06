'use client';

import { useState, useEffect } from 'react';
import { MapPin, Clock, Phone, ExternalLink } from 'lucide-react';

interface Partner {
  id: string;
  nom: string;
  adresse: string;
  ville: string;
  codePostal: string;
  telephone?: string;
  type: string;
  isActive: boolean;
}

export default function MagasinsPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/partners/public`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des partenaires');
      }
      const data = await response.json();
      setPartners(data.filter((p: Partner) => p.isActive));
    } catch (err) {
      console.error('Error loading partners:', err);
      setError('Impossible de charger les points de vente');
      // Fallback to mock data
      setPartners([
        {
          id: '1',
          nom: 'Migros Lausanne Centre',
          adresse: 'Rue Centrale 5',
          ville: 'Lausanne',
          codePostal: '1003',
          telephone: '+41 21 555 0101',
          type: 'DEPOT_AUTOMATE',
          isActive: true
        },
        {
          id: '2',
          nom: 'Coop Renens',
          adresse: 'Avenue du Général-Guisan 20',
          ville: 'Renens',
          codePostal: '1020',
          telephone: '+41 21 555 0202',
          type: 'WITH_DELIVERY',
          isActive: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const depotAutomatesPartners = partners.filter(p => p.type === 'DEPOT_AUTOMATE');
  const deliveryPartners = partners.filter(p => p.type === 'WITH_DELIVERY');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-black text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <MapPin className="h-16 w-16 mx-auto mb-6 text-sdblue" />
          <h1 className="font-aclonica text-5xl mb-6">
            Nos Magasins Partenaires
          </h1>
          <p className="text-xl max-w-3xl mx-auto">
            Retrouvez nos plats thaïlandais dans plusieurs points de vente du canton de Vaud
          </p>
        </div>
      </section>

      {/* Distributeurs Automatiques */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-aclonica text-4xl mb-4 text-center">
            Distributeurs Automatiques
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Achetez vos plats 24h/24, 7j/7 dans nos distributeurs automatiques
          </p>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Chargement des points de vente...</p>
            </div>
          ) : depotAutomatesPartners.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {depotAutomatesPartners.map((partner) => (
                <div key={partner.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                  <h3 className="font-semibold text-xl mb-4 text-sdblue">
                    {partner.nom}
                  </h3>
                  <div className="space-y-3 text-gray-700">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-sdblue flex-shrink-0 mt-0.5" />
                      <div>
                        <p>{partner.adresse}</p>
                        <p>{partner.codePostal} {partner.ville}</p>
                      </div>
                    </div>
                    {partner.telephone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-sdblue flex-shrink-0" />
                        <a href={`tel:${partner.telephone}`} className="hover:text-sdblue transition">
                          {partner.telephone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-sdblue flex-shrink-0" />
                      <span className="text-green-600 font-semibold">24h/24 - 7j/7</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className="inline-block bg-sdblue/10 text-sdblue px-3 py-1 rounded-full text-sm font-semibold">
                      Distributeur Automatique
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-600">Aucun distributeur automatique disponible pour le moment</p>
            </div>
          )}
        </div>
      </section>

      {/* Points de Vente avec Livraison */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-aclonica text-4xl mb-4 text-center">
            Points de Vente avec Livraison
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Nos partenaires qui proposent également la livraison à domicile
          </p>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Chargement des points de vente...</p>
            </div>
          ) : deliveryPartners.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deliveryPartners.map((partner) => (
                <div key={partner.id} className="bg-gray-50 rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                  <h3 className="font-semibold text-xl mb-4 text-sdblue">
                    {partner.nom}
                  </h3>
                  <div className="space-y-3 text-gray-700">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-sdblue flex-shrink-0 mt-0.5" />
                      <div>
                        <p>{partner.adresse}</p>
                        <p>{partner.codePostal} {partner.ville}</p>
                      </div>
                    </div>
                    {partner.telephone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-sdblue flex-shrink-0" />
                        <a href={`tel:${partner.telephone}`} className="hover:text-sdblue transition">
                          {partner.telephone}
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      Livraison Disponible
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Aucun point de vente avec livraison pour le moment</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Online Order */}
      <section className="py-20 bg-sdblue text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-aclonica text-4xl mb-6">
            Préférez Commander en Ligne ?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Commandez directement sur notre plateforme Climbee pour une livraison à domicile
          </p>
          <a
            href="https://climbee.app/s/sd-thai-food"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-sdblue px-8 py-4 rounded-full text-lg font-semibold hover:bg-black hover:text-white transition-all duration-300"
          >
            Commander en Ligne
            <ExternalLink className="h-5 w-5" />
          </a>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-aclonica text-3xl mb-8 text-center">
            Informations Pratiques
          </h2>
          <div className="bg-gray-50 rounded-lg p-8 space-y-4">
            <div className="flex gap-4">
              <div className="w-2 bg-sdblue rounded"></div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Conservation</h3>
                <p className="text-gray-700">
                  Tous nos plats se conservent 17 jours au réfrigérateur dans leur emballage d&apos;origine fermé.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-2 bg-sdblue rounded"></div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Réchauffage</h3>
                <p className="text-gray-700">
                  Micro-ondes : 2-3 minutes à puissance moyenne | Poêle/Wok : 5-7 minutes à feu moyen
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-2 bg-sdblue rounded"></div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Nouveau Point de Vente</h3>
                <p className="text-gray-700">
                  Vous souhaitez proposer nos produits dans votre magasin ? Contactez-nous au +41 21 539 17 16
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
