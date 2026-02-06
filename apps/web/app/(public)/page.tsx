'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const faqs = [
    {
      question: "Quelles sont vos zones de livraison ?",
      answer: "Nous livrons dans tout le canton de Vaud et les régions avoisinantes. Pour vérifier si votre adresse est couverte, consultez notre page de commande ou contactez-nous directement."
    },
    {
      question: "Comment réchauffer les plats ?",
      answer: "Nos plats sont vendus frais et se conservent 17 jours au réfrigérateur. Pour les réchauffer : au micro-ondes (2-3 minutes à puissance moyenne) ou à la poêle/wok (5-7 minutes à feu moyen en ajoutant un peu d'eau si nécessaire)."
    },
    {
      question: "Puis-je commander pour plusieurs jours ?",
      answer: "Absolument ! Nos plats se conservent 17 jours au réfrigérateur, vous pouvez donc commander pour toute la semaine. Les commandes avant 20h sont livrées 2 jours plus tard."
    },
    {
      question: "Où trouver vos points de vente ?",
      answer: "Nos plats sont disponibles dans plusieurs magasins partenaires et distributeurs automatiques dans le canton de Vaud. Consultez notre page 'Magasins Partenaires' pour la liste complète."
    },
    {
      question: "Puis-je modifier ma commande ?",
      answer: "Les commandes peuvent être modifiées jusqu'à 20h pour une livraison J+2. Après ce délai, les commandes tardives (20h-05h) nécessitent une approbation de notre équipe."
    },
    {
      question: "Y a-t-il un montant minimum de commande ?",
      answer: "Oui, le montant minimum de commande est de 40 CHF pour les livraisons à domicile. Pas de minimum dans nos points de vente automatisés."
    }
  ];

  const carouselImages = [
    { src: '/images/thai-dish-1.jpg', alt: 'Pad Thai authentique' },
    { src: '/images/thai-dish-2.jpg', alt: 'Curry vert thaï' },
    { src: '/images/thai-dish-3.jpg', alt: 'Tom Yum Goong' },
    { src: '/images/chef-dumrong.jpg', alt: 'Chef Dumrong au travail' },
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-black text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-sdblue to-transparent"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="font-aclonica text-5xl md:text-7xl mb-6">
            LIVRAISON DE PLATS THAI
          </h1>
          <p className="text-3xl md:text-4xl mb-8 text-sdblue font-semibold">
            SAVOUREUX ET AUTHENTIQUES
          </p>
          <p className="text-xl mb-12 max-w-3xl mx-auto font-light">
            Découvrez la vraie cuisine thaïlandaise, préparée avec amour par le Chef Dumrong.
            Plus de 20 ans d&apos;expérience, reconnaissance Gault & Millau 12/20.
          </p>
          <a
            href="https://climbee.app/s/sd-thai-food"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-sdblue text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105"
          >
            Commander Maintenant
            <ExternalLink className="h-5 w-5" />
          </a>
          <p className="mt-4 text-sm text-gray-300">
            Conservation 17 jours | Commande avant 20h = Livraison J+2
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-aclonica text-4xl mb-6 text-black">
                Notre Histoire
              </h2>
              <p className="text-lg mb-4 text-gray-700 leading-relaxed">
                <strong className="text-sdblue">Chef Dumrong</strong> et son épouse <strong className="text-sdblue">Sylvie</strong> ont créé SD Thai Food avec une passion commune :
                partager l&apos;authentique cuisine thaïlandaise avec la Suisse romande.
              </p>
              <p className="text-lg mb-4 text-gray-700 leading-relaxed">
                Avec <strong>plus de 20 ans d&apos;expérience</strong> dans la restauration thaïlandaise,
                le Chef Dumrong apporte son expertise et son amour des saveurs traditionnelles de Thaïlande.
              </p>
              <p className="text-lg mb-4 text-gray-700 leading-relaxed">
                Reconnus par le <strong className="text-sdblue">Gault & Millau avec une note de 12/20</strong>,
                nous sommes fiers de proposer des plats qui respectent les traditions culinaires thaïlandaises
                tout en s&apos;adaptant aux goûts suisses.
              </p>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-sdblue/20 to-transparent z-10"></div>
              {/* Placeholder for chef image */}
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">Photo Chef Dumrong & Sylvie</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Savoir-faire Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="font-aclonica text-4xl mb-12 text-center text-black">
            Notre Savoir-Faire
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition">
              <div className="w-16 h-16 bg-sdblue rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="font-aclonica text-2xl mb-4 text-center">Artisanal</h3>
              <p className="text-gray-700 text-center leading-relaxed">
                Tous nos plats sont préparés à la main avec des techniques traditionnelles thaïlandaises.
                Aucun additif, conservateurs ou arômes artificiels.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition">
              <div className="w-16 h-16 bg-sdblue rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="font-aclonica text-2xl mb-4 text-center">Ingrédients Frais</h3>
              <p className="text-gray-700 text-center leading-relaxed">
                Nous sélectionnons rigoureusement nos ingrédients auprès de fournisseurs locaux et importons
                les épices et sauces directement de Thaïlande.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition">
              <div className="w-16 h-16 bg-sdblue rounded-full flex items-center justify-center mb-6 mx-auto">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="font-aclonica text-2xl mb-4 text-center">Tradition Thaï</h3>
              <p className="text-gray-700 text-center leading-relaxed">
                Chaque recette respecte les traditions culinaires thaïlandaises transmises de génération en génération,
                pour des saveurs authentiques et équilibrées.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Image Carousel */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <h2 className="font-aclonica text-4xl mb-12 text-center text-white">
            Nos Créations
          </h2>
          <div className="relative max-w-4xl mx-auto">
            <div className="relative h-96 rounded-lg overflow-hidden">
              {/* Placeholder carousel */}
              <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                <p className="text-white text-center">
                  Image {currentImageIndex + 1} / {carouselImages.length}<br />
                  {carouselImages[currentImageIndex].alt}
                </p>
              </div>
            </div>
            {/* Carousel Controls */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full transition"
              aria-label="Image précédente"
            >
              <ChevronDown className="h-6 w-6 rotate-90" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full transition"
              aria-label="Image suivante"
            >
              <ChevronDown className="h-6 w-6 -rotate-90" />
            </button>
            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-3 h-3 rounded-full transition ${
                    index === currentImageIndex ? 'bg-sdblue' : 'bg-gray-500'
                  }`}
                  aria-label={`Aller à l'image ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-aclonica text-4xl mb-12 text-center text-black">
            Questions Fréquentes
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition"
                >
                  <span className="font-semibold text-left text-lg">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-sdblue" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-sdblue" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 py-4 bg-white">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-sdblue text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-aclonica text-4xl mb-6">
            Prêt à Déguster ?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Commandez dès maintenant et recevez vos plats thaïlandais authentiques directement chez vous.
          </p>
          <a
            href="https://climbee.app/s/sd-thai-food"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-sdblue px-8 py-4 rounded-full text-lg font-semibold hover:bg-black hover:text-white transition-all duration-300 transform hover:scale-105"
          >
            Commander sur Climbee
            <ExternalLink className="h-5 w-5" />
          </a>
        </div>
      </section>
    </div>
  );
}
