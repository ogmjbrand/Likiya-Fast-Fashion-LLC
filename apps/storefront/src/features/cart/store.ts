import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLineItem {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantTitle: string | null;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  quantity: number;
  maxQuantity: number;
}

interface CartState {
  items: CartLineItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  addItem: (item: Omit<CartLineItem, "quantity">, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
  subtotal: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.variantId === item.variantId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: Math.min(i.quantity + quantity, i.maxQuantity) }
                  : i,
              ),
              isOpen: true,
            };
          }
          return {
            items: [...state.items, { ...item, quantity: Math.min(quantity, item.maxQuantity) }],
            isOpen: true,
          };
        }),
      removeItem: (variantId) =>
        set((state) => ({ items: state.items.filter((i) => i.variantId !== variantId) })),
      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.variantId !== variantId)
              : state.items.map((i) =>
                  i.variantId === variantId
                    ? { ...i, quantity: Math.min(quantity, i.maxQuantity) }
                    : i,
                ),
        })),
      clear: () => set({ items: [] }),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "likiya-cart" },
  ),
);
