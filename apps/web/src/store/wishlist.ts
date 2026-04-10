import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@prakash/types';

interface WishlistItem {
  productId: string;
  title: { en: string; hi: string };
  image: string;
  price: number;
  salePrice?: number;
  addedAt: Date;
}

interface WishlistState {
  items: WishlistItem[];
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (product: Product) => void;
  clearWishlist: () => void;
  getItemCount: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),

      addItem: (product: Product) => {
        const { items } = get();
        if (items.find((item) => item.productId === product.id)) return;

        const newItem: WishlistItem = {
          productId: product.id,
          title: product.title,
          image: product.images[0] || '',
          price: product.price,
          salePrice: product.salePrice,
          addedAt: new Date(),
        };
        set({ items: [...items, newItem] });
      },

      removeItem: (productId: string) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        });
      },

      isInWishlist: (productId: string) => {
        return get().items.some((item) => item.productId === productId);
      },

      toggleItem: (product: Product) => {
        const { isInWishlist, addItem, removeItem } = get();
        if (isInWishlist(product.id)) {
          removeItem(product.id);
        } else {
          addItem(product);
        }
      },

      clearWishlist: () => {
        set({ items: [] });
      },

      getItemCount: () => {
        return get().items.length;
      },
    }),
    {
      name: 'prakash-wishlist',
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
