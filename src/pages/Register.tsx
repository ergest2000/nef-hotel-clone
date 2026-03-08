import { useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Building2, User, Mail, Phone, MapPin, MessageSquare } from "lucide-react";

const Register = () => {
  const [form, setForm] = useState({
    business: "",
    fullName: "",
    email: "",
    phone: "",
    city: "",
    message: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate with backend
  };

  const fields = [
    { key: "business", label: "Emri i biznesit", icon: Building2, type: "text", placeholder: "Hotel / Resort name" },
    { key: "fullName", label: "Emër & Mbiemër", icon: User, type: "text", placeholder: "Full name" },
    { key: "email", label: "E-mail", icon: Mail, type: "email", placeholder: "your@email.com" },
    { key: "phone", label: "Numër Telefoni (WhatsApp)", icon: Phone, type: "tel", placeholder: "+355 69 000 0000" },
    { key: "city", label: "Qyteti / Shteti", icon: MapPin, type: "text", placeholder: "City / Country" },
  ] as const;

  return (
    <div className="min-h-screen bg-background flex flex-col md:overflow-visible md:h-auto overflow-y-auto h-screen overscroll-none">
      <SiteHeader />

      <section className="flex-1 flex items-center justify-center py-16 md:py-24 bg-warm-gray">
        <div className="w-full max-w-2xl mx-auto px-4">
          <div className="bg-background border border-border p-6 md:p-12">
            <h1 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light text-center mb-2">
              Client Registration
            </h1>
            <p className="text-xs text-muted-foreground text-center tracking-brand mb-10">
              B2B PARTNER APPLICATION
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {fields.map(({ key, label, icon: Icon, type, placeholder }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-xs tracking-brand text-muted-foreground uppercase">
                    {label}
                  </label>
                  <div className="relative">
                    <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={type}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => update(key, e.target.value)}
                      className="pl-10 h-11 border-border bg-background"
                      placeholder={placeholder}
                      required
                    />
                  </div>
                </div>
              ))}

              <div className="space-y-1.5">
                <label className="text-xs tracking-brand text-muted-foreground uppercase">
                  Mesazh / Detaje shtesë
                </label>
                <div className="relative">
                  <MessageSquare size={16} className="absolute left-3 top-3 text-muted-foreground" />
                  <Textarea
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    className="pl-10 min-h-[100px] border-border bg-background"
                    placeholder="Shkruani kërkesën ose nevojat tuaja..."
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-xs tracking-wide-brand uppercase"
              >
                Submit Registration
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-xs text-muted-foreground hover:text-primary tracking-brand transition-colors"
              >
                ALREADY HAVE AN ACCOUNT? LOGIN
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Register;
