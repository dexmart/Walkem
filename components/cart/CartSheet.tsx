"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertCircle, MessageCircle, ShoppingBag, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatPrice } from "@/lib/format";
import { buildOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { FALLBACK_IMAGE } from "@/lib/site";
import type { CustomerDetails } from "@/lib/types";
import { useCart } from "./CartProvider";
import { QtyStepper } from "./QtyStepper";

export function CartSheet() {
  const { items, total, open, setOpen, setQty, remove, clear, refresh, storeName, whatsappNumber } = useCart();
  const [details, setDetails] = useState<CustomerDetails>({ fulfilment: "Pickup" });
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

  const orderUrl = whatsappNumber ? buildWhatsAppUrl(whatsappNumber, buildOrderMessage(items, storeName, details)) : null;

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

              <div className="mt-4 space-y-4 rounded-xl bg-muted/50 p-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cart-name">Your name (optional)</Label>
                  <Input
                    id="cart-name"
                    value={details.name ?? ""}
                    onChange={(e) => setDetails((d) => ({ ...d, name: e.target.value }))}
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Pickup or delivery?</Label>
                  <RadioGroup
                    value={details.fulfilment}
                    onValueChange={(v) => setDetails((d) => ({ ...d, fulfilment: v as CustomerDetails["fulfilment"] }))}
                    className="flex gap-6"
                  >
                    {(["Pickup", "Delivery"] as const).map((v) => (
                      <div key={v} className="flex items-center gap-2">
                        <RadioGroupItem value={v} id={`f-${v}`} />
                        <Label htmlFor={`f-${v}`} className="font-normal">
                          {v}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cart-notes">Notes (optional)</Label>
                  <Textarea
                    id="cart-notes"
                    rows={2}
                    value={details.notes ?? ""}
                    onChange={(e) => setDetails((d) => ({ ...d, notes: e.target.value }))}
                    placeholder="Delivery address, best time, substitutions…"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t bg-background px-5 py-4">
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground">Estimated total</span>
                <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
              </div>
              {orderUrl ? (
                <Button asChild size="lg" className="w-full bg-[#25D366] text-white hover:bg-[#1ebe5b]">
                  <a href={orderUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Order on WhatsApp
                  </a>
                </Button>
              ) : (
                <p className="rounded-lg bg-muted p-3 text-center text-sm text-muted-foreground">
                  WhatsApp ordering opens soon. Please visit or call the store in the meantime.
                </p>
              )}
              <p className="text-center text-xs text-muted-foreground">
                No payment is taken on this site. Final price and delivery are confirmed with you on WhatsApp.
              </p>
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
