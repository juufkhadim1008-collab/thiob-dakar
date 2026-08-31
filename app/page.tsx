'use client';

import React, { useState } from 'react';
import { AppProvider, useApp } from '@/lib/store';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ClientSpace from '@/components/ClientSpace';
import RestaurantSpace from '@/components/RestaurantSpace';
import CourierSpace from '@/components/CourierSpace';
import AdminSpace from '@/components/AdminSpace';
import CartDrawer from '@/components/CartDrawer';
import OrderTrackingModal from '@/components/OrderTrackingModal';

function MainApp() {
  const { currentRole } = useApp();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('Tous les quartiers');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAF7] text-[#0D1C12]">
      {/* Navigation */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        selectedNeighborhood={selectedNeighborhood}
        onSelectNeighborhood={setSelectedNeighborhood}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Area switched by Role */}
      <main className="flex-1">
        {currentRole === 'client' && (
          <ClientSpace
            selectedNeighborhood={selectedNeighborhood}
            searchQuery={searchQuery}
          />
        )}
        {currentRole === 'restaurant' && <RestaurantSpace />}
        {currentRole === 'courier' && <CourierSpace />}
        {currentRole === 'admin' && <AdminSpace />}
      </main>

      {/* Cart & Checkout Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Live Order Tracking Modal */}
      <OrderTrackingModal />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
