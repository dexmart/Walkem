import Navigation from "@/components/site/Navigation";
import Hero from "@/components/site/Hero";
import ProductCatalog from "@/components/site/ProductCatalog";
import About from "@/components/site/About";
import Products from "@/components/site/Products";
import StoreInfo from "@/components/site/StoreInfo";
import Contact from "@/components/site/Contact";
import Footer from "@/components/site/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <ProductCatalog />
      <About />
      <Products />
      <StoreInfo />
      <Contact />
      <Footer />
    </div>
  );
}
