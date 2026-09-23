"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, ShoppingBag, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { FALLBACK_IMAGE } from "@/lib/site";
import { useCart } from "./CartProvider";
import { QtyStepper } from "./QtyStepper";
import { CheckoutFields, OrderNowButton } from "./Checkout";

export function CartSheet() {
  const { items, total, open, setOpen, setQty, remove, clear, refresh } = useCart();
  const [notices, setNotices] = useState<string[]>([]);

  // Re-check stock and prices every time the cart is opened.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    refresh().then((n) => !cancelled && setNotices(n));
    return () => {
      cancelled = true;
    };
  }, [open, refresh]);

  return (
    <Sheet open={open} onOpenChange={(o) => { setOpen(o); if (!o) setNotices([]); }}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-4 text-left">
          <SheetTitle className="font-display text-2xl">Your cart</SheetTitle>
          <SheetDescription>Send your order on WhatsApp — we&apos;ll confirm price and delivery with you there.</SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild onClick={() => setOpen(false)}>
              <Link href="/shop">Browse products</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {notices.length > 0 && (
                <div role="status" className="mb-4 rounded-lg border border-accent bg-accent/15 p-3 text-sm">
                  <p className="mb-1 flex items-center gap-2 font-semibold">
                    <AlertCircle className="h-4 w-4" /> Your cart was updated
                  </p>
                  <ul className="list-disc pl-5">
                    {notices.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}

              <ul className="divide-y">
                {items.map((i) => (
                  <li key={i.productId} className="flex gap-3 py-4">
                    <Image
                      src={i.image ?? FALLBACK_IMAGE}
                      alt={i.name}
                      width={72}
                      height={72}
                      className="h-[72px] w-[72px] shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/products/${i.slug}`}
                          onClick={() => setOpen(false)}
                          className="font-medium leading-tight hover:text-primary"
                        >
                          {i.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => remove(i.productId)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label={`Remove ${i.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(i.price)} {i.unit}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <QtyStepper size="sm" value={i.qty} max={i.maxQty} onChange={(n) => n >= 1 && setQty(i.productId, n)} />
                        <span className="font-semibold">{formatPrice(i.price * i.qty)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 rounded-xl bg-muted/50 p-4">
                <CheckoutFields full idPrefix="sheet" />
              </div>
            </div>

            <div className="space-y-3 border-t bg-background px-5 py-4">
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground">Estimated total</span>
                <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
              </div>
              <OrderNowButton size="lg" />
              <p className="text-center text-xs text-muted-foreground">Final price and delivery are confirmed with you on WhatsApp.</p>
              <button type="button" onClick={clear} className="mx-auto block text-sm text-muted-foreground underline hover:text-destructive">
                Clear cart
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
