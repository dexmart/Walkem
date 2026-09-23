export type Category = { id: string; name: string; slug: string; sort_order: number };

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  unit: string;
  category_id: string | null;
  images: string[];
  quantity: number;
  in_stock: boolean;
  is_fresh: boolean;
  is_featured: boolean;
  is_visible: boolean;
  /** Shown on the site with a "Coming soon" badge but can't be added to the cart. */
  is_coming_soon: boolean;
  created_at: string;
  updated_at: string;
};

export type ProductWithCategory = Product & { category: Pick<Category, "name" | "slug"> | null };

export type DayHours = { day: string; open: string; close: string; closed: boolean };

export type StoreSettings = {
  name: string;
  tagline: string | null;
  whatsapp_number: string | null;
  phone: string | null;
  email: string | null;
  address_line: string | null;
  city: string;
  province: string;
  postal_code: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  hours: DayHours[];
  hero_title: string | null;
  hero_subtitle: string | null;
  about_text: string | null;
};

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  unit: string;
  image: string | null;
  qty: number;
  maxQty: number;
};

export type CustomerDetails = { name?: string; fulfilment?: "Pickup" | "Delivery"; address?: string; notes?: string };
