"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Camera, Loader2, Star, X } from "lucide-react";
import { toast } from "sonner";
import { browserClient } from "@/lib/supabase/browser";
import { BUCKET, resizeToWebp } from "@/lib/images";
import { cn } from "@/lib/utils";

const MAX_IMAGES = 8;

export function ImageUploader({
  value,
  onChange,
  onRemove,
}: {
  value: string[];
  onChange: (images: string[]) => void;
  /** Called with a removed image URL so the form can delete it from storage after saving. */
  onRemove: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [dragging, setDragging] = useState(false);

  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const room = MAX_IMAGES - value.length;
    if (list.length > room) toast.error(`You can add ${room} more photo${room === 1 ? "" : "s"} (max ${MAX_IMAGES}).`);
    const batch = list.slice(0, Math.max(room, 0));
    if (!batch.length) return;

    setUploading((n) => n + batch.length);
    const supabase = browserClient();
    const added: string[] = [];
    await Promise.all(
      batch.map(async (file) => {
        try {
          const blob = await resizeToWebp(file);
          const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.webp`;
          const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" });
          if (error) throw error;
          added.push(supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
        } catch (e) {
          console.error(e);
          toast.error(`Couldn't upload ${file.name}. Try a JPG or PNG photo.`);
        } finally {
          setUploading((n) => n - 1);
        }
      }),
    );
    if (added.length) onChange([...value, ...added]);
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const remove = (i: number) => {
    onRemove(value[i]);
    onChange(value.filter((_, j) => j !== i));
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void upload(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-input",
        )}
      >
        <Camera className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Take a photo or choose from your device. First photo is the cover.</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={value.length >= MAX_IMAGES}
          className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Add photos
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) void upload(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {(value.length > 0 || uploading > 0) && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {value.map((src, i) => (
            <li key={src} className="overflow-hidden rounded-lg border bg-background">
              <div className="relative aspect-square bg-muted">
                <Image src={src} alt={`Photo ${i + 1}`} fill sizes="200px" className="object-cover" />
                {i === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="absolute right-1 top-1 rounded-full bg-background/90 p-1 hover:text-destructive"
                  aria-label={`Remove photo ${i + 1}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-between p-1">
                <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="p-2 disabled:opacity-30" aria-label="Move left">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                {i !== 0 && (
                  <button type="button" onClick={() => move(i, 0)} className="flex items-center gap-1 p-2 text-xs" aria-label="Make cover photo">
                    <Star className="h-3.5 w-3.5" /> Cover
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => move(i, i + 1)}
                  disabled={i === value.length - 1}
                  className="p-2 disabled:opacity-30"
                  aria-label="Move right"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
          {Array.from({ length: uploading }).map((_, i) => (
            <li key={`up-${i}`} className="flex aspect-square items-center justify-center rounded-lg border bg-muted">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
