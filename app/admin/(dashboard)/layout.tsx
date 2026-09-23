import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { supabase, email } = await requireAdmin();
  const { data: settings } = await supabase.from("store_settings").select("whatsapp_number").eq("id", 1).maybeSingle();

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminNav email={email} />
      {!settings?.whatsapp_number && (
        <div className="border-b border-accent bg-accent/15">
          <p className="container mx-auto flex items-start gap-2 px-4 py-3 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Customers can&apos;t send orders yet — add your WhatsApp number in{" "}
              <Link href="/admin/settings" className="font-semibold underline">
                Store settings
              </Link>
              .
            </span>
          </p>
        </div>
      )}
      <main className="container mx-auto px-4 py-6 md:py-8">{children}</main>
    </div>
  );
}
