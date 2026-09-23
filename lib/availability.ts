import type { Product } from "./types";

type Avail = Pick<Product, "is_visible" | "in_stock" | "quantity" | "is_coming_soon">;

/** The only definition of "can a customer order this". */
export const isPurchasable = (p: Avail) => p.is_visible && !p.is_coming_soon && p.in_stock && p.quantity > 0;

export const maxQty = (p: Avail) => (isPurchasable(p) ? p.quantity : 0);
