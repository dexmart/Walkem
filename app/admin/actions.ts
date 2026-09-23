"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, serverClient } from "@/lib/supabase/server";
import { BUCKET, storagePathFromUrl } from "@/lib/images";
import {
  categorySchema,
  productSchema,
  settingsSchema,
  type CategoryInput,
  type ProductInput,
  type SettingsInput,
} from "@/lib/schemas";

export type Result = { ok: true; id?: string } | { ok: false; error: string };

type DbError = { code?: string; message: string } | null;

function fail(error: DbError, messages: Record<string, string> = {}): Result {
  console.error("admin action", error);
  return { ok: false, error: (error?.code && messages[error.code]) || "Something went wrong. Please try again." };
}

/** Admin edits must show on the public site straight away, so refresh every storefront page. */
function revalidateStorefront() {
  revalidatePath("/", "layout");
}

export async function signOut() {
  const supabase = await serverClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------- Products ----------

export async function saveProduct(id: string | null, input: ProductInput): Promise<Result> {
  const { supabase } = await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid product" };

  const query = id
    ? supabase.from("products").update(parsed.data).eq("id", id).select("id").single()
    : supabase.from("products").insert(parsed.data).select("id").single();
  const { data, error } = await query;
  if (error) return fail(error, { "23505": "Another product already uses this web address (slug). Change it and try again." });

  revalidateStorefront();
  return { ok: true, id: data.id };
}

const TOGGLES = ["in_stock", "is_fresh", "is_visible", "is_featured", "is_coming_soon"] as const;

export async function toggleProductField(id: string, field: (typeof TOGGLES)[number], value: boolean): Promise<Result> {
  const { supabase } = await requireAdmin();
  if (!TOGGLES.includes(field)) return { ok: false, error: "Unknown field" };
  const { error } = await supabase.from("products").update({ [field]: value }).eq("id", id);
  if (error) return fail(error);
  revalidateStorefront();
  return { ok: true };
}

export async function setProductQuantity(id: string, quantity: number): Promise<Result> {
  const { supabase } = await requireAdmin();
  if (!Number.isInteger(quantity) || quantity < 0) return { ok: false, error: "Quantity must be a whole number, 0 or more" };
  // Restocking an item that was sold out puts it back in stock.
  const update = quantity > 0 ? { quantity, in_stock: true } : { quantity };
  const { error } = await supabase.from("products").update(update).eq("id", id);
  if (error) return fail(error);
  revalidateStorefront();
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("products").delete().eq("id", id).select("images").single();
  if (error) return fail(error);
  const paths = (data.images as string[]).map(storagePathFromUrl).filter((p): p is string => Boolean(p));
  if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
  revalidateStorefront();
  return { ok: true };
}

export async function deleteImages(urls: string[]): Promise<Result> {
  const { supabase } = await requireAdmin();
  const paths = urls.map(storagePathFromUrl).filter((p): p is string => Boolean(p));
  if (!paths.length) return { ok: true };
  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  if (error) return fail({ message: error.message });
  return { ok: true };
}

// ---------- Categories ----------

export async function saveCategory(id: string | null, input: CategoryInput): Promise<Result> {
  const { supabase } = await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid category" };

  let error: DbError;
  if (id) {
    ({ error } = await supabase.from("categories").update(parsed.data).eq("id", id));
  } else {
    const { data: last } = await supabase.from("categories").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
    ({ error } = await supabase.from("categories").insert({ ...parsed.data, sort_order: (last?.sort_order ?? 0) + 1 }));
  }
  if (error) return fail(error, { "23505": "A category with this web address already exists." });
  revalidateStorefront();
  return { ok: true };
}

export async function moveCategory(id: string, direction: "up" | "down"): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { data: cats, error } = await supabase.from("categories").select("id, sort_order").order("sort_order");
  if (error || !cats) return fail(error);
  const i = cats.findIndex((c) => c.id === id);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i === -1 || j < 0 || j >= cats.length) return { ok: true };
  // Renumber the whole list so ties or gaps from older edits can't block a swap.
  const order = cats.map((c) => c.id);
  [order[i], order[j]] = [order[j], order[i]];
  for (const [index, catId] of order.entries()) {
    const { error: e } = await supabase.from("categories").update({ sort_order: index + 1 }).eq("id", catId);
    if (e) return fail(e);
  }
  revalidateStorefront();
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return fail(error, { "23503": "This category still has products. Move or delete them first." });
  revalidateStorefront();
  return { ok: true };
}

// ---------- Store settings ----------

export async function saveSettings(input: SettingsInput): Promise<Result> {
  const { supabase } = await requireAdmin();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid settings" };
  const { error } = await supabase
    .from("store_settings")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) return fail(error);
  revalidateStorefront();
  return { ok: true };
}
