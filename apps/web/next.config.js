/** @type {import('next').NextConfig} */
const nextConfig = {
  // CRITICAL: standalone output pour déploiement K8s
  output: 'standalone',

  // Configuration des images (si besoin d'images depuis le backend)
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '*.secuaas.com',
      },
    ],
  },

  // Variables d'environnement exposées au client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
  },

  // Désactiver la telemetry Next.js (optionnel)
  telemetry: false,

  // Optimisations de production
  swcMinify: true,

  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
