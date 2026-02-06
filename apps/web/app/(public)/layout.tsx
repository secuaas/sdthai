import { Aclonica, Poppins } from 'next/font/google';
import Link from 'next/link';
import { Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react';
import CookieConsent from '@/components/cookie-consent';

const aclonica = Aclonica({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-aclonica'
});

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins'
});

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${aclonica.variable} ${poppins.variable} font-poppins`}>
      {/* Navigation */}
      <nav className="bg-black text-white py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-aclonica">
            SD THAI FOOD
          </Link>
          <ul className="flex gap-8">
            <li><Link href="/" className="hover:text-sdblue transition">Accueil</Link></li>
            <li><Link href="/boutique" className="hover:text-sdblue transition">Boutique</Link></li>
            <li><Link href="/magasins" className="hover:text-sdblue transition">Magasins Partenaires</Link></li>
            <li><Link href="/contact" className="hover:text-sdblue transition">Contact</Link></li>
            <li><Link href="/admin/dashboard" className="hover:text-sdblue transition">Espace Admin</Link></li>
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div>
            <h3 className="font-aclonica text-xl mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-sdblue" />
                <span>Av. des Figuiers 39, 1008 Lausanne</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-sdblue" />
                <a href="tel:+41215391716" className="hover:text-sdblue transition">
                  +41 21 539 17 16
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-sdblue" />
                <a href="mailto:sdthaifood@gmail.com" className="hover:text-sdblue transition">
                  sdthaifood@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Horaires */}
          <div>
            <h3 className="font-aclonica text-xl mb-4">Horaires</h3>
            <div className="space-y-2 text-sm">
              <p>Lundi - Vendredi: 9h00 - 18h00</p>
              <p>Samedi: 10h00 - 16h00</p>
              <p>Dimanche: Fermé</p>
            </div>
          </div>

          {/* Réseaux Sociaux */}
          <div>
            <h3 className="font-aclonica text-xl mb-4">Suivez-nous</h3>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/sdthaifood"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-sdblue p-3 rounded-full hover:bg-white hover:text-black transition"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/sdthaifood"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-sdblue p-3 rounded-full hover:bg-white hover:text-black transition"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.ubereats.com/ch-fr/store/sd-thai-food/sdthaifood"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-sdblue px-4 py-3 rounded-full hover:bg-white hover:text-black transition text-sm font-semibold"
              >
                Uber Eats
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="container mx-auto px-4 mt-8 pt-8 border-t border-gray-700 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} SD Thai Food. Tous droits réservés.</p>
          <p className="mt-2 text-gray-400">
            Cuisine thaïlandaise authentique à Lausanne | Gault & Millau 12/20
          </p>
        </div>
      </footer>

      {/* Cookie Consent */}
      <CookieConsent />
    </div>
  );
}
