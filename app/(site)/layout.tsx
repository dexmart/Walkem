import { CartProvider } from "@/components/cart/CartProvider";
import { CartSheet } from "@/components/cart/CartSheet";
import Navigation from "@/components/site/Navigation";
import Footer from "@/components/site/Footer";
import { getCategories, getSettings } from "@/lib/data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);
  return (
    <CartProvider storeName={settings.name} whatsappNumber={settings.whatsapp_number}>
      <Navigation storeName={settings.name} />
      <main id="main">{children}</main>
      <Footer settings={settings} categories={categories} />
      <CartSheet />
    </CartProvider>
  );
}
