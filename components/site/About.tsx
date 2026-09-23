import { Heart, Truck, Award } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: Heart,
      title: "Authentic Quality",
      description: "Hand-picked products sourced directly from trusted African suppliers",
    },
    {
      icon: Truck,
      title: "Local Delivery",
      description: "Fast and reliable delivery service to your doorstep",
    },
    {
      icon: Award,
      title: "Community First",
      description: "Serving the African diaspora with pride for over 10 years",
    },
  ];

  return (
    <section id="about" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold font-display text-foreground mb-6">
            Bringing Africa to Your Kitchen
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Walkem Farm Market is your premier destination for authentic African groceries. 
            We're passionate about connecting our community with the flavors of home through 
            quality products, exceptional service, and a commitment to cultural excellence.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card p-8 rounded-xl shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-elevated)] transition-all duration-300 animate-scale-in text-center"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
