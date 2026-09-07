'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/store';
import { AppNotification, NotificationType } from '@/lib/types';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Trash2, 
  Sparkles, 
  MapPin, 
  Utensils, 
  Clock, 
  Package, 
  ChevronRight,
  Heart,
  Volume2,
  Send,
  Zap,
  Radio
} from 'lucide-react';

interface NotificationCenterProps {
  // Can be embedded or used standalone
}

export default function NotificationCenter() {
  const {
    notifications,
    unreadNotificationsCount,
    isNotificationCenterOpen,
    setIsNotificationCenterOpen,
    activeInAppToast,
    dismissInAppToast,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    triggerDailyTerangaMessage,
    triggerSystemUpdateNotification,
    triggerProximityNotification,
    clientNeighborhood,
    setCurrentRole,
    setActiveTrackingOrder,
    orders,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | NotificationType>('all');

  const filteredNotifications = notifications.filter((notif) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'system_update') {
      return notif.type === 'system_update' || notif.type === 'new_restaurant';
    }
    return notif.type === activeFilter;
  });

  const getBadgeStyle = (type: NotificationType) => {
    switch (type) {
      case 'teranga_daily':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'geo_proximity':
        return 'bg-emerald-100 text-[#0A6E3B] border-emerald-300';
      case 'order_status':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'new_restaurant':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'system_update':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryLabel = (type: NotificationType) => {
    switch (type) {
      case 'teranga_daily':
        return '🇸🇳 Teranga & Générosité';
      case 'geo_proximity':
        return '📍 Proximité Dakar';
      case 'order_status':
        return '📦 Suivi Commande';
      case 'new_restaurant':
        return '🍽️ Nouveau Restaurant';
      case 'system_update':
        return '🚀 Mise à jour App';
      default:
        return '📢 Notification';
    }
  };

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);
    if (notif.actionRole) {
      setCurrentRole(notif.actionRole);
    }
    if (notif.actionData?.orderId) {
      const ord = orders.find((o) => o.id === notif.actionData?.orderId);
      if (ord) setActiveTrackingOrder(ord);
    }
  };

  return (
    <>
      {/* =========================================================================
          1. FLOATING IN-APP TOAST BANNER (Top Notification HUD)
         ========================================================================= */}
      <AnimatePresence>
        {activeInAppToast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed top-4 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-32px)] sm:w-[420px]"
          >
            <div
              onClick={() => {
                handleNotificationClick(activeInAppToast);
                setIsNotificationCenterOpen(true);
                dismissInAppToast();
              }}
              className="relative p-4 rounded-2xl bg-white/95 backdrop-blur-xl border border-[#0A6E3B]/20 shadow-2xl hover:shadow-emerald-500/10 transition-all cursor-pointer overflow-hidden group ring-1 ring-black/5"
            >
              {/* Subtle top indicator bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0A6E3B] via-[#FF7824] to-[#10B981]" />

              <div className="flex items-start gap-3">
                {/* Icon box */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#064E2B] to-[#10B981] text-white flex items-center justify-center text-xl shrink-0 shadow-md">
                  {activeInAppToast.icon || '🔔'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getBadgeStyle(activeInAppToast.type)}`}>
                      {getCategoryLabel(activeInAppToast.type)}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold">• {activeInAppToast.timestamp}</span>
                  </div>
                  <h4 className="text-xs font-black text-[#081A10] leading-snug truncate">
                    {activeInAppToast.title}
                  </h4>
                  <p className="text-[11px] text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                    {activeInAppToast.message}
                  </p>
                </div>

                {/* Close X */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissInAppToast();
                  }}
                  className="w-6 h-6 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center text-xs transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold text-[#0A6E3B]">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Appuyez pour voir les détails
                </span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          2. NOTIFICATION CENTER DRAWER / MODAL
         ========================================================================= */}
      <AnimatePresence>
        {isNotificationCenterOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotificationCenterOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            {/* Slide-over Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="relative w-full max-w-md bg-[#F4F7F4] h-full shadow-2xl flex flex-col z-10 font-sans"
            >
              {/* Header */}
              <div className="p-5 bg-white border-b border-gray-200/80 shrink-0">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl brand-gradient text-white flex items-center justify-center text-lg shadow-md">
                      🔔
                    </div>
                    <div>
                      <h3 className="text-base font-black text-[#081A10]">
                        Centre de Notifications
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span>Messages & Teranga Thiob Dakar</span>
                        {unreadNotificationsCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-[#FF7824] text-white text-[10px] font-black">
                            {unreadNotificationsCount} non lu(s)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsNotificationCenterOpen(false)}
                    className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Simulation Bar for User Test */}
                <div className="mt-3.5 p-2.5 bg-gradient-to-r from-[#E6F5EC] to-[#FFF3E8] rounded-xl border border-emerald-200/60 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-black text-[#0A6E3B] flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    Tester les notifications :
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => triggerDailyTerangaMessage()}
                      className="px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-900 border border-amber-200 font-bold text-[10px] rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>☀️</span>
                      <span>Message 10h</span>
                    </button>
                    <button
                      onClick={() => triggerProximityNotification(clientNeighborhood || 'Almadies')}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-[#0A6E3B] border border-emerald-200 font-bold text-[10px] rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>📍</span>
                      <span>GPS Proximité</span>
                    </button>
                    <button
                      onClick={() => triggerSystemUpdateNotification()}
                      className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-800 border border-blue-200 font-bold text-[10px] rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>🚀</span>
                      <span>Mise à jour</span>
                    </button>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'all', label: 'Toutes', icon: '✨' },
                    { id: 'teranga_daily', label: 'Teranga (10h)', icon: '☀️' },
                    { id: 'geo_proximity', label: 'Proximité', icon: '📍' },
                    { id: 'order_status', label: 'Commandes', icon: '📦' },
                    { id: 'system_update', label: 'Nouveautés', icon: '🚀' },
                  ].map((tab) => {
                    const isActive = activeFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveFilter(tab.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                          isActive
                            ? 'bg-[#0A6E3B] text-white shadow-sm'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                        }`}
                      >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notification List Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredNotifications.length === 0 ? (
                  <div className="py-16 text-center space-y-3 bg-white/60 rounded-2xl border border-dashed border-gray-300 p-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#E6F5EC] text-[#0A6E3B] flex items-center justify-center text-3xl mx-auto shadow-sm">
                      🕊️
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-[#081A10]">
                        Aucune notification dans cet onglet
                      </h4>
                      <p className="text-xs text-gray-500 max-w-xs mx-auto">
                        Les messages de Teranga de 10h, alertes de proximité et suivis de commande apparaîtront automatiquement ici.
                      </p>
                    </div>
                    <button
                      onClick={() => triggerDailyTerangaMessage()}
                      className="px-4 py-2 bg-[#0A6E3B] text-white text-xs font-bold rounded-xl hover:bg-[#085a30] transition-colors cursor-pointer"
                    >
                      ☀️ Recevoir un message Teranga
                    </button>
                  </div>
                ) : (
                  filteredNotifications.map((notif) => {
                    return (
                      <motion.div
                        key={notif.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                          notif.read
                            ? 'bg-white/80 border-gray-200/80 hover:bg-white text-gray-700'
                            : 'bg-white border-[#0A6E3B]/40 shadow-md ring-1 ring-[#0A6E3B]/20 text-[#081A10]'
                        }`}
                      >
                        {/* Unread indicator dot */}
                        {!notif.read && (
                          <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-[#FF7824] ring-4 ring-[#FF7824]/20 animate-pulse" />
                        )}

                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                            notif.type === 'teranga_daily'
                              ? 'bg-amber-100 text-amber-700'
                              : notif.type === 'geo_proximity'
                              ? 'bg-emerald-100 text-[#0A6E3B]'
                              : notif.type === 'order_status'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {notif.icon || '🔔'}
                          </div>

                          {/* Text */}
                          <div className="flex-1 min-w-0 pr-6">
                            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getBadgeStyle(notif.type)}`}>
                                {getCategoryLabel(notif.type)}
                              </span>
                              <span className="text-[10px] text-gray-400 font-semibold">
                                {notif.timestamp}
                              </span>
                            </div>

                            <h4 className="text-xs font-black text-[#081A10] leading-snug">
                              {notif.title}
                            </h4>

                            <p className="text-xs text-gray-600 mt-1 leading-relaxed whitespace-pre-line">
                              {notif.message}
                            </p>

                            {/* Action footer */}
                            {notif.actionData?.neighborhood && (
                              <div className="mt-2 text-[10px] font-bold text-[#0A6E3B] flex items-center gap-1 bg-[#E6F5EC] px-2.5 py-1 rounded-lg w-fit">
                                <MapPin className="w-3 h-3" />
                                <span>Voir les restaurants à {notif.actionData.neighborhood} ➔</span>
                              </div>
                            )}

                            {notif.type === 'teranga_daily' && (
                              <div className="mt-2 text-[10px] font-bold text-amber-800 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg w-fit border border-amber-200">
                                <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                                <span>Générosité de l'équipe Thiob • 10h du matin</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Card Hover Actions */}
                        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                          <span>Appuyer pour marquer lu</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notif.id);
                            }}
                            className="text-gray-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Footer Actions */}
              {notifications.length > 0 && (
                <div className="p-4 bg-white border-t border-gray-200 flex items-center justify-between gap-3 shrink-0">
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="flex-1 py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5 text-[#0A6E3B]" />
                    <span>Tout marquer comme lu</span>
                  </button>
                  <button
                    onClick={clearAllNotifications}
                    className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Vider</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
