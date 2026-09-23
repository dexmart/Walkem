import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StoreSettings } from "@/lib/types";

export default function Hero({ settings }: { settings: StoreSettings }) {
  const title = settings.hero_title ?? "Authentic African Groceries in Moncton";
  // Highlight "in <City>" on its own line when the title ends with it, as in the original design.
  const match = title.match(/^(.*?)(\s+in\s+\S.*)$/i);

  return (
    <section id="home" className="relative flex min-h-[88svh] items-center overflow-hidden md:min-h-screen">
      <div className="absolute inset-0 z-0">
        <Image
          src="/seed/hero-banner.jpg"
          alt="Fresh African produce at Walkem Farm Market"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/30 md:to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto px-4 pb-20 pt-28 md:py-32">
        <div className="max-w-2xl animate-fade-in-up">
          <h1 className="mb-6 font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl md:text-7xl">
            {match ? (
              <>
                {match[1]}
                <span className="mt-2 block text-primary">{match[2].trim()}</span>
              </>
            ) : (
              title
            )}
          </h1>
          {settings.tagline && <p className="mb-4 text-xl leading-relaxed text-muted-foreground md:text-2xl">{settings.tagline}</p>}
          {settings.hero_subtitle && <p className="mb-8 text-lg text-muted-foreground">{settings.hero_subtitle}</p>}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="px-8 py-6 text-lg shadow-[var(--shadow-elevated)]">
              <Link href="/shop">
                Shop Our Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-primary px-8 py-6 text-lg text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Link href="/#store-info">Visit Our Store</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
