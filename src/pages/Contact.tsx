import { useState } from "react";
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
import contactHero from "@/assets/company-hero.jpg";

function Contact() {
  var toastHook = useToast();
  var toast = toastHook.toast;
  var langHook = useLanguage();
  var lang = langHook.lang;
  var isAl = langHook.isAl;
  var contentData = usePageContent("contact", lang);
  var content = contentData.data;
  var sectionsData = usePageSections("contact");
  var sections = sectionsData.data;
  var designHook = useDesign();
  var settings = designHook.settings;
  var formState = useState({ firstName: "", lastName: "", phone: "", email: "", message: "" });
  var form = formState[0];
  var setForm = formState[1];

  var mapLat = settings["contact_map_lat"] || "41.3275";
  var mapLng = settings["contact_map_lng"] || "19.8187";
  var mapZoom = settings["contact_map_zoom"] || "15";
  var infoBgColor = settings["contact_info_bg_color"];

  function isSectionVisible(key: string) {
    if (!sections) return true;
    var s = sections.find(function (sec) { return sec.section_key === key; });
    return s ? s.visible : true;
  }

  function g(section: string, key: string, fallback: string) {
    return getContentValue(content, section, key, fallback);
  }

  function update(field: string, value: string) {
    setForm(function (prev) {
      var next = Object.assign({}, prev);
      (next as any)[field] = value;
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await supabase.from("registrations").insert({
        data: {
          type: "contact",
          fullName: (form.firstName + " " + form.lastName).trim(),
          email: form.email,
          phone: form.phone,
          message: form.message,
        },
      });
    } catch (err) {}
    var subject = encodeURIComponent(isAl ? "Kërkesë e re nga faqja e internetit" : "New request from website");
    var body = encodeURIComponent((isAl ? "Emri" : "Name") + ": " + form.firstName + " " + form.lastName + "\n" + (isAl ? "Telefoni" : "Phone") + ": " + form.phone + "\nEmail: " + form.email + "\n\n" + (isAl ? "Mesazhi" : "Message") + ":\n" + form.message);
    window.open("mailto:" + g("info", "email", "shitje@egjeu.al") + "?subject=" + subject + "&body=" + body);
    toast({ title: g("form", "success_title", "Formulari u dërgua!"), description: g("form", "success_desc", "Ekipi ynë do t'ju kontaktojë sa më shpejt.") });
    setForm({ firstName: "", lastName: "", phone: "", email: "", message: "" });
  }

  var heroImage = g("hero", "image", "");
  var heroSrc = heroImage && !heroImage.startsWith("/src/") ? heroImage : contactHero;

  var contactInfo = [
    { icon: MapPin, label: g("info", "address_label", isAl ? "Adresa" : "Address"), value: g("info", "address", 'Rruga "Asim Vokshi", në krah të OTP Bank') },
    { icon: Phone, label: g("info", "phone_label", isAl ? "Telefoni" : "Phone"), value: g("info", "phone", "+355 68 900 0034") },
    { icon: Mail, label: g("info", "email_label", "Email"), value: g("info", "email", "shitje@egjeu.al") },
    { icon: Clock, label: g("info", "hours_label", isAl ? "Oraret e hapjes" : "Opening Hours"), value: g("info", "hours", "Hënë – Shtunë: 08:30 – 20:30\nE diel: Mbyllur") },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      {isSectionVisible("hero") && (
        <section className="relative h-[35vh] md:h-[50vh] overflow-hidden">
          <img src={heroSrc} alt="Contact" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-primary/60" />
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-2xl md:text-5xl font-light tracking-brand text-primary-foreground mb-3 md:mb-4">
              {g("hero", "title", "NA KONTAKTONI")}
            </h1>
            <p className="text-xs md:text-base text-primary-foreground/80 max-w-2xl mx-auto tracking-wide">
              {g("hero", "subtitle", isAl ? "Nëse keni pyetje rreth produkteve ose shërbimeve tona, ekipi ynë është gjithmonë i gatshëm t'ju ndihmojë." : "If you have questions about our products or services, our team is always ready to help.")}
            </p>
          </div>
        </section>
      )}

      {isSectionVisible("info") && (
        <section className="py-12 md:py-20" style={{ backgroundColor: "hsl(" + (infoBgColor || "207 40% 92%") + ")" }}>
          <div className="container">
            <h2 className="text-lg md:text-xl tracking-wide-brand text-foreground font-light text-center mb-10 md:mb-12">
              {g("info", "title", isAl ? "INFORMACIONI I KONTAKTIT" : "CONTACT INFORMATION")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {contactInfo.map(function (item) {
                var Icon = item.icon;
                return (
                  <div key={item.label} className="bg-background border border-border p-6 text-center hover:shadow-lg transition-shadow">
                    <Icon size={28} className="mx-auto mb-4 text-primary" strokeWidth={1.2} />
                    <h3 className="text-xs tracking-wide-brand text-foreground mb-2 uppercase font-semibold">{item.label}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {isSectionVisible("map") && (
        <section>
          <iframe
            src={"https://maps.google.com/maps?q=" + mapLat + "," + mapLng + "&z=" + mapZoom + "&output=embed"}
            width="100%"
            height="350"
            className="md:h-[450px]"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="container py-3">
            <p className="text-[11px] text-muted-foreground tracking-wider">
              <MapPin className="inline h-3 w-3 mr-1" />
              {mapLat}, {mapLng}
            </p>
          </div>
        </section>
      )}

      {isSectionVisible("form") && (
        <section className="py-12 md:py-20 bg-muted/30">
          <div className="container">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-lg md:text-xl tracking-wide-brand text-foreground font-light text-center mb-3">
                {g("form", "title", isAl ? "NA SHKRUANI" : "WRITE TO US")}
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-8 md:mb-10 max-w-lg mx-auto">
                {g("form", "subtitle", isAl ? "Ju lutemi plotësoni formularin më poshtë." : "Please fill in the form below.")}
              </p>
              <form onSubmit={handleSubmit} className="bg-background border border-border p-6 md:p-10 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5"><label className="text-xs tracking-brand text-muted-foreground uppercase">{g("form", "firstname_label", isAl ? "Emri" : "First Name")}</label><Input value={form.firstName} onChange={function (e: any) { update("firstName", e.target.value); }} className="h-11 border-border bg-background" required /></div>
                  <div className="space-y-1.5"><label className="text-xs tracking-brand text-muted-foreground uppercase">{g("form", "lastname_label", isAl ? "Mbiemri" : "Last Name")}</label><Input value={form.lastName} onChange={function (e: any) { update("lastName", e.target.value); }} className="h-11 border-border bg-background" required /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5"><label className="text-xs tracking-brand text-muted-foreground uppercase">{g("form", "phone_label", isAl ? "Telefoni" : "Phone")}</label><Input type="tel" value={form.phone} onChange={function (e: any) { update("phone", e.target.value); }} className="h-11 border-border bg-background" required /></div>
                  <div className="space-y-1.5"><label className="text-xs tracking-brand text-muted-foreground uppercase">{g("form", "email_label", "E-mail")}</label><Input type="email" value={form.email} onChange={function (e: any) { update("email", e.target.value); }} className="h-11 border-border bg-background" required /></div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs tracking-brand text-muted-foreground uppercase">{g("form", "message_label", isAl ? "Mesazhi" : "Message")} <span className="text-muted-foreground/50 normal-case">({isAl ? "opsional" : "optional"})</span></label>
                  <Textarea value={form.message} onChange={function (e: any) { update("message", e.target.value); }} className="min-h-[120px] border-border bg-background" />
                </div>
                <Button type="submit" className="w-full h-11 text-xs tracking-wide-brand uppercase">{g("form", "button_text", isAl ? "DËRGO" : "SEND")}</Button>
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

export default Contact;
