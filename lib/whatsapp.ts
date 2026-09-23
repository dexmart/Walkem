import type { CartItem, CustomerDetails } from "./types";
import { formatPrice } from "./format";
import { cartTotal } from "./cart";

export const normalizePhone = (raw: string) => raw.replace(/\D/g, "");

export function buildOrderMessage(items: CartItem[], storeName: string, d: CustomerDetails = {}): string {
  const lines = [`Hi ${storeName}! I'd like to order:`];
  for (const i of items) lines.push(`• ${i.name} × ${i.qty} (${i.unit}) — ${formatPrice(i.price * i.qty)}`);
  lines.push("", `Estimated total: ${formatPrice(cartTotal(items))} CAD`);
  const extra: string[] = [];
  if (d.name?.trim()) extra.push(`Name: ${d.name.trim()}`);
  if (d.fulfilment) extra.push(`Pickup / Delivery: ${d.fulfilment}`);
  if (d.fulfilment === "Delivery" && d.address?.trim()) extra.push(`Delivery address: ${d.address.trim()}`);
  if (d.notes?.trim()) extra.push(`Notes: ${d.notes.trim()}`);
  if (extra.length) lines.push("", ...extra);
  return lines.join("\n");
}

/** Why an order can't be sent yet, or null when it can. */
export function orderProblem(d: CustomerDetails): string | null {
  if (!d.fulfilment) return "Choose pickup or delivery";
  if (d.fulfilment === "Delivery" && !d.address?.trim()) return "Add your delivery address";
  return null;
}

export function buildContactMessage(f: { name: string; email?: string; phone?: string; message: string }): string {
  const lines = ["Hi Walkem Farm Market! Message from the website:", "", f.message.trim(), "", `Name: ${f.name.trim()}`];
  if (f.email?.trim()) lines.push(`Email: ${f.email.trim()}`);
  if (f.phone?.trim()) lines.push(`Phone: ${f.phone.trim()}`);
  return lines.join("\n");
}

export const buildWhatsAppUrl = (phone: string, message: string) =>
  `https://wa.me/${normalizePhone(phone)}?text=${encodeURIComponent(message)}`;
