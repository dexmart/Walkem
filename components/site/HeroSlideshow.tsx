"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const SLIDES = [
  { src: "/hero/hero-1.jpg", alt: "Maggi, Nido, palm oil, groundnuts and fresh cassava at Walkem African Food Market" },
  { src: "/hero/hero-2.jpg", alt: "Plantain, fresh fish, Peak and Nido milk, noodles and seasonings at Walkem" },
  { src: "/hero/hero-3.jpg", alt: "Vitamalt, Maltex, rice, pounded yam flour and fresh yams at Walkem" },
];

const INTERVAL_MS = 5000;

/**
 * Hero photos that cross-fade every 5 seconds, with dots to pick one.
 * Phones: a clear, full-width photo block above the headline (dots on the photo).
 * md and up: fills the whole hero behind the headline, with a light wash on the left.
 */
export function HeroSlideshow() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // A timeout per slide (not an interval), so picking a dot restarts the 5 seconds from that slide.
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setActive((i) => (i + 1) % SLIDES.length), INTERVAL_MS);
    return () => clearTimeout(t);
  }, [paused, active]);

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[16/8] md:absolute md:inset-0 md:aspect-auto">
      {SLIDES.map((s, i) => (
        <Image
          key={s.src}
          src={s.src}
          alt={i === active ? s.alt : ""}
          aria-hidden={i !== active}
          fill
          priority={i === 0}
          loading={i === 0 ? undefined : "eager"}
          sizes="100vw"
          className={cn(
            "object-cover object-center transition-opacity duration-1000 ease-in-out motion-reduce:transition-none md:object-right",
            i === active ? "opacity-100" : "opacity-0",
          )}
        />
      ))}

      {/* Desktop only: light wash on the left keeps the overlaid headline readable. */}
      <div className="absolute inset-0 hidden bg-gradient-to-r from-background/95 via-background/60 to-transparent md:block" />

      <div
        className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2 rounded-full bg-black/25 px-2.5 py-1.5 backdrop-blur-sm md:bottom-10"
        role="tablist"
        aria-label="Hero images"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {SLIDES.map((s, i) => (
          <button
            key={s.src}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`Show image ${i + 1} of ${SLIDES.length}`}
            onClick={() => setActive(i)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              i === active ? "w-7 bg-white" : "w-2 bg-white/60 hover:bg-white/80",
            )}
          />
        ))}
      </div>
    </div>
  );
}
