"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { saveSettings } from "@/app/admin/actions";
import { settingsSchema, type SettingsData, type SettingsInput } from "@/lib/schemas";
import type { DayHours, StoreSettings } from "@/lib/types";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function fullWeek(hours: DayHours[]): DayHours[] {
  return DAYS.map((day) => hours.find((h) => h.day === day) ?? { day, open: "09:00", close: "18:00", closed: false });
}

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<SettingsInput, unknown, SettingsData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      ...settings,
      whatsapp_number: settings.whatsapp_number ?? "",
      latitude: settings.latitude ?? "",
      longitude: settings.longitude ?? "",
      hours: fullWeek(settings.hours),
    },
  });
  const { register, control, handleSubmit, formState, watch } = form;
  const { fields } = useFieldArray({ control, name: "hours" });
  const e = formState.errors;
  const msg = (k: keyof SettingsInput) => e[k]?.message as string | undefined;

  const onSubmit = handleSubmit(
    (data) =>
      startTransition(async () => {
        const res = await saveSettings(data);
        if (!res.ok) toast.error(res.error);
        else {
          toast.success("Store settings saved");
          router.refresh();
        }
      }),
    () => toast.error("Please fix the highlighted fields"),
  );

  const lat = watch("latitude");
  const lng = watch("longitude");

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6" noValidate>
      <h1 className="text-2xl font-semibold">Store settings</h1>

      <section className="space-y-4 rounded-xl border bg-background p-4 sm:p-6">
        <h2 className="font-semibold">Ordering &amp; contact</h2>
        <Field
          id="whatsapp_number"
          label="WhatsApp number for orders"
          hint="Include the country code, e.g. 1 506 555 0123. Orders from the cart go to this number."
          error={msg("whatsapp_number")}
        >
          <Input id="whatsapp_number" type="tel" inputMode="tel" {...register("whatsapp_number")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="phone" label="Phone (shown on site)" error={msg("phone")}>
            <Input id="phone" type="tel" {...register("phone")} />
          </Field>
          <Field id="email" label="Email" error={msg("email")}>
            <Input id="email" type="email" {...register("email")} />
          </Field>
        </div>
      </section>

      <section className="space-y-4 rounded-xl border bg-background p-4 sm:p-6">
        <h2 className="font-semibold">Location</h2>
        <Field id="address_line" label="Street address" error={msg("address_line")}>
          <Input id="address_line" {...register("address_line")} placeholder="e.g. 123 Main Street" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="city" label="City" error={msg("city")}>
            <Input id="city" {...register("city")} />
          </Field>
          <Field id="province" label="Province" error={msg("province")}>
            <Input id="province" {...register("province")} />
          </Field>
          <Field id="postal_code" label="Postal code" error={msg("postal_code")}>
            <Input id="postal_code" {...register("postal_code")} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="latitude" label="Map latitude" error={msg("latitude")}>
            <Input id="latitude" inputMode="decimal" {...register("latitude")} placeholder="46.0878" />
          </Field>
          <Field id="longitude" label="Map longitude" error={msg("longitude")}>
            <Input id="longitude" inputMode="decimal" {...register("longitude")} placeholder="-64.7782" />
          </Field>
        </div>
        <p className="text-xs text-muted-foreground">
          To get these, find the store on{" "}
          <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">
            Google Maps
          </a>
          , right-click the pin and click the numbers at the top of the menu to copy them. Leave blank to place the map using
          the address.{" "}
          {lat && lng ? (
            <a
              href={`https://maps.google.com/?q=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Check this location
            </a>
          ) : null}
        </p>
      </section>

      <section className="rounded-xl border bg-background p-4 sm:p-6">
        <h2 className="mb-4 font-semibold">Opening hours</h2>
        {e.hours && <p className="mb-3 text-sm text-destructive">{e.hours.root?.message ?? "Check the times below"}</p>}
        <ul className="space-y-3">
          {fields.map((f, i) => {
            const closed = watch(`hours.${i}.closed`);
            return (
              <li key={f.id} className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="w-24 font-medium">{f.day}</span>
                <Controller
                  control={control}
                  name={`hours.${i}.closed`}
                  render={({ field }) => (
                    <label className="flex items-center gap-2 text-sm">
                      <Switch checked={!field.value} onCheckedChange={(open) => field.onChange(!open)} />
                      {field.value ? "Closed" : "Open"}
                    </label>
                  )}
                />
                {!closed && (
                  <div className="flex items-center gap-2">
                    <Input type="time" className="w-32" {...register(`hours.${i}.open`)} aria-label={`${f.day} opening time`} />
                    <span className="text-muted-foreground">to</span>
                    <Input type="time" className="w-32" {...register(`hours.${i}.close`)} aria-label={`${f.day} closing time`} />
                  </div>
                )}
                {e.hours?.[i] && <p className="w-full text-sm text-destructive">{e.hours[i]?.message ?? "Set both times"}</p>}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-4 rounded-xl border bg-background p-4 sm:p-6">
        <h2 className="font-semibold">Homepage text</h2>
        <Field id="name" label="Store name" error={msg("name")}>
          <Input id="name" {...register("name")} />
        </Field>
        <Field id="hero_title" label="Main headline" hint="Ending with “in Moncton” shows that part in orange on its own line.">
          <Input id="hero_title" {...register("hero_title")} />
        </Field>
        <Field id="tagline" label="Tagline">
          <Input id="tagline" {...register("tagline")} />
        </Field>
        <Field id="hero_subtitle" label="Subheading">
          <Input id="hero_subtitle" {...register("hero_subtitle")} />
        </Field>
        <Field id="about_text" label="About the store">
          <Textarea id="about_text" rows={4} {...register("about_text")} />
        </Field>
      </section>

      <div className="sticky bottom-0 -mx-4 border-t bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save settings
        </Button>
      </div>
    </form>
  );
}
