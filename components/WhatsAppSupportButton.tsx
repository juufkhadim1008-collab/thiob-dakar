'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { useApp } from '@/lib/store';

export default function WhatsAppSupportButton() {
  const { clientName, clientNeighborhood, currentRole } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [userMessage, setUserMessage] = useState('');

  // Only display on client role
  if (currentRole !== 'client') return null;

  const supportPhone = '221778451290'; // Contact officiel Thiob Dakar

  const handleSendWhatsApp = (customText?: string) => {
    const textToSend = customText || userMessage || 'Salam l’équipe Thiob Dakar ! J’ai une question sur les livraisons et restaurants.';
    const encoded = encodeURIComponent(`*Salam Thiob Dakar !* 🇸🇳\n*Client :* ${clientName || 'Client'}\n*Quartier :* ${clientNeighborhood || 'Dakar'}\n\n${textToSend}`);
    window.open(`https://wa.me/${supportPhone}?text=${encoded}`, '_blank');
    setIsOpen(false);
    setUserMessage('');
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-3 w-80 bg-white rounded-3xl p-4 shadow-2xl border border-[#D8EADB] text-[#081A10]"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm shadow-xs">
                  💬
                </div>
                <div>
                  <h4 className="font-black text-xs text-[#081A10]">Conciergerie Thiob Dakar</h4>
                  <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    En direct sur WhatsApp
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              Besoin d'aide pour une commande, un restaurant ou une question de livraison ?
            </p>

            {/* Quick Prompt Chips */}
            <div className="space-y-1.5 mb-3">
              <button
                onClick={() => handleSendWhatsApp('Où en est ma livraison ?')}
                className="w-full text-left p-2 rounded-xl bg-gray-50 hover:bg-emerald-50 text-[11px] font-bold text-gray-700 hover:text-emerald-800 transition-colors border border-gray-100"
              >
                📍 Où en est ma livraison ?
              </button>
              <button
                onClick={() => handleSendWhatsApp('Je souhaite recommander un restaurant de mon quartier.')}
                className="w-full text-left p-2 rounded-xl bg-gray-50 hover:bg-emerald-50 text-[11px] font-bold text-gray-700 hover:text-emerald-800 transition-colors border border-gray-100"
              >
                🍽️ Recommander un restaurant
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendWhatsApp()}
                placeholder="Écrivez votre message..."
                className="flex-1 bg-gray-100 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={() => handleSendWhatsApp()}
                className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-xl flex items-center justify-center border-2 border-white/80 cursor-pointer relative"
        title="Assistance WhatsApp 1-Clic"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
        </span>
      </motion.button>
    </div>
  );
}
