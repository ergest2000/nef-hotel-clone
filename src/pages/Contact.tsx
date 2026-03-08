import { useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const contactInfo = [
  {
    icon: MapPin,
    label: "Adresa",
    value: 'Rruga "Asim Vokshi", në krah të OTP Bank',
  },
  {
    icon: Phone,
    label: "Telefoni",
    value: "+355 68 900 0034",
  },
  {
    icon: Mail,
    label: "Email",
    value: "shitje@egjeu.al",
  },
  {
    icon: Clock,
    label: "Oraret e hapjes",
    value: "Hënë – Shtunë: 08:30 – 20:30\nE diel: Mbyllur",
  },
];

const Contact = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    message: "",
  });
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Build mailto link as fallback (real integration needs Cloud)
    const subject = encodeURIComponent("Kërkesë e re nga faqja e internetit");
    const body = encodeURIComponent(
      `Emri: ${form.firstName}\nMbiemri: ${form.lastName}\nTelefoni: ${form.phone}\nEmail: ${form.email}\n\nMesazhi:\n${form.message}`
    );
    window.open(`mailto:shitje@egjeu.al?subject=${subject}&body=${body}`);
    toast({
      title: "Formulari u dërgua!",
      description: "Ekipi ynë do t'ju kontaktojë sa më shpejt.",
    });
    setForm({ firstName: "", lastName: "", phone: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:overflow-visible overflow-y-auto h-screen overscroll-none">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-primary py-16 md:py-24">
        <div className="container text-center">
          <h1 className="text-2xl md:text-4xl tracking-wide-brand text-primary-foreground font-light mb-4">
            NA KONTAKTONI
          </h1>
          <p className="max-w-2xl mx-auto text-sm md:text-base text-primary-foreground/80 leading-relaxed">
            Nëse keni pyetje rreth produkteve ose shërbimeve tona, ekipi ynë
            është gjithmonë i gatshëm t'ju ndihmojë. Mund të na kontaktoni
            përmes të dhënave më poshtë ose duke plotësuar formularin e kontaktit.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 md:py-20 bg-warm-gray">
        <div className="container">
          <h2 className="text-lg md:text-xl tracking-wide-brand text-foreground font-light text-center mb-12">
            INFORMACIONI I KONTAKTIT
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="bg-background border border-border p-6 text-center hover:shadow-lg transition-shadow"
              >
                <Icon
                  size={28}
                  className="mx-auto mb-4 text-primary"
                  strokeWidth={1.2}
                />
                <h3 className="text-xs tracking-wide-brand text-foreground mb-2 uppercase font-semibold">
                  {label}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg md:text-xl tracking-wide-brand text-foreground font-light text-center mb-2">
              FORMULARI I KONTAKTIT
            </h2>
            <p className="text-sm text-muted-foreground text-center mb-10 max-w-lg mx-auto">
              Ju lutemi plotësoni formularin më poshtë dhe ekipi ynë do t'ju
              kontaktojë sa më shpejt të jetë e mundur.
            </p>

            <form
              onSubmit={handleSubmit}
              className="bg-background border border-border p-8 md:p-10 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs tracking-brand text-muted-foreground uppercase">
                    Emri
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
                    Mbiemri
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
                    Telefoni
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
                  Mesazhi
                </label>
                <Textarea
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  className="min-h-[120px] border-border bg-background"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-xs tracking-wide-brand uppercase"
              >
                DËRGO
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Membership CTA */}
      <section className="py-16 md:py-20 bg-warm-gray">
        <div className="container text-center max-w-2xl mx-auto">
          <h2 className="text-lg md:text-xl tracking-wide-brand text-foreground font-light mb-4">
            BËHUNI ANËTAR
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">
            Regjistrohuni dhe bashkohuni me platformën tonë për të pasur akses
            në oferta ekskluzive dhe produkte të përshtatura për nevojat e
            hotelerisë.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-block px-10 py-3 bg-primary text-primary-foreground text-xs tracking-wide-brand uppercase hover:bg-primary/90 transition-colors"
            >
              REGJISTROHU
            </Link>
            <Link
              to="/login"
              className="inline-block px-10 py-3 border border-foreground text-foreground text-xs tracking-wide-brand uppercase hover:bg-foreground hover:text-background transition-colors"
            >
              HYR
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 md:py-20 bg-navy-light">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-xl md:text-2xl tracking-wide-brand text-primary-foreground font-light mb-3">
                NEWSLETTER
              </h2>
              <p className="text-sm text-primary-foreground/70">
                Bëhuni të parët që mësoni për ofertat dhe të rejat tona.
              </p>
            </div>
            <div>
              <p className="text-sm text-primary-foreground/80 mb-4 md:text-right">
                Vendosni adresën tuaj të email-it.
              </p>
              <div className="flex gap-0">
                <input
                  type="email"
                  placeholder="E-mail"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-4 py-3 bg-primary-foreground/10 border border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/50 text-sm focus:outline-none focus:border-primary-foreground"
                />
                <button className="px-6 py-3 bg-primary-foreground text-primary text-xs tracking-wide-brand uppercase hover:bg-primary-foreground/90 transition-colors">
                  Subscribe
                </button>
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
