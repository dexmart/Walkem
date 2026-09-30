import type { CartItem, CustomerDetails } from "./types";
import { formatPrice } from "./format";
import { cartTotal } from "./cart";

export const normalizePhone = (raw: string) => raw.replace(/\D/g, "");

export type OrderStore = { name: string; interacEmail: string | null };

/** The WhatsApp order text. Uses WhatsApp formatting (*bold*) so it reads cleanly on the store's phone. */
export function buildOrderMessage(items: CartItem[], store: OrderStore, d: CustomerDetails = {}): string {
  const subtotal = formatPrice(cartTotal(items));
  const count = items.reduce((n, i) => n + i.qty, 0);
  const lines = [`🛒 *New order — ${store.name}*`, ""];

  const customer = [d.name?.trim() && `Name: ${d.name.trim()}`, d.phone?.trim() && `Phone: ${d.phone.trim()}`].filter(Boolean);
  if (customer.length) lines.push("*Customer*", ...(customer as string[]), "");

  lines.push("*Items*");
  items.forEach((i, n) =>
    lines.push(`${n + 1}. ${i.name} — ${i.qty} × ${formatPrice(i.price)} (${i.unit}) = ${formatPrice(i.price * i.qty)}`),
  );
  lines.push("", `*Subtotal: ${subtotal} CAD* (${count} item${count === 1 ? "" : "s"})`);

  if (d.fulfilment === "Pickup") lines.push("", "*Pickup* at the store");
  if (d.fulfilment === "Delivery") {
    lines.push("", "*Delivery*");
    if (d.address?.trim()) lines.push(`Address: ${d.address.trim()}`);
    lines.push("Delivery fee (if any) to be confirmed.");
  }

  if (d.payment === "Interac") {
    const to = store.interacEmail ? ` to ${store.interacEmail}` : "";
    lines.push("", `*Payment:* Interac e-Transfer${to} — ${d.interacSent ? "✅ sent" : "⏳ sending now"} (${subtotal})`);
  } else if (d.payment === "Later") {
    lines.push("", `*Payment:* Pay on ${d.fulfilment === "Delivery" ? "delivery" : "pickup"}`);
  }

  if (d.notes?.trim()) lines.push("", `*Notes:* ${d.notes.trim()}`);
  return lines.join("\n");
}

/** Why an order can't be sent yet, or null when it can. Checked in the order the form is filled in. */
export function orderProblem(d: CustomerDetails): string | null {
  if (!d.fulfilment) return "Choose pickup or delivery";
  if (!d.name?.trim()) return "Add your name";
  if (!d.phone?.trim()) return "Add your phone number";
  const digits = normalizePhone(d.phone).length;
  if (digits < 10 || digits > 15) return "Check your phone number";
  if (d.fulfilment === "Delivery" && !d.address?.trim()) return "Add your delivery address";
  if (!d.payment) return "Choose how you'll pay";
  return null;
}

export function buildContactMessage(f: { name: string; email?: string; phone?: string; message: string }): string {
  const lines = ["Hi Walkem African Food Market! Message from the website:", "", f.message.trim(), "", `Name: ${f.name.trim()}`];
  if (f.email?.trim()) lines.push(`Email: ${f.email.trim()}`);
  if (f.phone?.trim()) lines.push(`Phone: ${f.phone.trim()}`);
  return lines.join("\n");
}

export const buildWhatsAppUrl = (phone: string, message: string) =>
  `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`;
