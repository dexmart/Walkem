"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setProductQuantity, toggleProductField } from "@/app/admin/actions";
import { isPurchasable } from "@/lib/availability";
import { formatPrice } from "@/lib/format";
import { coverImage } from "@/lib/site";
import type { Category, ProductWithCategory } from "@/lib/types";

type Toggle = "in_stock" | "is_fresh" | "is_visible" | "is_coming_soon";
const TOGGLE_LABELS: Record<Toggle, string> = {
  in_stock: "In stock",
  is_fresh: "Fresh",
  is_visible: "Visible",
  is_coming_soon: "Coming soon",
};

export function ProductTable({ products: initial, categories }: { products: ProductWithCategory[]; categories: Category[] }) {
  const router = useRouter();
  const [products, setProducts] = useState(initial);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter(
      (p) => (cat === "all" || p.category_id === cat) && (!term || p.name.toLowerCase().includes(term)),
    );
  }, [products, q, cat]);

  const patch = (id: string, change: Partial<ProductWithCategory>) =>
    setProducts((list) => list.map((p) => (p.id === id ? { ...p, ...change } : p)));

  const toggle = (p: ProductWithCategory, field: Toggle, value: boolean) => {
    if (field === "in_stock" && value && p.quantity === 0) {
      toast.error("Set a quantity above 0 first — items with 0 left are always sold out.");
      return;
    }
    patch(p.id, { [field]: value });
    startTransition(async () => {
      const res = await toggleProductField(p.id, field, value);
      if (!res.ok) {
        patch(p.id, { [field]: !value });
        toast.error(res.error);
      } else {
        toast.success(`${p.name}: ${TOGGLE_LABELS[field]} ${value ? "on" : "off"}`);
        router.refresh();
      }
    });
  };

  const saveQty = (p: ProductWithCategory, raw: string) => {
    const quantity = Number(raw);
    if (raw === "" || quantity === p.quantity) return;
    if (!Number.isInteger(quantity) || quantity < 0) {
      toast.error("Quantity must be a whole number, 0 or more");
      return;
    }
    const before = { quantity: p.quantity, in_stock: p.in_stock };
    patch(p.id, { quantity, in_stock: quantity > 0 ? true : false });
    startTransition(async () => {
      const res = await setProductQuantity(p.id, quantity);
      if (!res.ok) {
        patch(p.id, before);
        toast.error(res.error);
      } else {
        toast.success(`${p.name}: quantity ${quantity}`);
        router.refresh();
      }
    });
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-1 h-4 w-4" /> Add product
          </Link>
        </Button>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className="pl-9" aria-label="Search products" />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger className="sm:w-56" aria-label="Filter by category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="mb-3 text-sm text-muted-foreground">
        {filtered.length} of {products.length} products · switches and quantities save instantly
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-background p-10 text-center text-muted-foreground">
          No products found.{" "}
          <Link href="/admin/products/new" className="text-primary underline">
            Add one
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((p) => (
            <li key={p.id} className="rounded-xl border bg-background p-3 sm:p-4">
              <div className="flex gap-3">
                <Link href={`/admin/products/${p.id}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-20 sm:w-20">
                  <Image src={coverImage(p.images)} alt="" fill sizes="80px" className="object-cover" />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link href={`/admin/products/${p.id}`} className="font-semibold hover:text-primary">
                        {p.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(p.price)} {p.unit}
                        {p.category && <> · {p.category.name}</>}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {!p.is_visible ? (
                        <Badge variant="outline">Hidden</Badge>
                      ) : p.is_coming_soon ? (
                        <Badge className="bg-accent text-accent-foreground">Coming soon</Badge>
                      ) : !isPurchasable(p) ? (
                        <Badge variant="secondary">Sold out</Badge>
                      ) : null}
                      <Button asChild variant="ghost" size="icon" aria-label={`Edit ${p.name}`}>
                        <Link href={`/admin/products/${p.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3 border-t pt-3 text-sm">
                <label className="flex items-center gap-2">
                  <span className="text-muted-foreground">Qty</span>
                  <Input
                    key={`${p.id}-${p.quantity}`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    defaultValue={p.quantity}
                    onBlur={(e) => saveQty(p, e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                    className="h-9 w-20"
                    aria-label={`Quantity of ${p.name}`}
                  />
                </label>
                {(Object.keys(TOGGLE_LABELS) as Toggle[]).map((field) => (
                  <label key={field} className="flex items-center gap-2">
                    <Switch checked={p[field]} onCheckedChange={(v) => toggle(p, field, v)} aria-label={`${TOGGLE_LABELS[field]}: ${p.name}`} />
                    {TOGGLE_LABELS[field]}
                  </label>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
