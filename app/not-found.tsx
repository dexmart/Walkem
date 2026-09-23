import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-5xl font-bold text-foreground">Page not found</h1>
      <p className="text-muted-foreground">We couldn&apos;t find that page. It may have moved or sold out.</p>
      <Link href="/" className="font-medium text-primary hover:underline">
        Back to Walkem Farm Market
      </Link>
    </main>
  );
}
