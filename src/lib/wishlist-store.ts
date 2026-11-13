import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface WishlistItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  pricePence: number;
  salePricePence: number | null;
}

interface WishlistState {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => boolean;
  remove: (productId: string) => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) => {
        const exists = get().items.some((i) => i.productId === item.productId);
        set((s) => ({
          items: exists ? s.items.filter((i) => i.productId !== item.productId) : [item, ...s.items],
        }));
        return !exists;
      },
      remove: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
    }),
    { name: "saf-wishlist", storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);
