"use client";

import { useId, useState, type ReactNode } from "react";
import { Check, Copy, Landmark, MessageCircle, Store, Truck, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cartTotal } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { buildOrderMessage, buildWhatsAppUrl, orderProblem } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import type { CustomerDetails } from "@/lib/types";
import { useCart } from "./CartProvider";

/** Large tappable option card (used as a radio button). */
function ChoiceCard({
  selected,
  onSelect,
  icon,
  title,
  subtitle,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={`${title} — ${subtitle}`}
      onClick={onSelect}
      className={cn(
        "flex flex-1 flex-col items-center gap-1 rounded-2xl border-2 px-3 py-4 text-center transition-all",
        selected ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-background hover:border-primary/40",
      )}
    >
      <span className={cn("mb-1 rounded-full p-2", selected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
        {icon}
      </span>
      <span className="text-sm font-semibold">{title}</span>
      <span className="text-xs text-muted-foreground">{subtitle}</span>
    </button>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="mb-3 font-display text-lg font-bold">{children}</h3>;
}

function Required() {
  return <span className="text-destructive"> *</span>;
}

/** Interac e-Transfer instructions with a copy button and the "I have sent it" tick. */
function InteracDetails() {
  const { items, details, setDetails, interacEmail } = useCart();
  const [copied, setCopied] = useState(false);
  const amount = formatPrice(cartTotal(items));
  const email = interacEmail ?? "walkemfoods@gmail.com";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      toast.success("Email copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — please type the email");
    }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
        <p className="mb-1 flex items-center gap-2 font-semibold">
          <Landmark className="h-4 w-4 text-primary" /> Payment details
        </p>
        <p className="mb-3 text-xs text-muted-foreground">Send an Interac e-Transfer to the email below to confirm your order.</p>
        <dl className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Method</dt>
            <dd className="font-semibold">Interac e-Transfer</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Send to</dt>
            <dd className="flex min-w-0 items-center gap-1.5 font-semibold">
              <span className="truncate">{email}</span>
              <button
                type="button"
                onClick={copy}
                className="shrink-0 rounded-md p-1 hover:bg-primary/10"
                aria-label="Copy e-Transfer email"
              >
                {copied ? <Check className="h-4 w-4 text-secondary" /> : <Copy className="h-4 w-4" />}
              </button>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-primary/20 pt-2">
            <dt className="text-muted-foreground">Amount</dt>
            <dd className="font-display text-xl font-bold text-primary">{amount} CAD</dd>
          </div>
        </dl>
        {details.fulfilment === "Delivery" && (
          <p className="mt-2 text-xs text-muted-foreground">Items only — any delivery fee is confirmed on WhatsApp.</p>
        )}
      </div>

      <button
        type="button"
        role="checkbox"
        aria-checked={Boolean(details.interacSent)}
        aria-label="I have sent the e-Transfer"
        onClick={() => setDetails((d) => ({ ...d, interacSent: !d.interacSent }))}
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition-colors",
          details.interacSent ? "border-secondary bg-secondary/5" : "border-border hover:border-secondary/40",
        )}
      >
        <span
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2",
            details.interacSent ? "border-secondary bg-secondary text-secondary-foreground" : "border-muted-foreground/40",
          )}
        >
          {details.interacSent && <Check className="h-4 w-4" />}
        </span>
        <span>
          <span className="block text-sm font-semibold">I have sent the e-Transfer</span>
          <span className="block text-xs text-muted-foreground">Tick this if you&apos;ve already sent the payment</span>
        </span>
      </button>
    </div>
  );
}

/** Everything the store needs to fulfil the order: pickup/delivery, contact details, payment and notes. */
export function CheckoutFields({ idPrefix }: { idPrefix: string }) {
  const { details, setDetails } = useCart();
  const set = (patch: Partial<CustomerDetails>) => setDetails((d) => ({ ...d, ...patch }));
  const payLaterLabel = details.fulfilment === "Delivery" ? "Pay on delivery" : "Pay on pickup";

  return (
    <div className="space-y-6">
      <section>
        <SectionTitle>Order details</SectionTitle>
        <div role="radiogroup" aria-label="Pickup or delivery" className="flex gap-3">
          <ChoiceCard
            selected={details.fulfilment === "Pickup"}
            onSelect={() => set({ fulfilment: "Pickup" })}
            icon={<Store className="h-5 w-5" />}
            title="Pickup"
            subtitle="Come get it"
          />
          <ChoiceCard
            selected={details.fulfilment === "Delivery"}
            onSelect={() => set({ fulfilment: "Delivery" })}
            icon={<Truck className="h-5 w-5" />}
            title="Delivery"
            subtitle="To your door"
          />
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-name`}>
            Your name
            <Required />
          </Label>
          <Input
            id={`${idPrefix}-name`}
            value={details.name ?? ""}
            onChange={(e) => set({ name: e.target.value })}
            autoComplete="name"
            placeholder="Enter your name"
            className="h-12 rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-phone`}>
            Phone number
            <Required />
          </Label>
          <Input
            id={`${idPrefix}-phone`}
            type="tel"
            inputMode="tel"
            value={details.phone ?? ""}
            onChange={(e) => set({ phone: e.target.value })}
            autoComplete="tel"
            placeholder="e.g. (506) 555-0123"
            className="h-12 rounded-xl"
          />
        </div>
        {details.fulfilment === "Delivery" && (
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-address`}>
              Delivery address
              <Required />
            </Label>
            <Input
              id={`${idPrefix}-address`}
              value={details.address ?? ""}
              onChange={(e) => set({ address: e.target.value })}
              autoComplete="street-address"
              placeholder="Street, unit, city"
              className="h-12 rounded-xl"
            />
            <p className="text-xs text-muted-foreground">Any delivery fee is confirmed with you on WhatsApp.</p>
          </div>
        )}
      </section>

      <section>
        <SectionTitle>Payment</SectionTitle>
        <div role="radiogroup" aria-label="Payment method" className="mb-3 flex gap-3">
          <ChoiceCard
            selected={details.payment === "Interac"}
            onSelect={() => set({ payment: "Interac" })}
            icon={<Landmark className="h-5 w-5" />}
            title="Interac e-Transfer"
            subtitle="Pay now"
          />
          <ChoiceCard
            selected={details.payment === "Later"}
            onSelect={() => set({ payment: "Later", interacSent: false })}
            icon={<Wallet className="h-5 w-5" />}
            title={payLaterLabel}
            subtitle="Pay in person"
          />
        </div>
        {details.payment === "Interac" && <InteracDetails />}
      </section>

      <section className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-notes`}>Extra notes (optional)</Label>
        <Textarea
          id={`${idPrefix}-notes`}
          rows={3}
          value={details.notes ?? ""}
          onChange={(e) => set({ notes: e.target.value })}
          placeholder="Any special requests?"
          className="rounded-xl"
        />
      </section>
    </div>
  );
}

/** Green "Order now" button that opens WhatsApp, disabled with the reason until the order is complete. */
export function OrderNowButton() {
  const { items, details, storeName, whatsappNumber, interacEmail } = useCart();
  const hintId = useId();

  if (!whatsappNumber) {
    return <p className="rounded-xl bg-muted p-3 text-center text-sm text-muted-foreground">Online ordering opens soon.</p>;
  }

  const problem = orderProblem(details);
  const className =
    "h-12 w-full rounded-full bg-[#25D366] text-base font-semibold text-white shadow-lg shadow-[#25D366]/25 hover:bg-[#1ebe5b]";

  return (
    <div className="space-y-1.5">
      {problem ? (
        <Button className={className} disabled aria-describedby={hintId}>
          <MessageCircle className="mr-2 h-5 w-5" />
          Order now
        </Button>
      ) : (
        <Button asChild className={className}>
          <a
            href={buildWhatsAppUrl(whatsappNumber, buildOrderMessage(items, { name: storeName, interacEmail }, details))}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Order now
          </a>
        </Button>
      )}
      <p id={hintId} className={cn("text-center text-xs", problem ? "font-medium text-destructive" : "text-muted-foreground")}>
        {problem ? `${problem} to place your order` : "Opens WhatsApp with your full order — we'll confirm it there."}
      </p>
    </div>
  );
}
