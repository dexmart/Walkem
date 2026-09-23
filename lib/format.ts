import type { DayHours } from "./types";

const fmt = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", currencyDisplay: "narrowSymbol" });

export function formatPrice(n: number): string {
  return fmt.format(n);
}

export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m ?? 0).padStart(2, "0")} ${suffix}`;
}

/** Collapses consecutive days with identical hours: "Monday – Friday: 9:00 AM – 8:00 PM". */
export function groupHours(hours: DayHours[]): { label: string; value: string }[] {
  const out: { first: string; last: string; value: string }[] = [];
  for (const h of hours) {
    const value = h.closed ? "Closed" : `${formatTime(h.open)} – ${formatTime(h.close)}`;
    const prev = out[out.length - 1];
    if (prev && prev.value === value) prev.last = h.day;
    else out.push({ first: h.day, last: h.day, value });
  }
  return out.map((g) => ({ label: g.first === g.last ? g.first : `${g.first} – ${g.last}`, value: g.value }));
}
