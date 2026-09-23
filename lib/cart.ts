import type { CartItem, Product } from "./types";
import { maxQty } from "./availability";
import { formatPrice } from "./format";

export type CartState = { items: CartItem[] };

export type CartAction =
  | { type: "add"; item: Omit<CartItem, "qty">; qty: number }
  | { type: "setQty"; productId: string; qty: number }
  | { type: "remove"; productId: string }
  | { type: "clear" }
  | { type: "hydrate"; items: CartItem[] }
  | { type: "sync"; products: Pick<Product, "id" | "name" | "price" | "quantity" | "in_stock" | "is_visible" | "is_coming_soon">[] };

const clamp = (n: number, max: number) => Math.max(0, Math.min(Math.floor(n), max));

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "add": {
      const existing = state.items.find((i) => i.productId === action.item.productId);
      const qty = clamp((existing?.qty ?? 0) + action.qty, action.item.maxQty);
      if (qty === 0) return state;
      const next = { ...action.item, qty };
      return {
        items: existing ? state.items.map((i) => (i.productId === next.productId ? next : i)) : [...state.items, next],
      };
    }
    case "setQty":
      return {
        items: state.items
          .map((i) => (i.productId === action.productId ? { ...i, qty: clamp(action.qty, i.maxQty) } : i))
          .filter((i) => i.qty > 0),
      };
    case "remove":
      return { items: state.items.filter((i) => i.productId !== action.productId) };
    case "clear":
      return { items: [] };
    case "hydrate":
      return { items: action.items };
    case "sync": {
      const byId = new Map(action.products.map((p) => [p.id, p]));
      const items: CartItem[] = [];
      for (const i of state.items) {
        const p = byId.get(i.productId);
        if (!p) continue;
        const max = maxQty(p);
        if (max === 0) continue;
        items.push({ ...i, name: p.name, price: Number(p.price), maxQty: max, qty: Math.min(i.qty, max) });
      }
      return { items };
    }
  }
}

export const cartTotal = (items: CartItem[]) =>
  Math.round(items.reduce((s, i) => s + i.price * i.qty, 0) * 100) / 100;

export const cartCount = (items: CartItem[]) => items.reduce((s, i) => s + i.qty, 0);

/** Human-readable notes about what a sync changed, shown in the cart. */
export function syncChanges(before: CartItem[], after: CartItem[]): string[] {
  const out: string[] = [];
  const byId = new Map(after.map((i) => [i.productId, i]));
  for (const b of before) {
    const a = byId.get(b.productId);
    if (!a) {
      out.push(`${b.name} is no longer available and was removed`);
      continue;
    }
    if (a.price !== b.price) out.push(`${a.name} price changed to ${formatPrice(a.price)}`);
    if (a.qty < b.qty) out.push(`${a.name} quantity reduced to ${a.qty} (only ${a.maxQty} left)`);
  }
  return out;
}
