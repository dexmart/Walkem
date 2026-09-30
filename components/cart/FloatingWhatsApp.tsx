"use client";

import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { useCart } from "./CartProvider";

/** WhatsApp glyph (brand mark, drawn inline so it stays crisp at any size). */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={className} fill="currentColor">
      <path d="M16.04 3C9.03 3 3.33 8.7 3.33 15.71c0 2.24.59 4.43 1.7 6.36L3.23 28.8l6.9-1.81a12.66 12.66 0 0 0 5.9 1.47h.01c7.01 0 12.71-5.7 12.71-12.71 0-3.4-1.32-6.59-3.72-8.99A12.63 12.63 0 0 0 16.04 3Zm0 23.31h-.01a10.55 10.55 0 0 1-5.38-1.47l-.39-.23-4.1 1.07 1.1-3.99-.25-.41a10.52 10.52 0 0 1-1.62-5.57c0-5.83 4.74-10.57 10.58-10.57 2.82 0 5.47 1.1 7.47 3.1a10.5 10.5 0 0 1 3.09 7.48c0 5.83-4.75 10.59-10.59 10.59Zm5.8-7.92c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.5-.16-.71.16-.21.32-.82 1.03-1 1.24-.19.21-.37.24-.69.08-.32-.16-1.34-.49-2.55-1.57-.94-.84-1.58-1.88-1.77-2.2-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.18.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.53-.71-.54h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65s1.14 3.08 1.3 3.29c.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.51.27-.74.27-1.38.19-1.51-.08-.13-.29-.21-.61-.37Z" />
    </svg>
  );
}

/** Floating "Chat with us on WhatsApp" button that sits just left of the floating cart basket. */
export function FloatingWhatsApp() {
  const { open, storeName, whatsappNumber } = useCart();
  if (!whatsappNumber || open) return null;

  return (
    <a
      href={buildWhatsAppUrl(whatsappNumber, `Hi ${storeName}! I have a question.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${storeName} on WhatsApp`}
      className="group fixed bottom-4 right-[5.25rem] z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-8px_rgba(37,211,102,0.7)] ring-4 ring-white/70 transition-transform hover:scale-105 sm:bottom-6 sm:right-[6.5rem] sm:h-16 sm:w-16"
    >
      {/* Soft pulse so it's noticed, turned off for reduced motion. */}
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366] opacity-20 [animation-duration:2.5s] motion-reduce:hidden" aria-hidden />
      <WhatsAppIcon className="relative h-7 w-7 sm:h-8 sm:w-8" />
      <span className="pointer-events-none absolute bottom-full mb-2 hidden whitespace-nowrap rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background opacity-0 shadow transition-opacity group-hover:opacity-100 sm:block">
        Chat with us
      </span>
    </a>
  );
}
