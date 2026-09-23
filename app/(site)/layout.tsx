import { CartProvider } from "@/components/cart/CartProvider";
import { CartSheet } from "@/components/cart/CartSheet";
import { FloatingCart } from "@/components/cart/FloatingCart";
import Navigation from "@/components/site/Navigation";
import Footer from "@/components/site/Footer";
import { JsonLd } from "@/components/site/JsonLd";
import { getCategories, getSettings } from "@/lib/data";
import { storeJsonLd, websiteJsonLd } from "@/lib/seo";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);
  return (
    <CartProvider storeName={settings.name} whatsappNumber={settings.whatsapp_number}>
      <JsonLd data={[storeJsonLd(settings), websiteJsonLd(settings)]} />
      <Navigation storeName={settings.name} />
      <main id="main">{children}</main>
      <Footer settings={settings} categories={categories} />
      <CartSheet />
      <FloatingCart />
    </CartProvider>
  );
}
