import { Clock, MapPin, Phone } from "lucide-react";

const StoreInfo = () => {
  const storeHours = [
    { day: "Monday - Friday", hours: "9:00 AM - 8:00 PM" },
    { day: "Saturday", hours: "9:00 AM - 9:00 PM" },
    { day: "Sunday", hours: "10:00 AM - 6:00 PM" },
  ];

  return (
    <section id="store-info" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold font-display text-foreground mb-6">
            Visit Our Store
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Come experience the warmth of African hospitality and shop our full selection
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Store Details */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="bg-card p-8 rounded-xl shadow-[var(--shadow-soft)]">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Location</h3>
                  <p className="text-muted-foreground">
                    123 Market Street<br />
                    Springfield, ST 12345<br />
                    United States
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card p-8 rounded-xl shadow-[var(--shadow-soft)]">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-secondary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Store Hours</h3>
                  <div className="space-y-3">
                    {storeHours.map((schedule, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-muted-foreground">{schedule.day}</span>
                        <span className="font-medium text-foreground">{schedule.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card p-8 rounded-xl shadow-[var(--shadow-soft)]">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Contact</h3>
                  <p className="text-muted-foreground mb-1">(555) 123-4567</p>
                  <p className="text-muted-foreground">info@walkemfarmmarket.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="animate-scale-in">
            <div className="bg-card rounded-xl shadow-[var(--shadow-soft)] overflow-hidden h-full min-h-[500px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1841877574214!2d-73.98784368459395!3d40.74844097932847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1647887134417!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Walkem Farm Market Location"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoreInfo;
