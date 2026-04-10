'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getSiteSettings, type SiteSettings } from '@prakash/firebase';

interface SiteSettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
  shippingCost: number;
  freeShippingThreshold: number;
}

const defaultSettings: SiteSettings = {
  businessName: 'Prakash Clayworks',
  phone: '+916290351365',
  whatsapp: '916290351365',
  email: 'hello@prakashclayworks.com',
  supportEmail: 'support@prakashclayworks.com',
  address: '34/3/5 old mullajor road jagatdal kolkata 743125 west bengal india',
  businessHours: 'Mon-Sat: 9:00 AM - 6:00 PM',
  instagram: 'https://instagram.com/prakashclayworks',
  facebook: 'https://facebook.com/prakashclayworks',
  youtube: 'https://youtube.com/@prakashclayworks',
  freeShippingThreshold: Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD) || 500,
  shippingCost: Number(process.env.NEXT_PUBLIC_SHIPPING_COST) || 50,
  gstNumber: '',
  taxRate: 18,
  aboutUs: '',
  updatedAt: new Date(),
};

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: defaultSettings,
  loading: true,
  shippingCost: defaultSettings.shippingCost,
  freeShippingThreshold: defaultSettings.freeShippingThreshold,
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSiteSettings();
        setSettings(data);
      } catch (error) {
        console.error('Failed to load site settings:', error);
        // Use defaults on error
        setSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const value: SiteSettingsContextType = {
    settings: settings || defaultSettings,
    loading,
    shippingCost: settings?.shippingCost ?? defaultSettings.shippingCost,
    freeShippingThreshold: settings?.freeShippingThreshold ?? defaultSettings.freeShippingThreshold,
  };

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
}
