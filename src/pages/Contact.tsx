import { useState } from "react";
import SlugLink from "@/components/SlugLink";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MembershipSection from "@/components/MembershipSection";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePageContent, usePageSections, getContentValue } from "@/hooks/useCms";
import { useLanguage } from "@/hooks/useLanguage";
import { useDesign } from "@/hooks/useDesignSettings";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-2.jpg";

const Contact = () => {
  const { toast } = useToast();
  const { lang, isAl } = useLanguage();
  const { data: content } = usePageContent("contact", lang);
  const { data: sections } = usePageSections("contact");
  const { settings } = useDesign();
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", message: "" });

  const mapLat = settings["contact_map_lat"] || "41.3275";
  const mapLng = settings["contact_map_lng"] || "19.8187";
  const mapZoom = settings["contact_map_zoom"] || "15";

  const isSectionVisible = (key: string) => {
    if (!sections) return true;
    const s = sections.find((sec) => sec.section_key === key);
    return s ? s.visible : true;
  };

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supabase.from("registrations").insert({
        data: {
          type: "contact",
          fullName: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          phone: form.phone,
          message: form.message,
        },
      });
    } catch {}
    const subject = encodeURIComponent("Kërkesë e re nga faqja e internetit");
    const body = encodeURIComponent(`Emri: ${form.firstName}\nMbiemri: ${form.lastName}\nTelefoni: ${form.phone}\nEmail: ${form.email}\n\nMesazhi:\n${form.message}`);
    window.open(`mailto:shitje@egjeu.al?subject=${subject}&body=${body}`);
    toast({ title: "Formulari u dërgua!", description: "Ekipi ynë do t'ju kontaktojë sa më shpejt." });
    setForm({ firstName: "", lastName: "", phone: "", email: "", message: "" });
  };

  const contactInfo = [
    { icon: MapPin, label: getContentValue(content, "info", "address_label", isAl ? "Adresa" : "Address"), value: getContentValue(content, "info", "address", 'Rruga "Asim Vokshi", në krah të OTP Bank') },
    { icon: Phone, label: getContentValue(content, "info", "phone_label", isAl ? "Telefoni" : "Phone"), value: getContentValue(content, "info", "phone", "+355 68 900 0034") },
    { icon: Mail, label: getContentValue(content, "info", "email_label", "Email"), value: getContentValue(content, "info", "email", "shitje@egjeu.al") },
    { icon: Clock, label: getContentValue(content, "info", "hours_label", isAl ? "Oraret e hapjes" : "Opening Hours"), value: getContentValue(content, "info", "hours", "Hënë – Shtunë: 08:30 – 20:30\nE diel: Mbyllur") },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:overflow-visible md:h-auto overflow-y-auto h-screen overscroll-none">
      <SiteHeader />

      {isSectionVisible("hero") && (
        <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          <img src={heroImg} alt="Contact" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/70" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-light tracking-brand text-primary-foreground mb-4">
                {getContentValue(content, "hero", "title", "NA KONTAKTONI")}
              </h1>
              <p className="text-sm md:text-base text-primary-foreground/80 max-w-2xl mx-auto tracking-wide px-6">
                {getContentValue(content, "hero", "subtitle", "Nëse keni pyetje rreth produkteve ose shërbimeve tona, ekipi ynë është gjithmonë i gatshëm t'ju ndihmojë.")}
              </p>
            </div>
          </div>
        </section>
      )}

      {isSectionVisible("info") && (
        <section className="py-16 md:py-20 bg-background">
          <div className="container">
            <h2 className="text-lg md:text-xl tracking-wide-brand text-foreground font-light text-center mb-12">
              {getContentValue(content, "info", "title", "INFORMACIONI I KONTAKTIT")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactInfo.map(({ icon: Icon, label, value }) => (
                <div key={label} className="group bg-background border border-border p-8 text-center hover:border-primary hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors">
                    <Icon size={24} className="text-primary" strokeWidth={1.2} />
                  </div>
                  <h3 className="text-xs tracking-wide-brand text-foreground mb-3 uppercase font-semibold">{label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-0">
        <div className="w-full h-[300px] md:h-[450px] overflow-hidden">
          <iframe
            title="Google Maps"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${mapLat},${mapLng}&z=${mapZoom}&output=embed`}
          />
        </div>
      </section>

      {isSectionVisible("form") && (
        <section className="py-16 md:py-20 bg-secondary/30">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-lg md:text-xl tracking-wide-brand text-foreground font-light text-center mb-2">
                {getContentValue(content, "form", "title", "FORMULARI I KONTAKTIT")}
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-10 max-w-lg mx-auto">
                {getContentValue(content, "form", "subtitle", "Ju lutemi plotësoni formularin më poshtë.")}
              </p>
              <form onSubmit={handleSubmit} className="bg-background border border-border p-8 md:p-12 space-y-6 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs tracking-brand text-muted-foreground uppercase">Emri</label>
                    <Input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} className="h-12 border-border bg-background focus:border-primary" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs tracking-brand text-muted-foreground uppercase">Mbiemri</label>
                    <Input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} className="h-12 border-border bg-background focus:border-primary" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs tracking-brand text-muted-foreground uppercase">Telefoni</label>
                    <Input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="h-12 border-border bg-background focus:border-primary" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs tracking-brand text-muted-foreground uppercase">E-mail</label>
                    <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="h-12 border-border bg-background focus:border-primary" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs tracking-brand text-muted-foreground uppercase">Mesazhi</label>
                  <Textarea value={form.message} onChange={(e) => update("message", e.target.value)} className="min-h-[140px] border-border bg-background focus:border-primary" required />
                </div>
                <Button type="submit" className="w-full h-12 text-xs tracking-wide-brand uppercase gap-2">
                  <Send size={16} strokeWidth={1.5} />
                  DËRGO
                </Button>
              </form>
            </div>
          </div>
        </section>
      )}

      {isSectionVisible("membership-cta") && (
        <MembershipSection content={content ?? undefined} />
      )}

      <SiteFooter />
    </div>
  );
};

export default Contact;
