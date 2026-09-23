"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { maxQty } from "@/lib/availability";
import { useCart, type CartProduct } from "./CartProvider";
import { QtyStepper } from "./QtyStepper";

export function AddToCart({ product, compact = false }: { product: CartProduct; compact?: boolean }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const max = maxQty(product);

  if (max === 0) {
    return (
      <Button disabled variant="secondary" className="w-full">
        Sold out
      </Button>
    );
  }

  if (compact) {
    return (
      <Button className="w-full" onClick={() => add(product, 1)}>
        <ShoppingCart className="mr-2 h-4 w-4" />
        Add to cart
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <QtyStepper value={qty} max={max} onChange={(n) => setQty(Math.max(1, Math.min(n, max)))} />
      <Button size="lg" className="flex-1" onClick={() => add(product, qty)}>
        <ShoppingCart className="mr-2 h-5 w-5" />
        Add to cart
      </Button>
    </div>
  );
}
