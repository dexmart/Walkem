import { Clock, MapPin, Phone } from "lucide-react";
import { groupHours } from "@/lib/format";
import type { StoreSettings } from "@/lib/types";

export function mapQuery(s: StoreSettings) {
  if (s.latitude != null && s.longitude != null) return `${s.latitude},${s.longitude}`;
  return [s.name, s.address_line, s.city, s.province].filter(Boolean).join(", ");
}

export default function StoreInfo({ settings: s }: { settings: StoreSettings }) {
  const hours = groupHours(s.hours);
  const cityLine = [s.city, s.province].filter(Boolean).join(", ") + (s.postal_code ? ` ${s.postal_code}` : "");
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery(s))}&z=15&output=embed`;

  return (
    <section id="store-info" className="bg-muted/30 py-20 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center animate-fade-in-up md:mb-16">
          <h2 className="mb-6 font-display text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">Visit Our Store</h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Come experience the warmth of African hospitality and shop our full selection
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-6">
            <div className="rounded-xl bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">Location</h3>
                  <address className="not-italic text-muted-foreground">
                    {s.address_line && (
                      <>
                        {s.address_line}
                        <br />
                      </>
                    )}
                    {cityLine}
                    <br />
                    Canada
                  </address>
                </div>
              </div>
            </div>

            {hours.length > 0 && (
              <div className="rounded-xl bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-secondary/10">
                    <Clock className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-4 text-xl font-semibold text-foreground">Store Hours</h3>
                    <dl className="space-y-3">
                      {hours.map((h) => (
                        <div key={h.label} className="flex flex-wrap items-center justify-between gap-x-4">
                          <dt className="text-muted-foreground">{h.label}</dt>
                          <dd className="font-medium text-foreground">{h.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </div>
            )}

            {(s.phone || s.email || s.whatsapp_number) && (
              <div className="rounded-xl bg-card p-6 shadow-[var(--shadow-soft)] sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
                    <Phone className="h-6 w-6 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="mb-2 text-xl font-semibold text-foreground">Contact</h3>
                    {s.phone && (
                      <p className="mb-1">
                        <a href={`tel:${s.phone.replace(/[^\d+]/g, "")}`} className="text-muted-foreground hover:text-primary">
                          {s.phone}
                        </a>
                      </p>
                    )}
                    {s.whatsapp_number && (
                      <p className="mb-1">
                        <a
                          href={`https://wa.me/${s.whatsapp_number}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                        >
                          WhatsApp: +{s.whatsapp_number}
                        </a>
                      </p>
                    )}
                    {s.email && (
                      <p className="break-words">
                        <a href={`mailto:${s.email}`} className="text-muted-foreground hover:text-primary">
                          {s.email}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-[360px] overflow-hidden rounded-xl bg-card shadow-[var(--shadow-soft)] lg:h-auto lg:min-h-[500px]">
            <iframe
              src={mapSrc}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`${s.name} location on Google Maps`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
