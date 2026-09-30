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

/** Background photos that cross-fade every 5 seconds, with dots to pick one. Doesn't auto-play for reduced motion. */
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
    <>
      <div className="absolute inset-0 z-0">
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
              "object-cover object-right transition-opacity duration-1000 ease-in-out motion-reduce:transition-none",
              i === active ? "opacity-100" : "opacity-0",
            )}
          />
        ))}
        {/* Light wash on the left keeps the headline readable over any photo. */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/75 to-background/10 md:via-background/60 md:to-transparent" />
      </div>

      {/* Dots sit above the headline layer so they stay clickable. Hovering them pauses the slideshow. */}
      <div
        className="absolute bottom-24 left-1/2 z-20 flex -translate-x-1/2 gap-2 md:bottom-28"
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
              "h-2.5 rounded-full transition-all duration-300",
              i === active ? "w-8 bg-primary" : "w-2.5 bg-foreground/30 hover:bg-foreground/50",
            )}
          />
        ))}
      </div>
    </>
  );
}
