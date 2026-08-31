'use client';

import React from 'react';
import { AppProvider } from '@/lib/store';
import MobileDeviceShowcase from '@/components/MobileDeviceShowcase';

export default function Page() {
  return (
    <AppProvider>
      <MobileDeviceShowcase />
    </AppProvider>
  );
}
