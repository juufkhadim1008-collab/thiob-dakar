import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/react';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Thiob-Dakar | Plateforme de Restauration & Livraison Gastronomique',
  description: 'Commandez le meilleur du Thiéboudienne, Dibi et cuisine sénégalaise à Dakar. Plateforme interconnectée pour clients, restaurants et livreurs.',
  keywords: ['Thiéboudienne', 'Dakar', 'Livraison repas Dakar', 'Restaurants Dakar', 'Plats sénégalais', 'Almadies', 'Plateau'],
  icons: {
    icon: '/images/Icone app.png',
    shortcut: '/images/Icone app.png',
    apple: '/images/Icone app.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F7FAF7] text-[#0D1C12] selection:bg-[#008235] selection:text-white">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
