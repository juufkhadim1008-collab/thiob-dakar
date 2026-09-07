'use client';

import React from 'react';
import { AppProvider } from '@/lib/store';
import MobileDeviceShowcase from '@/components/MobileDeviceShowcase';
import NotificationCenter from '@/components/NotificationCenter';

export default function Page() {
  return (
    <AppProvider>
      <MobileDeviceShowcase />
      <NotificationCenter />
    </AppProvider>
  );
}
