"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ShopFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <form
        role="search"
        className="relative w-full sm:max-w-sm"
        onSubmit={(e) => {
          e.preventDefault();
          update("q", q.trim() || null);
        }}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search yam, egusi, palm oil…"
          aria-label="Search products"
          className="h-11 pl-9"
        />
      </form>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch id="fresh" checked={params.get("fresh") === "1"} onCheckedChange={(v) => update("fresh", v ? "1" : null)} />
          <Label htmlFor="fresh">Fresh only</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="stock" checked={params.get("stock") === "1"} onCheckedChange={(v) => update("stock", v ? "1" : null)} />
          <Label htmlFor="stock">In stock only</Label>
        </div>
      </div>
    </div>
  );
}
