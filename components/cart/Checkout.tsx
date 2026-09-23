"use client";

import { useId } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { buildOrderMessage, buildWhatsAppUrl, orderProblem } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import type { CustomerDetails } from "@/lib/types";
import { useCart } from "./CartProvider";

/**
 * Pickup/delivery choice (required) and delivery address (required for delivery).
 * `full` adds the optional name and notes fields used in the cart panel.
 */
export function CheckoutFields({ full = false, idPrefix }: { full?: boolean; idPrefix: string }) {
  const { details, setDetails } = useCart();
  const set = (patch: Partial<CustomerDetails>) => setDetails((d) => ({ ...d, ...patch }));

  return (
    <div className={cn("space-y-3", full && "space-y-4")}>
      {full && (
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-name`}>Your name (optional)</Label>
          <Input id={`${idPrefix}-name`} value={details.name ?? ""} onChange={(e) => set({ name: e.target.value })} autoComplete="name" />
        </div>
      )}

      <fieldset className="space-y-1.5">
        <legend className="mb-1.5 text-sm font-medium">
          Pickup or delivery? <span className="text-destructive">*</span>
        </legend>
        <RadioGroup
          value={details.fulfilment ?? ""}
          onValueChange={(v) => set({ fulfilment: v as CustomerDetails["fulfilment"] })}
          className="flex gap-6"
        >
          {(["Pickup", "Delivery"] as const).map((v) => (
            <div key={v} className="flex items-center gap-2">
              <RadioGroupItem value={v} id={`${idPrefix}-${v}`} />
              <Label htmlFor={`${idPrefix}-${v}`} className="font-normal">
                {v}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </fieldset>

      {details.fulfilment === "Delivery" && (
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-address`}>
            Delivery address <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${idPrefix}-address`}
            value={details.address ?? ""}
            onChange={(e) => set({ address: e.target.value })}
            autoComplete="street-address"
            placeholder="Street, unit, city"
          />
        </div>
      )}

      {full && (
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-notes`}>Notes (optional)</Label>
          <Textarea
            id={`${idPrefix}-notes`}
            rows={2}
            value={details.notes ?? ""}
            onChange={(e) => set({ notes: e.target.value })}
            placeholder="Best time, substitutions, anything else…"
          />
        </div>
      )}
    </div>
  );
}

/** Green "Order now" button that opens WhatsApp, disabled with a reason until the order can be sent. */
export function OrderNowButton({ size = "default" }: { size?: "default" | "lg" }) {
  const { items, details, storeName, whatsappNumber } = useCart();
  const hintId = useId();

  if (!whatsappNumber) {
    return <p className="rounded-lg bg-muted p-3 text-center text-sm text-muted-foreground">Online ordering opens soon.</p>;
  }

  const problem = orderProblem(details);
  const className = "w-full bg-[#25D366] text-white hover:bg-[#1ebe5b]";

  return (
    <div className="space-y-1.5">
      {problem ? (
        <Button size={size} className={className} disabled aria-describedby={hintId}>
          <MessageCircle className="mr-2 h-4 w-4" />
          Order now
        </Button>
      ) : (
        <Button asChild size={size} className={className}>
          <a href={buildWhatsAppUrl(whatsappNumber, buildOrderMessage(items, storeName, details))} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="mr-2 h-4 w-4" />
            Order now
          </a>
        </Button>
      )}
      <p id={hintId} className={cn("text-center text-xs", problem ? "font-medium text-destructive" : "text-muted-foreground")}>
        {problem ? `${problem} to order` : "Opens WhatsApp with your order — no payment online."}
      </p>
    </div>
  );
}
