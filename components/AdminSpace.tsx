'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { formatFCFA, getStatusBadge } from '@/lib/utils';
import { 
  ShieldCheck, 
  TrendingUp, 
  Store, 
  Bike, 
  Users, 
  DollarSign, 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  MapPin
} from 'lucide-react';

export default function AdminSpace() {
  const { metrics, restaurants, couriers, orders } = useApp();
  const [tab, setTab] = useState<'overview' | 'restaurants' | 'couriers' | 'orders'>('overview');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Super Admin */}
      <div className="bg-[#07431E] text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-[#008235] text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Tour de Contrôle Super Administrateur</span>
            </span>
            <span className="text-xs text-white/80">Dakar Hub 360°</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            Pilotage de l'Écosystème Thiob-Dakar
          </h1>
          <p className="text-xs text-white/80 mt-1 max-w-xl">
            Supervision en temps réel des transactions, modération des restaurants partenaires et gestion de la flotte de livreurs à Dakar.
          </p>
        </div>

        {/* Global Commission Live Badge */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-center sm:text-right min-w-[200px]">
          <span className="text-[11px] uppercase font-bold text-white/70 block">
            Commissions Plateforme
          </span>
          <h3 className="text-2xl font-black text-[#FA8038] mt-0.5">
            {formatFCFA(metrics.platformCommissionEarned)}
          </h3>
          <span className="text-[10px] text-emerald-400 font-semibold flex items-center justify-center sm:justify-end gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+18.4% cette semaine</span>
          </span>
        </div>
      </div>

      {/* 4 Global Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-[#E2ECE5] shadow-xs">
          <div className="flex items-center justify-between text-[#008235]">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Volume Ventes (GMV)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#008235] flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-[#07431E] mt-2">
            {formatFCFA(metrics.totalRevenueGmv)}
          </h3>
          <p className="text-[11px] text-gray-500 mt-1">
            Montant total commandé à Dakar
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E2ECE5] shadow-xs">
          <div className="flex items-center justify-between text-[#FA8038]">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Commandes Aujourd'hui</span>
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FA8038] flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-[#07431E] mt-2">
            {metrics.totalOrdersToday}
          </h3>
          <p className="text-[11px] text-gray-500 mt-1">
            Temps moyen de livraison : 28 min
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E2ECE5] shadow-xs">
          <div className="flex items-center justify-between text-[#008235]">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Restaurants Actifs</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#008235] flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-[#07431E] mt-2">
            {metrics.activeRestaurantsCount} partenaires
          </h3>
          <p className="text-[11px] text-gray-500 mt-1">
            Almadies, Plateau, Mermoz, Yoff
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#E2ECE5] shadow-xs">
          <div className="flex items-center justify-between text-[#F5B738]">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Livreurs en Service</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#F5B738] flex items-center justify-center">
              <Bike className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-[#07431E] mt-2">
            {metrics.activeCouriersCount} motos & scooters
          </h3>
          <p className="text-[11px] text-gray-500 mt-1">
            Taux de satisfaction : {metrics.satisfactionRate}%
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2ECE5] pb-3">
        <button
          onClick={() => setTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'overview' ? 'brand-gradient text-white shadow-xs' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Vue d'Ensemble & Flux
        </button>

        <button
          onClick={() => setTab('restaurants')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'restaurants' ? 'brand-gradient text-white shadow-xs' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Restaurants Partenaires ({restaurants.length})
        </button>

        <button
          onClick={() => setTab('couriers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            tab === 'couriers' ? 'brand-gradient text-white shadow-xs' : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          Flotte de Livreurs ({couriers.length})
        </button>
      </div>

      {/* TAB CONTENT: RESTAURANTS */}
      {tab === 'restaurants' && (
        <div className="bg-white rounded-3xl border border-[#E2ECE5] overflow-hidden shadow-sm">
          <div className="p-5 border-b border-[#E2ECE5] flex items-center justify-between">
            <h3 className="font-extrabold text-base text-[#07431E]">
              Gestion & Agrément des Restaurants
            </h3>
            <span className="text-xs text-gray-500">Commission standard : 12%</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7FAF7] text-gray-500 font-bold uppercase text-[10px] tracking-wider border-b border-[#E2ECE5]">
                <tr>
                  <th className="py-3.5 px-4">Établissement</th>
                  <th className="py-3.5 px-4">Quartier</th>
                  <th className="py-3.5 px-4">Gérant / Contact</th>
                  <th className="py-3.5 px-4">Note</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2ECE5]">
                {restaurants.map((resto) => (
                  <tr key={resto.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img src={resto.logo} alt={resto.name} className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <p className="font-bold text-sm text-[#0D1C12]">{resto.name}</p>
                          <p className="text-[11px] text-gray-500">{resto.tagline}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-[#008235]">📍 {resto.neighborhood}</span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-[#0D1C12]">{resto.ownerName}</p>
                      <p className="text-[11px] text-gray-500">{resto.phone}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-amber-600">⭐ {resto.rating}</span>
                      <span className="text-gray-400 text-[10px]"> ({resto.reviewCount})</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                        ✓ Agréé & Actif
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700">
                        Configurer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: COURIERS */}
      {tab === 'couriers' && (
        <div className="bg-white rounded-3xl border border-[#E2ECE5] overflow-hidden shadow-sm">
          <div className="p-5 border-b border-[#E2ECE5] flex items-center justify-between">
            <h3 className="font-extrabold text-base text-[#07431E]">
              Flotte de Livreurs Indépendants
            </h3>
            <span className="text-xs text-[#008235] font-bold">
              {couriers.filter((c) => c.isOnline).length} livreurs connectés en direct
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7FAF7] text-gray-500 font-bold uppercase text-[10px] tracking-wider border-b border-[#E2ECE5]">
                <tr>
                  <th className="py-3.5 px-4">Livreur</th>
                  <th className="py-3.5 px-4">Véhicule / Immat.</th>
                  <th className="py-3.5 px-4">Zone Active</th>
                  <th className="py-3.5 px-4">Gains Jour</th>
                  <th className="py-3.5 px-4">Courses</th>
                  <th className="py-3.5 px-4">Disponibilité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2ECE5]">
                {couriers.map((cour) => (
                  <tr key={cour.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl brand-gradient text-white flex items-center justify-center font-bold">
                          🛵
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#0D1C12]">{cour.name}</p>
                          <p className="text-[11px] text-gray-500">{cour.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-700 capitalize">{cour.vehicleType}</span>
                      <span className="text-gray-400 block text-[10px]">{cour.plateNumber}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-[#07431E]">{cour.currentNeighborhood}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-[#008235]">{formatFCFA(cour.todayEarnings)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-[#07431E]">{cour.completedDeliveries}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${cour.isOnline ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                        {cour.isOnline ? '🟢 En Service' : '⚪ Hors Ligne'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: OVERVIEW */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Real-time orders feed */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E2ECE5] p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-[#07431E]">
              Flux des Commandes en Direct à Dakar
            </h3>

            <div className="divide-y divide-[#E2ECE5]">
              {orders.map((ord) => {
                const badge = getStatusBadge(ord.status);
                return (
                  <div key={ord.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 first:pt-0 last:pb-0">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#07431E]">{ord.orderNumber}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                        <span className="text-[11px] text-gray-400">{ord.createdAt}</span>
                      </div>
                      <p className="text-xs text-gray-700">
                        <strong>{ord.clientName}</strong> ➔ {ord.restaurantName} ({ord.deliveryAddress.neighborhood})
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-[#FA8038]">{formatFCFA(ord.total)}</span>
                      <span className="text-[10px] text-gray-400 block uppercase font-bold">{ord.paymentMethod}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Revenue Breakdown & Dakar Zones */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-[#E2ECE5] p-6 shadow-sm space-y-4">
              <h4 className="font-extrabold text-sm text-[#07431E] uppercase tracking-wider">
                Répartition des Commandes par Zone
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Almadies & Ngor</span>
                    <span className="text-[#008235]">42%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#008235] rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Dakar Plateau</span>
                    <span className="text-[#FA8038]">33%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FA8038] rounded-full" style={{ width: '33%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Mermoz & Fann</span>
                    <span className="text-[#07431E]">25%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#07431E] rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
