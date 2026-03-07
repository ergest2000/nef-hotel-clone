import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductGalleryCarousel from "@/components/ProductGalleryCarousel";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Stamp, Ruler, Gem, Factory } from "lucide-react";
import heroImg from "@/assets/tailor-made-hero.jpg";

const services = [
  {
    icon: Stamp,
    title: "Logo Embroidery",
    desc: "Vendosja e logos së hotelit në çarçafë, peshqirë dhe produkte të tjera tekstile.",
  },
  {
    icon: Ruler,
    title: "Custom Dimensions",
    desc: "Prodhim me dimensione specifike sipas kërkesës së hotelit.",
  },
  {
    icon: Gem,
    title: "Premium Materials",
    desc: "Përdorim i materialeve cilësore dhe rezistente për përdorim profesional.",
  },
  {
    icon: Factory,
    title: "Professional Production",
    desc: "Prodhim i dedikuar për hotele, resorte dhe struktura akomodimi.",
  },
];

const TailorMade = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    hotelName: "",
    city: "",
    phone: "",
    email: "",
    specification: "",
  });
  const [showGallery, setShowGallery] = useState(false);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <img
          src={heroImg}
          alt="Luxury hotel linen with embroidered logo"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-foreground/50" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-3xl md:text-5xl tracking-wide-brand text-primary-foreground font-light mb-6">
            TEKSTILE TË PERSONALIZUARA
          </h1>
          <p className="max-w-2xl text-sm md:text-base text-primary-foreground/90 leading-relaxed mb-8">
            Why not have the experience of pleasure and hospitality with your
            name on the linen? We provide you with tailor-made solutions that
            suit your needs and apply your logo on the products you choose. The
            stay turns into a moment of luxury.
          </p>
          <a
            href="#contact-form"
            className="inline-block px-10 py-3 bg-primary text-primary-foreground text-xs tracking-wide-brand uppercase hover:bg-navy-dark transition-colors"
          >
            Tailor Made Applications
          </a>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24 bg-warm-gray">
        <div className="container">
          <h2 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light text-center mb-14">
            OUR SERVICES
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-background border border-border p-8 text-center hover:shadow-lg transition-shadow"
              >
                <Icon size={36} className="mx-auto mb-5 text-primary" strokeWidth={1.2} />
                <h3 className="text-xs tracking-wide-brand text-foreground mb-3 uppercase">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Show More */}
      <section className="py-12 bg-background">
        <div className="container text-center">
          <button
            onClick={() => setShowGallery(!showGallery)}
            className="inline-flex items-center gap-2 px-10 py-3 border border-border text-xs tracking-wide-brand uppercase text-foreground hover:bg-warm-gray transition-colors"
          >
            Show More
            <ChevronDown
              size={16}
              className={`transition-transform ${showGallery ? "rotate-180" : ""}`}
            />
          </button>

          {showGallery && (
            <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4 animate-hero-in">
              {[
                "Embroidered pillowcases with hotel monogram",
                "Custom-sized king bed sheets",
                "Branded spa towels collection",
                "Restaurant table linen set",
                "Pool towels with resort logo",
                "Premium bathrobes with embroidery",
              ].map((item, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] bg-warm-gray border border-border flex items-center justify-center p-6"
                >
                  <p className="text-xs tracking-brand text-muted-foreground text-center uppercase">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact-form" className="py-16 md:py-24 bg-warm-gray">
        <div className="container">
          <div className="max-w-2xl mx-auto bg-background border border-border p-8 md:p-12">
            <h2 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light text-center mb-2">
              CONTACT FORM
            </h2>
            <p className="text-xs text-muted-foreground text-center tracking-brand mb-10">
              TAILOR MADE REQUEST
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs tracking-brand text-muted-foreground uppercase">
                    First Name
                  </label>
                  <Input
                    value={form.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                    className="h-11 border-border bg-background"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs tracking-brand text-muted-foreground uppercase">
                    Last Name
                  </label>
                  <Input
                    value={form.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                    className="h-11 border-border bg-background"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs tracking-brand text-muted-foreground uppercase">
                    Hotel Name
                  </label>
                  <Input
                    value={form.hotelName}
                    onChange={(e) => update("hotelName", e.target.value)}
                    className="h-11 border-border bg-background"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs tracking-brand text-muted-foreground uppercase">
                    City
                  </label>
                  <Input
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    className="h-11 border-border bg-background"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs tracking-brand text-muted-foreground uppercase">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="h-11 border-border bg-background"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs tracking-brand text-muted-foreground uppercase">
                    E-mail
                  </label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="h-11 border-border bg-background"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs tracking-brand text-muted-foreground uppercase">
                  Specification / Request Details
                </label>
                <p className="text-xs text-muted-foreground mb-1">
                  Please fill the specification of product for which you would
                  want a special production.
                </p>
                <Textarea
                  value={form.specification}
                  onChange={(e) => update("specification", e.target.value)}
                  className="min-h-[120px] border-border bg-background"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-xs tracking-wide-brand uppercase"
              >
                Submit
              </Button>
            </form>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default TailorMade;
