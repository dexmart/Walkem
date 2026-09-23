"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { FALLBACK_IMAGE } from "@/lib/site";

export function ProductGallery({ images, name, soldOut }: { images: string[]; name: string; soldOut: boolean }) {
  const list = images.length ? images : [FALLBACK_IMAGE];
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted shadow-[var(--shadow-soft)]">
        <Image
          src={list[active]}
          alt={name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className={cn("object-cover", soldOut && "opacity-60 grayscale")}
        />
      </div>
      {list.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {list.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 sm:h-20 sm:w-20",
                i === active ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
              )}
              aria-label={`Show photo ${i + 1} of ${name}`}
              aria-pressed={i === active}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
