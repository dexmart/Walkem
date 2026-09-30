import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StoreSettings } from "@/lib/types";
import { HeroSlideshow } from "./HeroSlideshow";

export default function Hero({ settings }: { settings: StoreSettings }) {
  const title = settings.hero_title ?? "Walkem African Food Market in Moncton";
  // Highlight "in <City>" on its own line when the title ends with it, as in the original design.
  const match = title.match(/^(.*?)(\s+in\s+\S.*)$/i);

  return (
    // Phones: photo block (below the fixed menu), then the text. md+: text over a full-screen photo.
    <section id="home" className="relative flex flex-col overflow-hidden pt-16 sm:pt-[4.5rem] md:min-h-screen md:flex-row md:items-center md:pt-0">
      <HeroSlideshow />

      {/* pointer-events-none on the full-width layer (md+) so the slideshow dots under it stay clickable. */}
      <div className="container relative z-10 mx-auto px-4 pb-12 pt-8 md:pointer-events-none md:py-32">
        <div className="max-w-2xl animate-fade-in-up md:pointer-events-auto">
          <h1 className="mb-4 font-display text-[2.1rem] font-bold leading-tight text-foreground sm:text-5xl md:mb-6 md:text-7xl">
            {match ? (
              <>
                {match[1]}
                <span className="mt-2 block text-primary">{match[2].trim()}</span>
              </>
            ) : (
              title
            )}
          </h1>
          {settings.tagline && <p className="mb-2 text-lg leading-relaxed text-muted-foreground md:mb-4 md:text-2xl">{settings.tagline}</p>}
          {settings.hero_subtitle && <p className="mb-6 text-base text-muted-foreground md:mb-8 md:text-lg">{settings.hero_subtitle}</p>}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button asChild size="lg" className="h-12 px-8 text-base shadow-[var(--shadow-elevated)] md:h-14 md:text-lg">
              <Link href="/shop">
                Shop Our Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 border-2 border-primary px-8 text-base text-primary hover:bg-primary hover:text-primary-foreground md:h-14 md:text-lg"
            >
              <Link href="/#store-info">Visit Our Store</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden h-32 bg-gradient-to-t from-background to-transparent md:block" />
    </section>
  );
}
