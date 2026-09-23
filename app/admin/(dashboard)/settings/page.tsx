import { SettingsForm } from "@/components/admin/SettingsForm";
import { DEFAULT_SETTINGS } from "@/lib/data";
import { requireAdmin } from "@/lib/supabase/server";
import type { StoreSettings } from "@/lib/types";

export default async function AdminSettingsPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("store_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw new Error(error.message);
  const settings: StoreSettings = { ...DEFAULT_SETTINGS, ...data, hours: Array.isArray(data?.hours) ? data.hours : [] };
  return <SettingsForm settings={settings} />;
}
