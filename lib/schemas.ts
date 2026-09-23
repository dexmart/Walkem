import { z } from "zod";
import { normalizePhone } from "./whatsapp";

// Shared by the admin forms (client) and the server actions, so both validate identically.

const optionalText = z
  .string()
  .nullish()
  .transform((v) => (v?.trim() ? v.trim() : null));

const optionalNumber = z
  .union([z.string(), z.number()])
  .nullish()
  .transform((v, ctx) => {
    if (v === null || v === undefined || String(v).trim() === "") return null;
    const n = Number(v);
    if (Number.isNaN(n)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Must be a number" });
      return z.NEVER;
    }
    return n;
  });

export const slugSchema = z
  .string()
  .trim()
  .min(1, "Required")
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes only");

export const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  slug: slugSchema,
  description: optionalText,
  price: z.coerce
    .number({ invalid_type_error: "Enter a price" })
    .min(0, "Price can't be negative")
    .max(100000)
    .transform((n) => Math.round(n * 100) / 100),
  unit: z.string().trim().min(1, "Unit is required").max(40),
  category_id: z.string().uuid().nullable(),
  images: z.array(z.string().min(1)).max(8, "Up to 8 photos"),
  quantity: z.coerce.number({ invalid_type_error: "Enter a quantity" }).int("Whole numbers only").min(0, "Can't be negative"),
  in_stock: z.boolean(),
  is_fresh: z.boolean(),
  is_featured: z.boolean(),
  is_visible: z.boolean(),
});
export type ProductInput = z.input<typeof productSchema>;
export type ProductData = z.output<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  slug: slugSchema,
});
export type CategoryInput = z.infer<typeof categorySchema>;

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM");

export const daySchema = z
  .object({ day: z.string(), open: z.string(), close: z.string(), closed: z.boolean() })
  .superRefine((d, ctx) => {
    if (d.closed) return;
    if (!time.safeParse(d.open).success || !time.safeParse(d.close).success)
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${d.day}: set opening and closing times` });
  });

export const settingsSchema = z.object({
  name: z.string().trim().min(1, "Store name is required").max(80),
  tagline: optionalText,
  whatsapp_number: z
    .string()
    .nullish()
    .transform((v) => (v ? normalizePhone(v) : ""))
    .refine((v) => v === "" || (v.length >= 8 && v.length <= 15), "Enter the full number with country code, e.g. 1 506 555 0123")
    .transform((v) => v || null),
  phone: optionalText,
  email: optionalText.refine((v) => v === null || z.string().email().safeParse(v).success, "Enter a valid email"),
  address_line: optionalText,
  city: z.string().trim().min(1, "City is required"),
  province: z.string().trim().min(1, "Province is required"),
  postal_code: optionalText,
  latitude: optionalNumber.refine((v) => v === null || (v >= -90 && v <= 90), "Latitude must be between -90 and 90"),
  longitude: optionalNumber.refine((v) => v === null || (v >= -180 && v <= 180), "Longitude must be between -180 and 180"),
  hours: z.array(daySchema).max(7),
  hero_title: optionalText,
  hero_subtitle: optionalText,
  about_text: optionalText,
});
export type SettingsInput = z.input<typeof settingsSchema>;
export type SettingsData = z.output<typeof settingsSchema>;
