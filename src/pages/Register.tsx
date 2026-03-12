import { useState } from "react";
import SlugLink from "@/components/SlugLink";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, User, Mail, Phone, MapPin, Lock, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthTexts, logAuthEvent } from "@/hooks/useAuthTexts";
import { useLanguage } from "@/hooks/useLanguage";
import { countries } from "@/data/countries";

const Register = () => {
  const { toast } = useToast();
  const { t } = useAuthTexts();
  const { isAl } = useLanguage();
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedCountry = countries.find(c => c.code === country);
  const cities = selectedCountry?.cities ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Gabim", description: t("register_password_error", "Fjalëkalimi duhet të ketë të paktën 6 karaktere."), variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Gabim", description: t("register_password_mismatch", "Fjalëkalimet nuk përputhen."), variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            business_name: businessName,
            phone,
            country,
            city,
          },
        },
      });
      if (error) throw error;
      await logAuthEvent(email, "register", { full_name: fullName, business_name: businessName });
      toast({
        title: t("register_success_title", "Regjistrimi u krye!"),
        description: t("register_success_msg", "Ju lutem kontrolloni email-in tuaj për të konfirmuar llogarinë."),
      });
      setFullName(""); setBusinessName(""); setEmail(""); setPhone("");
      setCountry(""); setCity(""); setPassword(""); setConfirmPassword("");
    } catch (err: any) {
      toast({ title: "Gabim", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:overflow-visible md:h-auto overflow-y-auto h-screen overscroll-none">
      <SiteHeader />

      <section className="flex-1 flex items-center justify-center py-16 md:py-24 bg-warm-gray">
        <div className="w-full max-w-2xl mx-auto px-4">
          <div className="bg-background border border-border p-6 md:p-12">
            <h1 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light text-center mb-2">
              {t("register_title", "Client Registration")}
            </h1>
            <p className="text-xs text-muted-foreground text-center tracking-brand mb-10">
              {t("register_subtitle", "CREATE YOUR ACCOUNT")}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs tracking-brand text-muted-foreground uppercase">{t("label_fullname", "Full Name")}</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10 h-11 border-border bg-background" placeholder={t("ph_fullname", "John Doe")} required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs tracking-brand text-muted-foreground uppercase">{t("label_business", "Business Name")}</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="pl-10 h-11 border-border bg-background" placeholder={t("ph_business", "Company LLC")} required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs tracking-brand text-muted-foreground uppercase">{t("login_email_label", "E-mail")}</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-11 border-border bg-background" placeholder={t("ph_email", "your@email.com")} required />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs tracking-brand text-muted-foreground uppercase">{t("label_phone", "Phone")}</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10 h-11 border-border bg-background" placeholder={t("ph_phone", "+355 69 123 4567")} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs tracking-brand text-muted-foreground uppercase">{t("label_country", "Country")}</label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                    <Select value={country} onValueChange={(v) => { setCountry(v); setCity(""); }}>
                      <SelectTrigger className="pl-10 h-11 border-border bg-background">
                        <SelectValue placeholder={t("ph_country", isAl ? "Zgjidhni shtetin" : "Select country")} />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {countries.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            <span className="flex items-center gap-2">
                              <span>{c.flag}</span>
                              <span>{isAl ? c.name_al : c.name_en}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs tracking-brand text-muted-foreground uppercase">{t("label_city", "City")}</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                    {cities.length > 0 ? (
                      <Select value={city} onValueChange={setCity}>
                        <SelectTrigger className="pl-10 h-11 border-border bg-background">
                          <SelectValue placeholder={t("ph_city", isAl ? "Zgjidhni qytetin" : "Select city")} />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {cities.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input value={city} onChange={(e) => setCity(e.target.value)} className="pl-10 h-11 border-border bg-background" placeholder={t("ph_city", isAl ? "Shkruani qytetin" : "Your city")} required />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs tracking-brand text-muted-foreground uppercase">{t("label_password", "Password")}</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-11 border-border bg-background" placeholder="••••••••" required minLength={6} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs tracking-brand text-muted-foreground uppercase">{t("label_confirm_password", "Confirm Password")}</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 h-11 border-border bg-background" placeholder="••••••••" required minLength={6} />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 text-xs tracking-wide-brand uppercase rounded" disabled={submitting}>
                {submitting ? t("register_loading", "Duke u regjistruar...") : t("register_button", "Create Account")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <SlugLink to="/login" className="text-xs text-muted-foreground hover:text-primary tracking-brand transition-colors">
                {t("register_login_link", "ALREADY HAVE AN ACCOUNT? LOGIN")}
              </SlugLink>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Register;
