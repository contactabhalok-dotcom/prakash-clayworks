import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@prakash/types';

// Default values from env (fallback)
const DEFAULT_FREE_SHIPPING_THRESHOLD = Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD) || 500;
const DEFAULT_SHIPPING_COST = Number(process.env.NEXT_PUBLIC_SHIPPING_COST) || 50;

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  _hasHydrated: boolean;
  // Dynamic shipping settings from Firestore
  shippingCost: number;
  freeShippingThreshold: number;
  setHasHydrated: (state: boolean) => void;
  setShippingSettings: (shippingCost: number, freeShippingThreshold: number) => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateCartPrices: (updatedItems: CartItem[]) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getSubtotal: () => number;
  getShipping: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      _hasHydrated: false,
      shippingCost: DEFAULT_SHIPPING_COST,
      freeShippingThreshold: DEFAULT_FREE_SHIPPING_THRESHOLD,
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),
      setShippingSettings: (shippingCost: number, freeShippingThreshold: number) =>
        set({ shippingCost, freeShippingThreshold }),

      addItem: (product: Product, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find((item) => item.productId === product.id);

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          const newItem: CartItem = {
            productId: product.id,
            title: product.title,
            image: product.images[0] || '',
            price: product.price,
            salePrice: product.salePrice,
            quantity,
            category: product.category,
          };
          set({ items: [...items, newItem] });
        }
      },

      removeItem: (productId: string) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        });
      },

      updateCartPrices: (updatedItems: CartItem[]) => {
        set({ items: updatedItems });
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => {
        set({ isOpen: !get().isOpen });
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.salePrice || item.price;
          return total + price * item.quantity;
        }, 0);
      },

      getShipping: () => {
        const subtotal = get().getSubtotal();
        const { freeShippingThreshold, shippingCost } = get();
        return subtotal >= freeShippingThreshold ? 0 : shippingCost;
      },

      getTotal: () => {
        return get().getSubtotal() + get().getShipping();
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'prakash-cart',
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
