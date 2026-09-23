"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QtyStepper({
  value,
  max,
  onChange,
  size = "md",
  label = "Quantity",
}: {
  value: number;
  max: number;
  onChange: (qty: number) => void;
  size?: "sm" | "md";
  label?: string;
}) {
  const btn = cn(
    "inline-flex items-center justify-center rounded-full border border-input bg-background text-foreground transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40",
    size === "sm" ? "h-8 w-8" : "h-10 w-10",
  );
  return (
    <div className="inline-flex items-center gap-2" role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
        <Minus className="h-4 w-4" />
      </button>
      <span className={cn("min-w-8 text-center font-semibold tabular-nums", size === "sm" && "text-sm")} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
