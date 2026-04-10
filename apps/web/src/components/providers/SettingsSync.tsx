'use client';

import { useEffect, useState } from 'react';
import { getSiteSettings } from '@prakash/firebase';
import { useCartStore } from '@/store/cart';

export function SettingsSync() {
  const setShippingSettings = useCartStore((state) => state.setShippingSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function syncSettings() {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error('Settings sync timeout')), 15000)
        );

        const settingsPromise = getSiteSettings().then((settings) => {
          if (settings) {
            setShippingSettings(settings.shippingCost || 0, settings.freeShippingThreshold || 500);
          }
        });
        
        await Promise.race([settingsPromise, timeoutPromise]);
      } catch (error) {
        // Silently fail - keep using default values
        console.warn('Settings sync warning:', error);
      } finally {
        setLoaded(true);
      }
    }

    syncSettings();
  }, [setShippingSettings]);

  // Don't block rendering - always return null
  return null;
}
