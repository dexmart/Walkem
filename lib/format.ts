const fmt = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", currencyDisplay: "narrowSymbol" });

export function formatPrice(n: number): string {
  return fmt.format(n);
}
