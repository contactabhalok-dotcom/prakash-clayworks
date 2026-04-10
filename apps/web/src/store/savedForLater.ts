import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@prakash/types';

interface SavedForLaterItem {
  productId: string;
  title: { en: string; hi: string };
  image: string;
  price: number;
  salePrice?: number;
  savedAt: Date;
}

interface SavedForLaterState {
  items: SavedForLaterItem[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInSavedForLater: (productId: string) => boolean;
  toggleItem: (product: Product) => void;
  clearAll: () => void;
  getItemCount: () => number;
}

export const useSavedForLaterStore = create<SavedForLaterState>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),

      addItem: (product: Product) => {
        const { items } = get();
        if (items.find((item) => item.productId === product.id)) return;

        const newItem: SavedForLaterItem = {
          productId: product.id,
          title: product.title,
          image: product.images[0] || '',
          price: product.price,
          salePrice: product.salePrice,
          savedAt: new Date(),
        };
        set({ items: [...items, newItem] });
      },

      removeItem: (productId: string) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        });
      },

      isInSavedForLater: (productId: string) => {
        return get().items.some((item) => item.productId === productId);
      },

      toggleItem: (product: Product) => {
        const { isInSavedForLater, addItem, removeItem } = get();
        if (isInSavedForLater(product.id)) {
          removeItem(product.id);
        } else {
          addItem(product);
        }
      },

      clearAll: () => {
        set({ items: [] });
      },

      getItemCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'prakash-saved-for-later',
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
