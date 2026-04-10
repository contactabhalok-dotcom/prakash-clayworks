import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@prakash/types';

interface RecentlyViewedItem {
  productId: string;
  title: { en: string; hi: string };
  image: string;
  price: number;
  salePrice?: number;
  viewedAt: Date;
}

interface RecentlyViewedState {
  items: RecentlyViewedItem[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearHistory: () => void;
  getItemCount: () => number;
}

const MAX_ITEMS = 20;

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),

      addItem: (product: Product) => {
        const { items } = get();
        // Remove existing entry if present
        const filteredItems = items.filter((item) => item.productId !== product.id);

        const newItem: RecentlyViewedItem = {
          productId: product.id,
          title: product.title,
          image: product.images[0] || '',
          price: product.price,
          salePrice: product.salePrice,
          viewedAt: new Date(),
        };

        // Add at the beginning and limit to MAX_ITEMS
        const updatedItems = [newItem, ...filteredItems].slice(0, MAX_ITEMS);
        set({ items: updatedItems });
      },

      removeItem: (productId: string) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        });
      },

      clearHistory: () => {
        set({ items: [] });
      },

      getItemCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'prakash-recently-viewed',
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
