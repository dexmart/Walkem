"use client";

import { useState } from "react";
import { MessageCircle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { maxQty } from "@/lib/availability";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { useCart, type CartProduct } from "./CartProvider";
import { QtyStepper } from "./QtyStepper";

export function AddToCart({ product, compact = false }: { product: CartProduct; compact?: boolean }) {
  const { add, storeName, whatsappNumber } = useCart();
  const [qty, setQty] = useState(1);
  const max = maxQty(product);

  if (product.is_coming_soon) {
    return whatsappNumber ? (
      <Button asChild variant="outline" className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
        <a
          href={buildWhatsAppUrl(whatsappNumber, `Hi ${storeName}! When will ${product.name} be available?`)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Ask about this
        </a>
      </Button>
    ) : (
      <Button disabled variant="secondary" className="w-full">
        Coming soon
      </Button>
    );
  }

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
