import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Thiob Express Dakar',
    short_name: 'Thiob Dakar',
    description: 'Découverte des restaurants et livraison de repas à Dakar',
    start_url: '/',
    display: 'standalone',
    background_color: '#064E2B',
    theme_color: '#064E2B',
    icons: [
      {
        src: '/images/Icone app.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/images/Icone app.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
