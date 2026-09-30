"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, ShoppingBag, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { FALLBACK_IMAGE } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useCart } from "./CartProvider";
import { QtyStepper } from "./QtyStepper";
import { CheckoutFields, OrderNowButton } from "./Checkout";

const DESKTOP = "(min-width: 640px)";

/** True on tablet/desktop widths. The cart slides in from the right there, and up from the bottom on phones. */
function useIsDesktop() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(DESKTOP);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(DESKTOP).matches,
    () => true,
  );
}

export function CartSheet() {
  const { items, count, total, open, setOpen, setQty, remove, clear, refresh } = useCart();
  const [notices, setNotices] = useState<string[]>([]);
  const isDesktop = useIsDesktop();

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
    <Sheet
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setNotices([]);
      }}
    >
      <SheetContent
        side={isDesktop ? "right" : "bottom"}
        className={cn("flex flex-col gap-0 p-0", isDesktop ? "w-full sm:max-w-md" : "max-h-[92svh] rounded-t-3xl")}
      >
        {!isDesktop && <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/25" aria-hidden />}
        <SheetHeader className="px-5 pb-3 pt-4 text-left">
          <SheetTitle className="flex items-center gap-2 font-display text-2xl">
            Your order
            {count > 0 && (
              <span className="rounded-full bg-primary px-2.5 py-0.5 font-sans text-sm font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </SheetTitle>
          <SheetDescription>Choose pickup or delivery, then send your order on WhatsApp.</SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
            <span className="rounded-full bg-muted p-5">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </span>
            <p className="text-muted-foreground">Your cart is empty.</p>
            <Button asChild className="rounded-full" onClick={() => setOpen(false)}>
              <Link href="/shop">Browse products</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 pb-6">
              {notices.length > 0 && (
                <div role="status" className="mb-4 rounded-2xl border border-accent bg-accent/15 p-3 text-sm">
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

              <ul className="space-y-3">
                {items.map((i) => (
                  <li key={i.productId} className="flex items-center gap-3 rounded-2xl border bg-card p-3">
                    <Image
                      src={i.image ?? FALLBACK_IMAGE}
                      alt={i.name}
                      width={64}
                      height={64}
                      className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${i.slug}`}
                        onClick={() => setOpen(false)}
                        className="line-clamp-1 font-semibold leading-tight hover:text-primary"
                      >
                        {i.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(i.price)} {i.unit}
                      </p>
                      <p className="mt-0.5 font-bold text-primary">{formatPrice(i.price * i.qty)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        type="button"
                        onClick={() => remove(i.productId)}
                        className="rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Remove ${i.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="rounded-full bg-muted p-1">
                        <QtyStepper size="sm" value={i.qty} max={i.maxQty} onChange={(n) => n >= 1 && setQty(i.productId, n)} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="my-5 flex items-center justify-between border-y py-4">
                <span className="font-semibold">Subtotal</span>
                <span className="font-display text-2xl font-bold text-primary">{formatPrice(total)} CAD</span>
              </div>

              <CheckoutFields idPrefix="sheet" />

              <button
                type="button"
                onClick={clear}
                className="mx-auto mt-6 block text-sm text-muted-foreground underline hover:text-destructive"
              >
                Clear cart
              </button>
            </div>

            <div className="border-t bg-background/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
              <OrderNowButton />
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
