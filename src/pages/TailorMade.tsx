import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import MembershipSection from "@/components/MembershipSection";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Scissors, Palette, ShieldCheck, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePageContent, usePageSections, getContentValue } from "@/hooks/useCms";
import heroImg from "@/assets/tailor-made-hero.jpg";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { uploadCmsImage } from "@/hooks/useCms";

function TailorMade() {
  var toastHook = useToast();
  var toast = toastHook.toast;
  var langHook = useLanguage();
  var lang = langHook.lang;
  var isAl = langHook.isAl;
  var contentData = usePageContent("tailor-made", lang);
  var content = contentData.data;
  var sectionsData = usePageSections("tailor-made");
  var sections = sectionsData.data;
  var formState = useState({ firstName: "", lastName: "", hotelName: "", city: "", phone: "", email: "", specification: "" });
  var form = formState[0];
  var setForm = formState[1];

  function isSectionVisible(key: string) {
    if (!sections) return true;
    var s = sections.find(function (sec) { return sec.section_key === key; });
    return s ? s.visible : true;
  }

  function update(field: string, value: string) {
    setForm(function (prev) {
      var next = Object.assign({}, prev);
      (next as any)[field] = value;
      return next;
    });
  }

  function getImg(section: string, field: string, fallback: string) {
    var val = getContentValue(content, section, field, "");
    if (val && !val.startsWith("/src/")) return val;
    return fallback;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await supabase.from("registrations").insert({
        data: {
          type: "tailor_made",
          fullName: (form.firstName + " " + form.lastName).trim(),
          hotel: form.hotelName,
          city: form.city,
          phone: form.phone,
          email: form.email,
          specification: form.specification,
        },
      });
    } catch (err) {}
    toast({ title: isAl ? "Kërkesa u dërgua!" : "Request sent!", description: isAl ? "Do t'ju kontaktojmë së shpejti." : "We'll contact you soon." });
    setForm({ firstName: "", lastName: "", hotelName: "", city: "", phone: "", email: "", specification: "" });
  }

  var services = [
    { icon: Scissors, title: getContentValue(content, "services", "s1_title", "Custom Design"), desc: getContentValue(content, "services", "s1_desc", "Personalized textile designs tailored to your brand.") },
    { icon: Palette, title: getContentValue(content, "services", "s2_title", "Color Matching"), desc: getContentValue(content, "services", "s2_desc", "Exact color matching to your brand guidelines.") },
    { icon: ShieldCheck, title: getContentValue(content, "services", "s3_title", "Quality Assurance"), desc: getContentValue(content, "services", "s3_desc", "Rigorous quality control on every order.") },
    { icon: Truck, title: getContentValue(content, "services", "s4_title", "Fast Delivery"), desc: getContentValue(content, "services", "s4_desc", "Reliable delivery across Europe.") },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      {isSectionVisible("hero") && (
        <section className="relative h-[40vh] md:h-[70vh] overflow-hidden">
          <img src={getImg("hero", "image", heroImg)} alt="Luxury hotel linen" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-foreground/50" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-xl md:text-5xl tracking-wide-brand text-primary-foreground font-light mb-3 md:mb-6">
              {getContentValue(content, "hero", "title", "TEKSTILE TË PERSONALIZUARA")}
            </h1>
            <p className="max-w-2xl text-xs md:text-base text-primary-foreground/90 leading-relaxed mb-6 md:mb-8">
              {getContentValue(content, "hero", "subtitle", "Why not have the experience of pleasure and hospitality with your name on the linen?")}
            </p>
            <a href="#contact-form" className="rounded inline-block px-8 md:px-10 py-2.5 md:py-3 bg-primary text-primary-foreground text-[10px] md:text-xs tracking-wide-brand uppercase hover:bg-navy-dark transition-colors">
              {getContentValue(content, "hero", "cta_text", "Tailor Made Applications")}
            </a>
          </div>
        </section>
      )}

      {isSectionVisible("services") && (
        <section className="py-12 md:py-24 bg-warm-gray">
          <div className="container">
            <h2 className="text-lg md:text-2xl tracking-wide-brand text-foreground font-light text-center mb-10 md:mb-16">
              {getContentValue(content, "services", "title", isAl ? "SHËRBIMET TONA" : "OUR SERVICES")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {services.map(function (item) {
                var Icon = item.icon;
                return (
                  <div key={item.title} className="bg-background border border-border p-5 md:p-8 text-center hover:shadow-lg transition-shadow">
                    <Icon size={28} className="mx-auto mb-3 md:mb-5 text-primary" strokeWidth={1.2} />
                    <h3 className="text-[10px] md:text-xs tracking-wide-brand text-foreground mb-2 uppercase font-semibold">{item.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {isSectionVisible("form") && (
        <section id="contact-form" className="py-12 md:py-24 bg-warm-gray">
          <div className="container">
            <div className="max-w-2xl mx-auto bg-background border border-border p-6 md:p-12">
              <h2 className="text-lg md:text-2xl tracking-wide-brand text-foreground font-light text-center mb-8 md:mb-10">
                {getContentValue(content, "form", "title", isAl ? "KËRKESË PËR PERSONALIZIM" : "CUSTOMIZATION REQUEST")}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5"><label className="text-xs tracking-brand text-muted-foreground uppercase">First Name</label><Input value={form.firstName} onChange={function (e: any) { update("firstName", e.target.value); }} className="h-11 border-border bg-background" required /></div>
                  <div className="space-y-1.5"><label className="text-xs tracking-brand text-muted-foreground uppercase">Last Name</label><Input value={form.lastName} onChange={function (e: any) { update("lastName", e.target.value); }} className="h-11 border-border bg-background" required /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5"><label className="text-xs tracking-brand text-muted-foreground uppercase">Hotel Name</label><Input value={form.hotelName} onChange={function (e: any) { update("hotelName", e.target.value); }} className="h-11 border-border bg-background" required /></div>
                  <div className="space-y-1.5"><label className="text-xs tracking-brand text-muted-foreground uppercase">City</label><Input value={form.city} onChange={function (e: any) { update("city", e.target.value); }} className="h-11 border-border bg-background" required /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5"><label className="text-xs tracking-brand text-muted-foreground uppercase">Phone</label><Input type="tel" value={form.phone} onChange={function (e: any) { update("phone", e.target.value); }} className="h-11 border-border bg-background" required /></div>
                  <div className="space-y-1.5"><label className="text-xs tracking-brand text-muted-foreground uppercase">E-mail</label><Input type="email" value={form.email} onChange={function (e: any) { update("email", e.target.value); }} className="h-11 border-border bg-background" required /></div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs tracking-brand text-muted-foreground uppercase">Specification <span className="text-muted-foreground/50 normal-case">(optional)</span></label>
                  <Textarea value={form.specification} onChange={function (e: any) { update("specification", e.target.value); }} className="min-h-[120px] border-border bg-background" />
                </div>
                <Button type="submit" className="w-full h-11 text-xs tracking-wide-brand uppercase">{isAl ? "DËRGO KËRKESËN" : "SEND REQUEST"}</Button>
              </form>
            </div>
          </div>
        </section>
      )}

      {isSectionVisible("membership-cta") && (
        <MembershipSection content={content || undefined} />
      )}

      <SiteFooter />
    </div>
  );
}

export default TailorMade;
