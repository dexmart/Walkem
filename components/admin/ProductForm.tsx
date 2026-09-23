"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteImages, deleteProduct, saveProduct } from "@/app/admin/actions";
import { productSchema, type ProductData, type ProductInput } from "@/lib/schemas";
import { slugify } from "@/lib/slug";
import type { Category, Product } from "@/lib/types";
import { ImageUploader } from "./ImageUploader";

const UNITS = ["per lb", "per kg", "per pack", "per bag", "per bottle", "per tin", "per bunch", "each"];

const SWITCHES = [
  { name: "in_stock", label: "In stock", hint: "Turn off when sold out. Setting quantity to 0 does this automatically." },
  { name: "is_fresh", label: "Fresh this week", hint: "Shows in the “Fresh this week” section on the homepage." },
  { name: "is_featured", label: "Featured", hint: "Shows in “Our Products” on the homepage." },
  { name: "is_visible", label: "Visible on site", hint: "Turn off to hide the product without deleting it." },
] as const;

export function ProductForm({ product, categories }: { product?: Product; categories: Category[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  // Photos removed in this edit; deleted from storage only once the product is saved.
  const [removed, setRemoved] = useState<string[]>([]);

  const form = useForm<ProductInput, unknown, ProductData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? product
      : {
          name: "",
          slug: "",
          description: "",
          // Blank until typed; zod coerces the field text to a number on submit.
          price: "" as unknown as number,
          unit: "per lb",
          category_id: categories[0]?.id ?? null,
          images: [],
          quantity: 10,
          in_stock: true,
          is_fresh: false,
          is_featured: false,
          is_visible: true,
        },
  });
  const { register, control, handleSubmit, setValue, formState } = form;
  const errors = formState.errors;

  const onSubmit = handleSubmit((data) =>
    startTransition(async () => {
      const res = await saveProduct(product?.id ?? null, data);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      if (removed.length) await deleteImages(removed);
      toast.success(product ? "Product saved" : "Product added");
      router.push("/admin");
      router.refresh();
    }),
  );

  const onDelete = () =>
    startTransition(async () => {
      if (!product) return;
      const res = await deleteProduct(product.id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(`${product.name} deleted`);
      router.push("/admin");
      router.refresh();
    });

  const field = (name: keyof ProductInput) => errors[name]?.message as string | undefined;

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]" noValidate>
      <div className="space-y-6">
        <section className="space-y-4 rounded-xl border bg-background p-4 sm:p-6">
          <div className="space-y-1.5">
            <Label htmlFor="name">Product name *</Label>
            <Input
              id="name"
              {...register("name", {
                onChange: (e) => !slugTouched && setValue("slug", slugify(e.target.value), { shouldValidate: formState.isSubmitted }),
              })}
              placeholder="e.g. Egusi Seeds (Ground)"
            />
            {field("name") && <p className="text-sm text-destructive">{field("name")}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug">Web address</Label>
            <div className="flex items-center rounded-md border border-input bg-muted/40 pl-3 text-sm text-muted-foreground focus-within:ring-2 focus-within:ring-ring">
              <span className="whitespace-nowrap">/products/</span>
              <input
                id="slug"
                {...register("slug", { onChange: () => setSlugTouched(true) })}
                className="h-10 w-full min-w-0 bg-transparent pr-3 text-foreground outline-none"
              />
            </div>
            {field("slug") && <p className="text-sm text-destructive">{field("slug")}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} {...register("description")} placeholder="Size, origin, how to cook it…" />
          </div>
        </section>

        <section className="rounded-xl border bg-background p-4 sm:p-6">
          <h2 className="mb-3 font-semibold">Photos</h2>
          <Controller
            control={control}
            name="images"
            render={({ field: f }) => (
              <ImageUploader value={f.value} onChange={f.onChange} onRemove={(url) => setRemoved((r) => [...r, url])} />
            )}
          />
          {field("images") && <p className="mt-2 text-sm text-destructive">{field("images")}</p>}
        </section>
      </div>

      <div className="space-y-6">
        <section className="space-y-4 rounded-xl border bg-background p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price (CAD) *</Label>
              <Input id="price" type="number" inputMode="decimal" step="0.01" min="0" {...register("price")} />
              {field("price") && <p className="text-sm text-destructive">{field("price")}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="unit">Unit *</Label>
              <Input id="unit" list="units" {...register("unit")} />
              <datalist id="units">
                {UNITS.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
              {field("unit") && <p className="text-sm text-destructive">{field("unit")}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="quantity">Quantity available *</Label>
            <Input id="quantity" type="number" inputMode="numeric" min="0" step="1" {...register("quantity")} />
            {field("quantity") && <p className="text-sm text-destructive">{field("quantity")}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Controller
              control={control}
              name="category_id"
              render={({ field: f }) => (
                <Select value={f.value ?? "none"} onValueChange={(v) => f.onChange(v === "none" ? null : v)}>
                  <SelectTrigger aria-label="Category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="none">No category</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border bg-background p-4 sm:p-6">
          {SWITCHES.map((s) => (
            <Controller
              key={s.name}
              control={control}
              name={s.name}
              render={({ field: f }) => (
                <label className="flex items-start justify-between gap-4">
                  <span>
                    <span className="block font-medium">{s.label}</span>
                    <span className="block text-xs text-muted-foreground">{s.hint}</span>
                  </span>
                  <Switch checked={f.value} onCheckedChange={f.onChange} />
                </label>
              )}
            />
          ))}
        </section>

        <div className="flex flex-col gap-3">
          <Button type="submit" size="lg" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {product ? "Save changes" : "Add product"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/admin")} disabled={pending}>
            Cancel
          </Button>
          {product && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="ghost" className="text-destructive hover:text-destructive" disabled={pending}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete product
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {product.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes the product and its photos permanently. To take it off the site temporarily, turn off
                    “Visible on site” instead.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </form>
  );
}
