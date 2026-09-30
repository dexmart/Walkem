import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Walkem emblem + the store name set in type (styled like the logo artwork), so the name shown
 * always matches Store settings instead of the tagline baked into the logo image.
 * "Walkem African Food Market" renders as WALKEM over "African Food Market".
 */
export function BrandLogo({ name, variant = "light", className }: { name: string; variant?: "light" | "dark"; className?: string }) {
  const [first, ...rest] = name.trim().split(/\s+/);
  const tagline = rest.join(" ");

  return (
    <span className={cn("flex min-w-0 items-center gap-2", className)}>
      {/* On the dark footer the emblem sits on a white disc so its black cart stays visible. */}
      <span className={cn("shrink-0", variant === "dark" && "rounded-full bg-white p-1")}>
        <Image src="/brand/walkem-mark-192.png" alt="" width={192} height={192} priority className="h-10 w-10 sm:h-12 sm:w-12" />
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            "truncate font-sans text-xl font-extrabold uppercase tracking-tight sm:text-2xl",
            variant === "light" ? "text-[#141414]" : "text-white",
          )}
        >
          {first}
        </span>
        {tagline && (
          <span
            className={cn(
              "mt-0.5 truncate font-sans text-[0.62rem] font-bold uppercase tracking-wide sm:text-xs",
              variant === "light" ? "text-[#D7261E]" : "text-[#FF6B5E]",
            )}
          >
            {tagline}
          </span>
        )}
      </span>
    </span>
  );
}
