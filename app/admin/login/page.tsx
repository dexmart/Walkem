import type { Metadata } from "next";
import { Suspense } from "react";
import { ShoppingBag } from "lucide-react";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-[var(--shadow-elevated)] sm:p-8">
        <div className="mb-6 flex items-center gap-2">
          <ShoppingBag className="h-7 w-7 text-primary" />
          <span className="font-display text-xl font-bold">Walkem Admin</span>
        </div>
        <h1 className="mb-1 text-2xl font-semibold">Sign in</h1>
        <p className="mb-6 text-sm text-muted-foreground">Manage products, stock and store details.</p>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
