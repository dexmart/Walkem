import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The Walkem African Food Market logo. `dark` uses the version with white lettering for dark backgrounds
 * (the footer). `name` is the accessible label.
 */
export function BrandLogo({ name, variant = "light", className }: { name: string; variant?: "light" | "dark"; className?: string }) {
  return (
    <Image
      src={variant === "dark" ? "/brand/walkem-logo-dark.png" : "/brand/walkem-logo.png"}
      alt={name}
      width={1000}
      height={312}
      priority={variant === "light"}
      sizes="(max-width: 640px) 170px, 210px"
      className={cn("h-11 w-auto sm:h-[3.25rem]", className)}
    />
  );
}
