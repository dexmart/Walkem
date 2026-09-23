import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
const jollofRiceImage = "/seed/nigerian-jollof-rice.jpg";
const egusiSoupImage = "/seed/nigerian-egusi-soup.jpg";
const suyaImage = "/seed/nigerian-suya.jpg";
const drinksImage = "/seed/nigerian-drinks.jpg";

const Products = () => {
  const menuItems = [
    {
      name: "Jollof Rice Special",
      description: "Authentic Nigerian jollof rice with fried plantains and grilled chicken",
      price: "$18.99",
      image: jollofRiceImage,
    },
    {
      name: "Egusi Soup & Pounded Yam",
      description: "Traditional egusi soup served with fresh pounded yam",
      price: "$22.99",
      image: egusiSoupImage,
    },
    {
      name: "Suya Platter",
      description: "Grilled spicy beef skewers with onions and peppers",
      price: "$16.99",
      image: suyaImage,
    },
    {
      name: "Nigerian Drinks",
      description: "Chapman, Zobo, Palm Wine and more refreshing beverages",
      price: "From $5.99",
      image: drinksImage,
    },
  ];

  return (
    <section id="products" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold font-display text-foreground mb-6">
            Restaurant & Bar
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience authentic Nigerian cuisine and enjoy refreshing drinks at our bar
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {menuItems.map((item, index) => (
            <Card
              key={index}
              className="group overflow-hidden hover:shadow-[var(--shadow-elevated)] transition-all duration-300 animate-scale-in border-border"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="aspect-square overflow-hidden bg-muted">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">{item.price}</span>
                  <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                    Order Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            View Full Menu
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Products;
