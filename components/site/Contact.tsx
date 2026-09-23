"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { buildContactMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

const empty = { name: "", email: "", phone: "", message: "" };

export default function Contact({ whatsappNumber, email }: { whatsappNumber: string | null; email: string | null }) {
  const [formData, setFormData] = useState(empty);
  const canSend = Boolean(whatsappNumber || email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.message.trim()) {
      toast.error("Missing information", { description: "Please add your name and a message." });
      return;
    }
    const text = buildContactMessage(formData);
    if (whatsappNumber) {
      window.open(buildWhatsAppUrl(whatsappNumber, text), "_blank", "noopener");
    } else if (email) {
      window.location.href = `mailto:${email}?subject=${encodeURIComponent("Message from the website")}&body=${encodeURIComponent(text)}`;
    }
    setFormData(empty);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <section id="contact" className="bg-background py-20 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center animate-fade-in-up">
            <h2 className="mb-6 font-display text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">Get In Touch</h2>
            <p className="text-lg text-muted-foreground">
              Have a question or looking for something special? Send us a message
              {whatsappNumber ? " on WhatsApp" : ""} and we&apos;ll get back to you.
            </p>
          </div>

          <div className="rounded-xl bg-card p-6 shadow-[var(--shadow-elevated)] animate-scale-in sm:p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
                    Your Name *
                  </label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required autoComplete="name" />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} autoComplete="email" />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-medium text-foreground">
                  Phone Number
                </label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} autoComplete="tel" />
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium text-foreground">
                  Message *
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help you..."
                  required
                  rows={6}
                  className="resize-none"
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={!canSend}>
                {whatsappNumber ? (
                  <>
                    Send on WhatsApp
                    <MessageCircle className="ml-2 h-5 w-5" />
                  </>
                ) : canSend ? (
                  <>
                    Send by email
                    <Send className="ml-2 h-5 w-5" />
                  </>
                ) : (
                  "Contact details coming soon"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
