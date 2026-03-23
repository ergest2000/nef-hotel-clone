import { useState } from "react";
import SlugLink from "@/components/SlugLink";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MembershipSection from "@/components/MembershipSection";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePageContent, usePageSections, getContentValue } from "@/hooks/useCms";
import { useLanguage } from "@/hooks/useLanguage";
import { useDesign } from "@/hooks/useDesignSettings";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const { toast } = useToast();
  const { lang } = useLanguage();
  const { data: content } = usePageContent("contact", lang);
  const { data: sections } = usePageSections("contact");
  const { settings } = useDesign();
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", message: "" });
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const mapLat = settings["contact_map_lat"] || "41.3275";
  const mapLng = settings["contact_map_lng"] || "19.8187";
  const mapZoom = settings["contact_map_zoom"] || "15";
  const infoBgColor = settings["contact_info_bg_color"];

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

  const handleNewsletterSubmit = async () => {
    if (!newsletterEmail) return;
    try {
      await supabase.from("registrations").insert({
        data: {
          type: "newsletter",
          email: newsletterEmail,
        },
      });
      toast({ title: "U regjistruat me sukses!", description: "Do të merrni të rejat tona." });
      setNewsletterEmail("");
    } catch {
      toast({ title: "Gabim", description: "Provoni përsëri.", variant: "destructive" });
    }
  };

  const contactInfo = [
    { icon: MapPin, label: "Adresa", value: getContentValue(content, "info", "address", 'Rruga "Asim Vokshi", në krah të OTP Bank') },
    { icon: Phone, label: "Telefoni", value: getContentValue(content, "info", "phone", "+355 68 900 0034") },
    { icon: Mail, label: "Email", value: getContentValue(content, "info", "email", "shitje@egjeu.al") },
    { icon: Clock, label: "Oraret e hapjes", value: getContentValue(content, "info", "hours", "Hënë – Shtunë: 08:30 – 20:30\nE diel: Mbyllur") },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:overflow-visible md:h-auto overflow-y-auto h-screen overscroll-none">
      <SiteHeader />

      {isSectionVisible("hero") && (
        <section className="py-16 md:py-24 bg-warm-gray">
          <div className="container text-center">
            <h1 className="text-3xl md:text-5xl font-light tracking-brand text-foreground mb-4">
              {getContentValue(content, "hero", "title", "NA KONTAKTONI")}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto tracking-wide">
              {getContentValue(content, "hero", "subtitle", "Nëse keni pyetje rreth produkteve ose shërbimeve tona, ekipi ynë është gjithmonë i gatshëm t'ju ndihmojë.")}
            </p>
          </div>
        </section>
      )}

      {isSectionVisible("info") && (
        <section className="py-16 md:py-20" style={infoBgColor ? { backgroundColor: `hsl(${infoBgColor})` } : undefined}>
          <div className="container">
            <h2 className="text-lg md:text-xl tracking-wide-brand text-foreground font-light text-center mb-12">
              {getContentValue(content, "info", "title", "INFORMACIONI I KONTAKTIT")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactInfo.map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-background border border-border p-6 text-center hover:shadow-lg transition-shadow">
                  <Icon size={28} className="mx-auto mb-4 text-primary" strokeWidth={1.2} />
                  <h3 className="text-xs tracking-wide-brand text-foreground mb-2 uppercase font-semibold">{label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Google Maps - after contact info */}
      <section className="py-0">
        <div className="container">
          <div className="w-full h-[300px] md:h-[400px] border border-border overflow-hidden">
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
        </div>
      </section>

      {isSectionVisible("form") && (
        <section className="py-16 md:py-20">
          <div className="container">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-lg md:text-xl tracking-wide-brand text-foreground font-light text-center mb-2">
                {getContentValue(content, "form", "title", "FORMULARI I KONTAKTIT")}
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-10 max-w-lg mx-auto">
                {getContentValue(content, "form", "subtitle", "Ju lutemi plotësoni formularin më poshtë.")}
              </p>
              <form onSubmit={handleSubmit} className="bg-background border border-border p-8 md:p-10 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5"><label className="text-xs tracking-brand text-muted-foreground uppercase">Emri</label><Input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} className="h-11 border-border bg-background" required /></div>
                  <div className="space-y-1.5"><label className="text-xs tracking-brand text-muted-foreground uppercase">Mbiemri</label><Input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} className="h-11 border-border bg-background" required /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5"><label className="text-xs tracking-brand text-muted-foreground uppercase">Telefoni</label><Input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="h-11 border-border bg-background" required /></div>
                  <div className="space-y-1.5"><label className="text-xs tracking-brand text-muted-foreground uppercase">E-mail</label><Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="h-11 border-border bg-background" required /></div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs tracking-brand text-muted-foreground uppercase">Mesazhi</label>
                  <Textarea value={form.message} onChange={(e) => update("message", e.target.value)} className="min-h-[120px] border-border bg-background" required />
                </div>
                <Button type="submit" className="w-full h-11 text-xs tracking-wide-brand uppercase">DËRGO</Button>
              </form>
            </div>
          </div>
        </section>
      )}


      {isSectionVisible("membership-cta") && (
        <MembershipSection content={content ?? undefined} />
      )}

      <section className="py-16 md:py-20 bg-newsletter-bg">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-xl md:text-2xl tracking-wide-brand text-primary-foreground font-light mb-3">NEWSLETTER</h2>
              <p className="text-sm text-primary-foreground/70">Bëhuni të parët që mësoni për ofertat dhe të rejat tona.</p>
            </div>
            <div>
              <p className="text-sm text-primary-foreground/80 mb-4 md:text-right">Vendosni adresën tuaj të email-it.</p>
              <div className="flex gap-0">
                <input type="email" placeholder="E-mail" value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} className="flex-1 px-4 py-3 bg-primary-foreground/10 border border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/50 text-sm focus:outline-none focus:border-primary-foreground" />
                <button type="button" onClick={handleNewsletterSubmit} className="px-6 py-3 bg-primary-foreground text-primary text-xs tracking-wide-brand uppercase hover:bg-primary-foreground/90 transition-colors">Subscribe</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Contact;
