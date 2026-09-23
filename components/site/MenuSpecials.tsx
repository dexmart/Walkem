import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

const menuItems = [
  {
    name: "Jollof Rice Special",
    description: "Authentic Nigerian jollof rice with fried plantains and grilled chicken",
    price: "$18.99",
    image: "/seed/nigerian-jollof-rice.jpg",
  },
  {
    name: "Egusi Soup & Pounded Yam",
    description: "Traditional egusi soup served with fresh pounded yam",
    price: "$22.99",
    image: "/seed/nigerian-egusi-soup.jpg",
  },
  {
    name: "Suya Platter",
    description: "Grilled spicy beef skewers with onions and peppers",
    price: "$16.99",
    image: "/seed/nigerian-suya.jpg",
  },
  {
    name: "Nigerian Drinks",
    description: "Chapman, Zobo, Palm Wine and more refreshing beverages",
    price: "From $5.99",
    image: "/seed/nigerian-drinks.jpg",
  },
];

export default function MenuSpecials({ whatsappNumber }: { whatsappNumber: string | null }) {
  return (
    <section id="restaurant" className="bg-background py-20 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center animate-fade-in-up md:mb-16">
          <h2 className="mb-6 font-display text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">Restaurant &amp; Bar</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Experience authentic Nigerian cuisine and enjoy refreshing drinks at our bar
          </p>
        </div>

        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {menuItems.map((item) => (
            <Card key={item.name} className="group overflow-hidden border-border transition-all duration-300 hover:shadow-[var(--shadow-elevated)]">
              <div className="relative aspect-square overflow-hidden bg-muted">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="mb-2 text-xl font-semibold text-foreground">{item.name}</h3>
                <p className="mb-4 text-sm text-muted-foreground">{item.description}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-2xl font-bold text-primary">{item.price}</span>
                  <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                    <a
                      href={
                        whatsappNumber
                          ? buildWhatsAppUrl(whatsappNumber, `Hi Walkem Farm Market! I'd like to order: ${item.name}`)
                          : "/#contact"
                      }
                      target={whatsappNumber ? "_blank" : undefined}
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Order
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
