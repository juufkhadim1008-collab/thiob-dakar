import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Thiob-Dakar | Plateforme de Restauration & Livraison Gastronomique',
  description: 'Commandez le meilleur du Thiéboudienne, Dibi et cuisine sénégalaise à Dakar. Plateforme interconnectée pour clients, restaurants et livreurs.',
  keywords: ['Thiéboudienne', 'Dakar', 'Livraison repas Dakar', 'Restaurants Dakar', 'Plats sénégalais', 'Almadies', 'Plateau'],
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
      </body>
    </html>
  );
}
