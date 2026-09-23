"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { deleteCategory, moveCategory, saveCategory, type Result } from "@/app/admin/actions";
import { slugify } from "@/lib/slug";
import type { Category } from "@/lib/types";

type Row = Category & { product_count: number };

export function CategoryManager({ categories }: { categories: Row[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [newName, setNewName] = useState("");

  const run = (action: () => Promise<Result>, success: string, after?: () => void) =>
    startTransition(async () => {
      const res = await action();
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(success);
      after?.();
      router.refresh();
    });

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    run(() => saveCategory(null, { name, slug: slugify(name) }), `Added ${name}`, () => setNewName(""));
  };

  const rename = (c: Row) => {
    const name = draft.trim();
    if (!name || name === c.name) return setEditing(null);
    // Keep the existing web address so links and search rankings survive a rename.
    run(() => saveCategory(c.id, { name, slug: c.slug }), `Renamed to ${name}`, () => setEditing(null));
  };

  return (
    <div className="max-w-2xl">
      <h1 className="mb-2 text-2xl font-semibold">Categories</h1>
      <p className="mb-6 text-sm text-muted-foreground">The order here is the order customers see on the site.</p>

      <form onSubmit={add} className="mb-6 flex gap-2">
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New category, e.g. Drinks" aria-label="New category name" />
        <Button type="submit" disabled={pending || !newName.trim()}>
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </form>

      <ul className="divide-y rounded-xl border bg-background">
        {categories.map((c, i) => (
          <li key={c.id} className="flex items-center gap-2 p-3">
            <div className="flex flex-col">
              <button
                type="button"
                className="p-1 disabled:opacity-30"
                disabled={pending || i === 0}
                onClick={() => run(() => moveCategory(c.id, "up"), "Order updated")}
                aria-label={`Move ${c.name} up`}
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="p-1 disabled:opacity-30"
                disabled={pending || i === categories.length - 1}
                onClick={() => run(() => moveCategory(c.id, "down"), "Order updated")}
                aria-label={`Move ${c.name} down`}
              >
                <ArrowDown className="h-4 w-4" />
              </button>
            </div>

            {editing === c.id ? (
              <form
                className="flex flex-1 gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  rename(c);
                }}
              >
                <Input value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus aria-label="Category name" />
                <Button type="submit" size="icon" disabled={pending} aria-label="Save name">
                  <Check className="h-4 w-4" />
                </Button>
                <Button type="button" size="icon" variant="ghost" onClick={() => setEditing(null)} aria-label="Cancel">
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.product_count} product{c.product_count === 1 ? "" : "s"} · /shop/{c.slug}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEditing(c.id);
                    setDraft(c.name);
                  }}
                  aria-label={`Rename ${c.name}`}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" aria-label={`Delete ${c.name}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {c.name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {c.product_count > 0
                          ? `This category still has ${c.product_count} product${c.product_count === 1 ? "" : "s"}. Move them to another category first.`
                          : "This can't be undone."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => run(() => deleteCategory(c.id), `Deleted ${c.name}`)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
