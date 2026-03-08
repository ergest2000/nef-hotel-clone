import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductGalleryCarousel from "@/components/ProductGalleryCarousel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Stamp, Ruler, Gem, Factory } from "lucide-react";
import { usePageContent, usePageSections, getContentValue } from "@/hooks/useCms";
import heroImg from "@/assets/tailor-made-hero.jpg";

const defaultServices = [
  { key: "svc1", icon: Stamp, fallbackTitle: "Logo Embroidery", fallbackDesc: "Vendosja e logos së hotelit në çarçafë, peshqirë dhe produkte të tjera tekstile." },
  { key: "svc2", icon: Ruler, fallbackTitle: "Custom Dimensions", fallbackDesc: "Prodhim me dimensione specifike sipas kërkesës së hotelit." },
  { key: "svc3", icon: Gem, fallbackTitle: "Premium Materials", fallbackDesc: "Përdorim i materialeve cilësore dhe rezistente për përdorim profesional." },
  { key: "svc4", icon: Factory, fallbackTitle: "Professional Production", fallbackDesc: "Prodhim i dedikuar për hotele, resorte dhe struktura akomodimi." },
];

const TailorMade = () => {
  const { data: content } = usePageContent("tailor-made", "al");
  const { data: sections } = usePageSections("tailor-made");
  const [form, setForm] = useState({ firstName: "", lastName: "", hotelName: "", city: "", phone: "", email: "", specification: "" });

  const isSectionVisible = (key: string) => {
    if (!sections) return true;
    const s = sections.find((sec) => sec.section_key === key);
    return s ? s.visible : true;
  };

  const getImg = (sectionKey: string, fieldKey: string, fallback: string) => {
    const val = getContentValue(content, sectionKey, fieldKey, "");
    return val && !val.startsWith("/src/") ? val : fallback;
  };

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); };

  return (
    <div className="min-h-screen bg-background flex flex-col md:overflow-visible md:h-auto overflow-y-auto h-screen overscroll-none">
      <SiteHeader />

      {isSectionVisible("hero") && (
        <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
          <img src={getImg("hero", "image", heroImg)} alt="Luxury hotel linen" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-foreground/50" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-3xl md:text-5xl tracking-wide-brand text-primary-foreground font-light mb-6">
              {getContentValue(content, "hero", "title", "TEKSTILE TË PERSONALIZUARA")}
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-primary-foreground/90 leading-relaxed mb-8">
              {getContentValue(content, "hero", "subtitle", "Why not have the experience of pleasure and hospitality with your name on the linen?")}
            </p>
            <a href="#contact-form" className="inline-block px-10 py-3 bg-primary text-primary-foreground text-xs tracking-wide-brand uppercase hover:bg-navy-dark transition-colors">
              {getContentValue(content, "hero", "cta_text", "Tailor Made Applications")}
            </a>
          </div>
        </section>
      )}

      {isSectionVisible("services") && (
        <section className="py-16 md:py-24 bg-warm-gray">
          <div className="container">
            <h2 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light text-center mb-14">
              {getContentValue(content, "services", "title", "OUR SERVICES")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {defaultServices.map(({ key, icon: Icon, fallbackTitle, fallbackDesc }) => (
                <div key={key} className="bg-background border border-border p-8 text-center hover:shadow-lg transition-shadow">
                  <Icon size={36} className="mx-auto mb-5 text-primary" strokeWidth={1.2} />
                  <h3 className="text-xs tracking-wide-brand text-foreground mb-3 uppercase">
                    {getContentValue(content, "services", `${key}_title`, fallbackTitle)}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {getContentValue(content, "services", `${key}_desc`, fallbackDesc)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <ProductGalleryCarousel />

      {isSectionVisible("contact-form") && (
        <section id="contact-form" className="py-16 md:py-24 bg-warm-gray">
          <div className="container">
            <div className="max-w-2xl mx-auto bg-background border border-border p-8 md:p-12">
              <h2 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light text-center mb-2">CONTACT FORM</h2>
              <p className="text-xs text-muted-foreground text-center tracking-brand mb-10">TAILOR MADE REQUEST</p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5"><label className="text-xs tracking-brand text-muted-foreground uppercase">First Name</label><Input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} className="h-11 border-border bg-background" required /></div>
                  <div className="space-y-1.5"><label className="text-xs tracking-brand text-muted-foreground uppercase">Last Name</label><Input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} className="h-11 border-border bg-background" required /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5"><label className="text-xs tracking-brand text-muted-foreground uppercase">Hotel Name</label><Input value={form.hotelName} onChange={(e) => update("hotelName", e.target.value)} className="h-11 border-border bg-background" required /></div>
                  <div className="space-y-1.5"><label className="text-xs tracking-brand text-muted-foreground uppercase">City</label><Input value={form.city} onChange={(e) => update("city", e.target.value)} className="h-11 border-border bg-background" required /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5"><label className="text-xs tracking-brand text-muted-foreground uppercase">Phone</label><Input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="h-11 border-border bg-background" required /></div>
                  <div className="space-y-1.5"><label className="text-xs tracking-brand text-muted-foreground uppercase">E-mail</label><Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className="h-11 border-border bg-background" required /></div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs tracking-brand text-muted-foreground uppercase">Specification / Request Details</label>
                  <Textarea value={form.specification} onChange={(e) => update("specification", e.target.value)} className="min-h-[120px] border-border bg-background" required />
                </div>
                <Button type="submit" className="w-full h-11 text-xs tracking-wide-brand uppercase">Submit</Button>
              </form>
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
};

export default TailorMade;
