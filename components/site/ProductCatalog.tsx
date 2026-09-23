"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
const productYam = "/seed/product-yam.jpg";
const productPlantain = "/seed/product-plantain.jpg";
const productPalmOil = "/seed/product-palm-oil.jpg";
const productSpices = "/seed/product-spices.jpg";

const ProductCatalog = () => {
  const categories = [
    "All Products",
    "Grains & Flours",
    "Oils & Fats",
    "Plantains & Bananas",
    "Proteins",
    "Root Vegetables",
    "Spices & Seasonings",
  ];

  const [activeCategory, setActiveCategory] = useState("All Products");

  const products = [
    {
      id: 1,
      name: "African Curry Powder",
      description: "Aromatic curry blend, 200g",
      price: "$7.99",
      unit: "per pack",
      image: productSpices,
      category: "Spices & Seasonings",
    },
    {
      id: 2,
      name: "Premium Yam",
      description: "Fresh white yam, perfect for pounding",
      price: "$5.49",
      unit: "per lb",
      image: productYam,
      category: "Root Vegetables",
    },
    {
      id: 3,
      name: "Green Plantains",
      description: "Firm green plantains for frying or boiling",
      price: "$2.99",
      unit: "per lb",
      image: productPlantain,
      category: "Plantains & Bananas",
    },
    {
      id: 4,
      name: "Red Palm Oil",
      description: "Authentic red palm oil, 1 liter bottle",
      price: "$12.99",
      unit: "per bottle",
      image: productPalmOil,
      category: "Oils & Fats",
    },
    {
      id: 5,
      name: "Ground Cayenne Pepper",
      description: "Hot cayenne pepper powder, 100g",
      price: "$5.99",
      unit: "per pack",
      image: productSpices,
      category: "Spices & Seasonings",
    },
    {
      id: 6,
      name: "Cassava Flour",
      description: "Fine cassava flour for baking, 2lb",
      price: "$6.99",
      unit: "per bag",
      image: productYam,
      category: "Grains & Flours",
    },
    {
      id: 7,
      name: "Ripe Plantains",
      description: "Sweet yellow plantains ready to fry",
      price: "$3.49",
      unit: "per lb",
      image: productPlantain,
      category: "Plantains & Bananas",
    },
    {
      id: 8,
      name: "Coconut Oil",
      description: "Pure coconut oil for cooking, 500ml",
      price: "$9.99",
      unit: "per bottle",
      image: productPalmOil,
      category: "Oils & Fats",
    },
  ];

  const filteredProducts = activeCategory === "All Products" 
    ? products 
    : products.filter(product => product.category === activeCategory);

  const handleOrderNow = (productName: string) => {
    const whatsappNumber = "1234567890"; // Replace with actual WhatsApp number
    const message = encodeURIComponent(`Hi! I'd like to order: ${productName}`);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold font-display text-foreground mb-4">
            Our Products
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse our selection of authentic African groceries, from fresh produce to traditional spices
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 animate-fade-in">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              onClick={() => setActiveCategory(category)}
              className={`rounded-full transition-all duration-300 ${
                activeCategory === category 
                  ? "bg-primary text-primary-foreground" 
                  : "border-2 border-muted hover:border-primary"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-scale-in">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="bg-card rounded-xl overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300 hover-scale"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-foreground mb-1">{product.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-bold text-primary">{product.price}</span>
                  <span className="text-sm text-muted-foreground">{product.unit}</span>
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => handleOrderNow(product.name)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Order Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCatalog;
