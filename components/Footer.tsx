'use client';

import React from 'react';
import { Sparkles, Heart, ShieldCheck, Clock, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#07431E] text-white border-t border-[#008235]/20 mt-auto">
      {/* Dakar Food Quality Highlights */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#FA8038] shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Saveurs 100% Sénégalaises</h4>
                <p className="text-sm text-white/70 mt-1">
                  Plats cuisinés dans le respect des recettes traditionnelles (Saint-Louis, Dakar, Sine Saloum).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#008235] shrink-0">
                <Clock className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Livraison Express Dakar</h4>
                <p className="text-sm text-white/70 mt-1">
                  Flotte de livreurs connectés par GPS aux Almadies, Plateau, Mermoz, Yoff et partout à Dakar.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#FA8038] shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">Paiements Locaux Sécurisés</h4>
                <p className="text-sm text-white/70 mt-1">
                  Réglez instantanément avec Wave, Orange Money, Free Money ou par Carte Bancaire.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Dakar Vibe */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 : Brand & About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#008235] flex items-center justify-center font-black text-white text-sm">
                TD
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                Thiob<span className="text-[#FA8038]">.</span>Dakar
              </span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              La première plateforme numérique de gastronomie dakaroise unissant les restaurants emblématiques, les livreurs indépendants et les passionnés de bonne cuisine.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#FA8038]">
              <MapPin className="w-4 h-4" />
              <span>Dakar, Sénégal 🇸🇳</span>
            </div>
          </div>

          {/* Col 2 : Les Spécialités */}
          <div>
            <h5 className="font-bold text-sm tracking-wider uppercase mb-4 text-[#FA8038]">
              Spécialités Populaires
            </h5>
            <ul className="space-y-2 text-xs text-white/70">
              <li className="hover:text-white cursor-pointer transition-colors">Ceebu Jën Penda Mbaye (Rouge)</li>
              <li className="hover:text-white cursor-pointer transition-colors">Ceebu Jën Blanc & Beugueudj</li>
              <li className="hover:text-white cursor-pointer transition-colors">Dibi d’Agneau du Plateau</li>
              <li className="hover:text-white cursor-pointer transition-colors">Yassa Poulet Braisé</li>
              <li className="hover:text-white cursor-pointer transition-colors">Pastels & Sauces Pimentées</li>
              <li className="hover:text-white cursor-pointer transition-colors">Jus de Bouye & Bissap Menthe</li>
            </ul>
          </div>

          {/* Col 3 : Quartiers Desservis */}
          <div>
            <h5 className="font-bold text-sm tracking-wider uppercase mb-4 text-[#FA8038]">
              Zones de Livraison
            </h5>
            <ul className="space-y-2 text-xs text-white/70">
              <li>Almadies & Ngor</li>
              <li>Dakar Plateau & Médina</li>
              <li>Mermoz & Sacré-Cœur</li>
              <li>Fann & Point E</li>
              <li>Ouakam & Mamelles</li>
              <li>Yoff & Hann Maristes</li>
            </ul>
          </div>

          {/* Col 4 : Partenaires & Moyens de Paiement */}
          <div>
            <h5 className="font-bold text-sm tracking-wider uppercase mb-4 text-[#FA8038]">
              Paiements Partenaires
            </h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/10 rounded-lg p-2 text-center font-bold text-[#3FB9F7] flex items-center justify-center gap-1">
                <span>🌊 Wave</span>
              </div>
              <div className="bg-white/10 rounded-lg p-2 text-center font-bold text-[#FF7900] flex items-center justify-center gap-1">
                <span>🟠 OM</span>
              </div>
              <div className="bg-white/10 rounded-lg p-2 text-center font-bold text-[#00E5A3] flex items-center justify-center gap-1">
                <span>💳 CB / Visa</span>
              </div>
              <div className="bg-white/10 rounded-lg p-2 text-center font-bold text-white flex items-center justify-center gap-1">
                <span>💵 Espèces</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-[11px] text-white/60">
                Vous êtes restaurateur à Dakar ? Rejoignez le réseau Thiob-Dakar.
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>© {new Date().getFullYear()} Thiob-Dakar. Tous droits réservés.</p>
          <div className="flex items-center gap-1 text-white/80">
            <span>Développé avec</span>
            <Heart className="w-3.5 h-3.5 text-[#FA8038] fill-[#FA8038]" />
            <span>pour la Teranga Dakaroise</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
