'use client';

import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('sd-thai-cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('sd-thai-cookie-consent', 'accepted');
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('sd-thai-cookie-consent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/95 text-white shadow-2xl">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Cookie className="h-8 w-8 text-sdblue flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Nous utilisons des cookies</h3>
              <p className="text-sm text-gray-300">
                Ce site utilise des cookies pour améliorer votre expérience de navigation
                et analyser le trafic. En continuant, vous acceptez notre utilisation des cookies.
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={acceptCookies}
              className="flex-1 md:flex-none bg-sdblue hover:bg-white hover:text-black px-6 py-2 rounded-full font-semibold transition"
            >
              Accepter
            </button>
            <button
              onClick={declineCookies}
              className="flex-1 md:flex-none border border-white hover:bg-white hover:text-black px-6 py-2 rounded-full font-semibold transition"
            >
              Refuser
            </button>
            <button
              onClick={declineCookies}
              className="md:hidden p-2"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
