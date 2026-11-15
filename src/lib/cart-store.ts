import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CartLine {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  colour: string | null;
  size: string | null;
  unitPricePence: number;
  quantity: number;
  maxQuantity: number;
}

export const MAX_LINE_QTY = 10;

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  bump: number;
  add: (line: Omit<CartLine, "key" | "quantity">, quantity?: number) => void;
  remove: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
}

export const lineKey = (productId: string, colour: string | null, size: string | null) =>
  `${productId}::${colour ?? "-"}::${size ?? "-"}`;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      bump: 0,
      add: (line, quantity = 1) =>
        set((s) => {
          const key = lineKey(line.productId, line.colour, line.size);
          const cap = Math.min(MAX_LINE_QTY, Math.max(1, line.maxQuantity));
          const existing = s.lines.find((l) => l.key === key);
          const lines = existing
            ? s.lines.map((l) =>
                l.key === key ? { ...l, ...line, quantity: Math.min(cap, l.quantity + quantity) } : l,
              )
            : [...s.lines, { ...line, key, quantity: Math.min(cap, quantity) }];
          return { lines, isOpen: true, bump: s.bump + 1 };
        }),
      remove: (key) => set((s) => ({ lines: s.lines.filter((l) => l.key !== key) })),
      setQuantity: (key, quantity) =>
        set((s) => ({
          lines: s.lines
            .map((l) =>
              l.key === key
                ? { ...l, quantity: Math.max(0, Math.min(Math.min(MAX_LINE_QTY, l.maxQuantity), quantity)) }
                : l,
            )
            .filter((l) => l.quantity > 0),
        })),
      clear: () => set({ lines: [] }),
      setOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: "saf-bag",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines }),
      skipHydration: true,
    },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);

import { useEffect, useState } from "react";

/** True once the saved bag has been restored from this browser. */
export function useCartHydrated() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (useCart.persist.hasHydrated()) setReady(true);
    return useCart.persist.onFinishHydration(() => setReady(true));
  }, []);
  return ready;
}
