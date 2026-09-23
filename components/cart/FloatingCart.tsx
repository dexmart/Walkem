"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { FALLBACK_IMAGE } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useCart } from "./CartProvider";
import { QtyStepper } from "./QtyStepper";
import { CheckoutFields, OrderNowButton } from "./Checkout";

/**
 * Basket pinned to the bottom-right corner. On devices with a mouse, hovering shows a mini cart
 * (edit quantities, remove, order on WhatsApp); clicking or tapping opens the full cart panel.
 */
export function FloatingCart() {
  const { items, count, total, open: sheetOpen, setOpen, setQty, remove, refresh } = useCart();
  const [preview, setPreview] = useState(false);
  const [notices, setNotices] = useState<string[]>([]);
  const [bump, setBump] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastCount = useRef(count);
  const containerRef = useRef<HTMLDivElement>(null);

  // Briefly pulse the basket whenever something is added.
  useEffect(() => {
    if (count <= lastCount.current) {
      lastCount.current = count;
      return;
    }
    lastCount.current = count;
    setBump(true);
    const t = setTimeout(() => setBump(false), 450);
    return () => clearTimeout(t);
  }, [count]);

  const canHover = () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const showPreview = () => {
    clearTimeout(closeTimer.current);
    if (preview || !canHover()) return;
    setPreview(true);
    refresh().then(setNotices);
  };
  const hidePreview = () => {
    clearTimeout(closeTimer.current);
    // Keep it open while the customer is typing in it (e.g. the delivery address).
    if (containerRef.current?.contains(document.activeElement) && document.activeElement?.tagName === "INPUT") return;
    closeTimer.current = setTimeout(() => {
      setPreview(false);
      setNotices([]);
    }, 250);
  };

  const openFullCart = () => {
    setPreview(false);
    setOpen(true);
  };

  if (sheetOpen) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6"
      onMouseEnter={showPreview}
      onMouseLeave={hidePreview}
      ref={containerRef}
      onKeyDown={(e) => e.key === "Escape" && setPreview(false)}
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node | null) && !containerRef.current?.matches(":hover")) hidePreview();
      }}
    >
      {preview && (
        <div
          role="dialog"
          aria-label="Cart preview"
          className="absolute bottom-[4.5rem] right-0 flex max-h-[80vh] w-[22rem] flex-col overflow-hidden rounded-2xl border bg-background shadow-[var(--shadow-elevated)] animate-scale-in"
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <p className="font-display text-lg font-bold">Your cart</p>
            <span className="text-sm text-muted-foreground">
              {count} item{count === 1 ? "" : "s"}
            </span>
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              <p className="mb-3">Your cart is empty.</p>
              <Link href="/shop" className="font-medium text-primary hover:underline">
                Browse products
              </Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-4">
                {notices.length > 0 && (
                  <ul role="status" className="mt-3 rounded-lg bg-accent/15 p-2 text-xs">
                    {notices.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                )}
                <ul className="divide-y">
                  {items.map((i) => (
                    <li key={i.productId} className="flex gap-3 py-3">
                      <Image
                        src={i.image ?? FALLBACK_IMAGE}
                        alt=""
                        width={48}
                        height={48}
                        className="h-12 w-12 shrink-0 rounded-md object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <Link href={`/products/${i.slug}`} className="truncate text-sm font-medium hover:text-primary">
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
                        <div className="mt-1 flex items-center justify-between">
                          <QtyStepper size="sm" value={i.qty} max={i.maxQty} onChange={(n) => n >= 1 && setQty(i.productId, n)} />
                          <span className="text-sm font-semibold">{formatPrice(i.price * i.qty)}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 border-t px-4 py-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Estimated total</span>
                  <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
                </div>
                <CheckoutFields idPrefix="mini" />
                <OrderNowButton />
                <button type="button" onClick={openFullCart} className="w-full text-center text-sm text-muted-foreground underline hover:text-foreground">
                  View full cart · add name &amp; notes
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={openFullCart}
        onFocus={showPreview}
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-elevated)] transition-transform hover:scale-105 sm:h-16 sm:w-16",
          bump && "scale-110",
        )}
        aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
      >
        <ShoppingBag className="h-6 w-6 sm:h-7 sm:w-7" />
        <span
          className={cn(
            "absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-background bg-secondary px-1 text-xs font-bold text-secondary-foreground transition-transform",
            bump && "scale-125",
          )}
        >
          {count > 99 ? "99+" : count}
        </span>
      </button>
    </div>
  );
}
