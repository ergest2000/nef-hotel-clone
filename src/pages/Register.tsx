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

const COUNTRIES_CITIES: Record<string, string[]> = {
  "Albania": ["Tiranë", "Durrës", "Vlorë", "Shkodër", "Elbasan", "Korçë", "Fier", "Berat", "Lushnjë", "Pogradec", "Kavajë", "Gjirokastër", "Sarandë", "Lezhë", "Kukës", "Peshkopi", "Burrel", "Gramsh", "Përmet", "Tepelenë"],
  "Kosovo": ["Prishtinë", "Prizren", "Pejë", "Gjakovë", "Mitrovicë", "Ferizaj", "Gjilan", "Podujevë", "Vushtrri", "Suharekë"],
  "North Macedonia": ["Shkup", "Tetovë", "Kumanovë", "Manastir", "Ohër", "Prilep", "Gostivar", "Strugë", "Veles", "Shtip"],
  "Montenegro": ["Podgoricë", "Ulqin", "Tuz", "Bar", "Budvë", "Tivar", "Nikshiq", "Plav", "Guci", "Rozhajë"],
  "Italy": ["Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa", "Bologna", "Florence", "Bari", "Venice"],
  "Greece": ["Athens", "Thessaloniki", "Patras", "Heraklion", "Larissa", "Volos", "Ioannina", "Kavala", "Rhodes", "Corfu"],
  "Germany": ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart", "Düsseldorf", "Leipzig", "Dortmund", "Essen"],
  "Switzerland": ["Zürich", "Geneva", "Basel", "Bern", "Lausanne", "Winterthur", "Lucerne", "St. Gallen", "Lugano", "Biel"],
  "Austria": ["Vienna", "Graz", "Linz", "Salzburg", "Innsbruck", "Klagenfurt", "Villach", "Wels", "Sankt Pölten", "Dornbirn"],
  "Turkey": ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Adana", "Gaziantep", "Konya", "Mersin", "Kayseri"],
  "Other": [],
};

const Register = () => {
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const cities = country && country !== "Other" ? COUNTRIES_CITIES[country] || [] : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Gabim", description: "Fjalëkalimi duhet të ketë të paktën 6 karaktere.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Gabim", description: "Fjalëkalimet nuk përputhen.", variant: "destructive" });
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
      toast({
        title: "Regjistrimi u krye!",
        description: "Ju lutem kontrolloni email-in tuaj për të konfirmuar llogarinë.",
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
              Client Registration
            </h1>
            <p className="text-xs text-muted-foreground text-center tracking-brand mb-10">
              CREATE YOUR ACCOUNT
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs tracking-brand text-muted-foreground uppercase">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10 h-11 border-border bg-background" placeholder="John Doe" required />
                </div>
              </div>

              {/* Business Name */}
              <div className="space-y-1.5">
                <label className="text-xs tracking-brand text-muted-foreground uppercase">Business Name</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="pl-10 h-11 border-border bg-background" placeholder="Company LLC" required />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs tracking-brand text-muted-foreground uppercase">E-mail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-11 border-border bg-background" placeholder="your@email.com" required />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs tracking-brand text-muted-foreground uppercase">Phone</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10 h-11 border-border bg-background" placeholder="+355 69 123 4567" required />
                </div>
              </div>

              {/* Country & City */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs tracking-brand text-muted-foreground uppercase">Country</label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                    <Select value={country} onValueChange={(v) => { setCountry(v); setCity(""); }}>
                      <SelectTrigger className="pl-10 h-11 border-border bg-background">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(COUNTRIES_CITIES).map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs tracking-brand text-muted-foreground uppercase">City</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                    {cities.length > 0 ? (
                      <Select value={city} onValueChange={setCity}>
                        <SelectTrigger className="pl-10 h-11 border-border bg-background">
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input value={city} onChange={(e) => setCity(e.target.value)} className="pl-10 h-11 border-border bg-background" placeholder="Your city" required />
                    )}
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs tracking-brand text-muted-foreground uppercase">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-11 border-border bg-background" placeholder="••••••••" required minLength={6} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs tracking-brand text-muted-foreground uppercase">Confirm Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 h-11 border-border bg-background" placeholder="••••••••" required minLength={6} />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 text-xs tracking-wide-brand uppercase rounded" disabled={submitting}>
                {submitting ? "Duke u regjistruar..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <SlugLink to="/login" className="text-xs text-muted-foreground hover:text-primary tracking-brand transition-colors">
                ALREADY HAVE AN ACCOUNT? LOGIN
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
