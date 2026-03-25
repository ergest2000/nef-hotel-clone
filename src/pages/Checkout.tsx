import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useDesign } from "@/hooks/useDesignSettings";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logAuthEvent } from "@/hooks/useAuthTexts";
import { ShoppingBag } from "lucide-react";

const Checkout = () => {
  const { items } = useCart();
  const { user, signIn } = useAuth();
  const { isAl } = useLanguage();
  const { settings } = useDesign();
  const { toast } = useToast();
  const navigate = useNavigate();

  const t = (key: string, fallbackAl: string, fallbackEn: string) => {
    const alKey = `${key}_al`;
    const enKey = `${key}_en`;
    return isAl ? (settings[alKey] || fallbackAl) : (settings[enKey] || fallbackEn);
  };

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // New client form
  const [newName, setNewName] = useState("");
  const [newProperty, setNewProperty] = useState("");
  const [newHotel, setNewHotel] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const { error } = await signIn(loginEmail.trim().toLowerCase(), loginPassword.trim());
    setLoginLoading(false);
    if (error) {
      toast({ title: "Gabim", description: t("checkout_login_error", "Email ose fjalëkalim i pasaktë.", "Invalid email or password."), variant: "destructive" });
    } else {
      await logAuthEvent(loginEmail, "login");
      toast({ title: "Sukses", description: t("checkout_login_success", "U identifikuat me sukses!", "Logged in successfully!") });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: newEmail.trim().toLowerCase(),
      password: newPassword,
      options: {
        data: {
          full_name: newName,
          business_name: newHotel,
          phone: newPhone,
          city: newCity,
          country: "",
        },
        emailRedirectTo: window.location.origin,
      },
    });
    setRegisterLoading(false);
    if (error) {
      toast({ title: "Gabim", description: error.message, variant: "destructive" });
    } else {
      await logAuthEvent(newEmail, "register");
      toast({ title: "Sukses", description: t("checkout_register_success", "Kërkesa u dërgua! Kontrolloni email-in.", "Request sent! Check your email.") });
    }
  };

  const handleRequestQuote = async () => {
    if (!user) return;
    setRequestLoading(true);
    try {
      await supabase.from("registrations").insert({
        data: {
          type: "offer_request",
          source: "checkout",
          email: user.email,
          fullName: user.user_metadata?.full_name || user.email,
          items: items.map((item) => ({
            title: item.title || item.title_al || item.title_en || "",
            code: item.code || "",
            color: item.color || "",
            quantity: item.quantity || 0,
            boxes: item.boxes || 0,
            pieces: (item.pieces || 0) * (item.boxes || 0),
          })),
        },
      });
      toast({ title: "Sukses", description: t("checkout_request_sent", "Kërkesa u dërgua!", "Request sent!") });
    } catch {
      toast({ title: "Gabim", variant: "destructive" });
    }
    setRequestLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 flex-1 w-full">
        <h1 className="text-2xl md:text-3xl font-bold tracking-wide-brand text-foreground mb-8">
          {t("checkout_title", "PËRFUNDIMI I BLERJES", "CHECKOUT")}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Auth forms */}
          <div className="lg:col-span-2">
            {user ? (
              <div className="bg-muted/30 border border-border p-6">
                <p className="text-sm text-foreground">
                  {t("checkout_logged_as", "Jeni identifikuar si", "Logged in as")} <strong>{user.email}</strong>
                </p>
                <Button
                  className="mt-4 h-12 px-8 text-xs tracking-wider uppercase rounded-none"
                  disabled={requestLoading}
                  onClick={handleRequestQuote}
                >
                  {requestLoading ? "..." : t("checkout_request_quote", "KËRKO NJË OFERTË", "REQUEST A QUOTE")}
                </Button>
              </div>
            ) : (
              <>
                <div className="bg-muted/60 px-6 py-3 mb-0">
                  <h2 className="text-lg text-background font-medium" style={{ color: "white" }}>
                    {t("checkout_auth_header", "Kyçu ose Regjistrohu", "Log in or Register")}
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 border border-border border-t-0">
                  {/* Existing client - Login */}
                  <div className="p-6 md:border-r border-border">
                    <h3 className="font-semibold text-foreground mb-1">{t("checkout_existing_client", "Unë jam tashmë një klient.", "I am already a client.")}</h3>
                    <form onSubmit={handleLogin} className="mt-6 space-y-5">
                      <div>
                        <label className="text-xs tracking-wider text-muted-foreground uppercase">E-MAIL</label>
                        <Input value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="border-0 border-b border-border rounded-none px-0 h-10 focus-visible:ring-0" placeholder="" type="email" required />
                      </div>
                      <div>
                        <label className="text-xs tracking-wider text-muted-foreground uppercase">{t("checkout_password", "KODI", "PASSWORD")}</label>
                        <Input value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="border-0 border-b border-border rounded-none px-0 h-10 focus-visible:ring-0" type="password" required />
                        <div className="text-right mt-1">
                          <Link to="/reset-password" className="text-[10px] tracking-wider text-muted-foreground hover:text-foreground uppercase">
                            {t("checkout_forgot_pw", "E KAM HARRUAR FJALËKALIMIN TIM", "I FORGOT MY PASSWORD")}
                          </Link>
                        </div>
                      </div>
                      <Button type="submit" disabled={loginLoading} className="h-12 px-10 text-xs tracking-wider uppercase rounded-none bg-foreground/80 hover:bg-foreground text-background">
                        {loginLoading ? "..." : t("checkout_login_btn", "HYRJE", "LOGIN")}
                      </Button>
                    </form>
                  </div>

                  {/* New client - Register */}
                  <div className="p-6">
                    <h3 className="font-semibold text-foreground mb-1">{t("checkout_new_client", "Unë jam një klient i ri.", "I am a new client.")}</h3>
                    <p className="text-sm text-muted-foreground">{t("checkout_new_desc", "dhe dua të dërgoj një kërkesë për kuotim", "and want to send a quote request")}</p>
                    <form onSubmit={handleRegister} className="mt-6 space-y-4">
                      <div>
                        <label className="text-xs tracking-wider text-muted-foreground uppercase">{t("checkout_fullname", "EMRI I PLOTË", "FULL NAME")}</label>
                        <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="border-0 border-b border-border rounded-none px-0 h-10 focus-visible:ring-0" required />
                      </div>
                      <div>
                        <label className="text-xs tracking-wider text-muted-foreground uppercase">{t("checkout_profession", "PROFESIONI", "PROFESSION")}</label>
                        <Input value={newProperty} onChange={(e) => setNewProperty(e.target.value)} className="border-0 border-b border-border rounded-none px-0 h-10 focus-visible:ring-0" />
                      </div>
                      <div>
                        <label className="text-xs tracking-wider text-muted-foreground uppercase">{t("checkout_business", "EMRI I BIZNESIT", "BUSINESS NAME")}</label>
                        <Input value={newHotel} onChange={(e) => setNewHotel(e.target.value)} className="border-0 border-b border-border rounded-none px-0 h-10 focus-visible:ring-0" />
                      </div>
                      <div>
                        <label className="text-xs tracking-wider text-muted-foreground uppercase">{t("checkout_city", "QYTETI", "CITY")}</label>
                        <Input value={newCity} onChange={(e) => setNewCity(e.target.value)} className="border-0 border-b border-border rounded-none px-0 h-10 focus-visible:ring-0" />
                      </div>
                      <div>
                        <label className="text-xs tracking-wider text-muted-foreground uppercase">{t("checkout_phone", "TELEFONI", "PHONE")}</label>
                        <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="border-0 border-b border-border rounded-none px-0 h-10 focus-visible:ring-0" />
                      </div>
                      <div>
                        <label className="text-xs tracking-wider text-muted-foreground uppercase">E-MAIL</label>
                        <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="border-0 border-b border-border rounded-none px-0 h-10 focus-visible:ring-0" type="email" required />
                      </div>
                      <div>
                        <label className="text-xs tracking-wider text-muted-foreground uppercase">{t("checkout_pw", "FJALËKALIMI", "PASSWORD")}</label>
                        <Input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="border-0 border-b border-border rounded-none px-0 h-10 focus-visible:ring-0" type="password" required />
                      </div>
                      <Button type="submit" disabled={registerLoading} className="h-12 px-10 text-xs tracking-wider uppercase rounded-none bg-foreground/80 hover:bg-foreground text-background">
                        {registerLoading ? "..." : t("checkout_register_btn", "REGJISTROHU", "REGISTER")}
                      </Button>
                    </form>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: Cart summary */}
          <div className="lg:col-span-1">
            <div className="border border-border p-6">
              <h2 className="text-lg font-bold tracking-wide-brand text-foreground mb-4">
                {t("checkout_cart_title", "SHPORTË IME", "MY CART")}
              </h2>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("checkout_cart_empty", "Shporta bosh", "Cart empty")}</p>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.productId + item.color} className="flex gap-3">
                      <div className="w-20 h-20 bg-muted overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="h-6 w-6 text-muted-foreground/20" /></div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground line-clamp-2">{item.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t("checkout_color", "NGJYRA", "COLOR")}: {item.color}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("checkout_boxes", "KUTITË", "BOXES")}: {item.boxes}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("checkout_pieces", "COPË", "PIECES")}: {item.pieces * item.boxes}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6 pt-4 border-t border-border">
                <Link to="/shporta" className="flex items-center gap-2 text-xs tracking-wider uppercase text-foreground hover:text-primary transition-colors font-medium">
                  {t("checkout_view_cart", "SHIKO SHPORTËN", "VIEW CART")} <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
};

export default Checkout;
