"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { cartCount, cartReducer, cartTotal, syncChanges, type CartAction } from "@/lib/cart";
import { maxQty } from "@/lib/availability";
import type { CartItem, Product } from "@/lib/types";

const STORAGE_KEY = "walkem-cart-v1";

export type CartProduct = Pick<Product, "id" | "slug" | "name" | "price" | "unit" | "images" | "quantity" | "in_stock" | "is_visible">;

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (product: CartProduct, qty: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  /** Applies live stock/prices; returns messages describing what changed. */
  sync: (products: Extract<CartAction, { type: "sync" }>["products"]) => string[];
  storeName: string;
  whatsappNumber: string | null;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
  storeName,
  whatsappNumber,
}: {
  children: ReactNode;
  storeName: string;
  whatsappNumber: string | null;
}) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) dispatch({ type: "hydrate", items: JSON.parse(saved) as CartItem[] });
    } catch {
      // Storage unavailable (private mode etc.) — cart just won't persist.
    }
    // Reading localStorage has to wait until after hydration, so this setState in an effect is intended.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  // Only save after the stored cart has been loaded, or the empty initial cart would overwrite it.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // ignore
    }
  }, [hydrated, state.items]);

  const add = useCallback((p: CartProduct, qty: number) => {
    const limit = maxQty(p);
    if (limit === 0) {
      toast.error(`${p.name} is sold out`);
      return;
    }
    dispatch({
      type: "add",
      item: { productId: p.id, slug: p.slug, name: p.name, price: Number(p.price), unit: p.unit, image: p.images[0] ?? null, maxQty: limit },
      qty,
    });
    toast.success(`Added ${p.name} to your cart`, { action: { label: "View cart", onClick: () => setOpen(true) } });
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items: state.items,
      count: cartCount(state.items),
      total: cartTotal(state.items),
      open,
      setOpen,
      add,
      setQty: (productId, qty) => dispatch({ type: "setQty", productId, qty }),
      remove: (productId) => dispatch({ type: "remove", productId }),
      clear: () => dispatch({ type: "clear" }),
      sync: (products) => {
        const after = cartReducer(state, { type: "sync", products }).items;
        dispatch({ type: "hydrate", items: after });
        return syncChanges(state.items, after);
      },
      storeName,
      whatsappNumber,
    }),
    [state, open, add, storeName, whatsappNumber],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
