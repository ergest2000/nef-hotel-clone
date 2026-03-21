import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SlugLink from "@/components/SlugLink";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useAuthTexts, logAuthEvent } from "@/hooks/useAuthTexts";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useAuthTexts();

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPassword = password.trim();

    if (!isValidEmail(normalizedEmail)) {
      toast({
        title: "Gabim",
        description: t("login_invalid_email", "Ju lutem vendosni një email të vlefshëm."),
        variant: "destructive",
      });
      return;
    }

    if (normalizedPassword.length < 6) {
      toast({
        title: "Gabim",
        description: t("login_invalid_password", "Fjalëkalimi duhet të ketë të paktën 6 karaktere."),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error, role } = await signIn(normalizedEmail, normalizedPassword);
    setLoading(false);

    if (error) {
      const message = error.message.toLowerCase().includes("invalid login credentials")
        ? t("login_invalid_credentials", "Email ose fjalëkalim i pasaktë.")
        : error.message;

      toast({ title: "Gabim", description: message, variant: "destructive" });
    } else {
      await logAuthEvent(normalizedEmail, "login");
      const redirectPath = ["admin", "manager", "editor"].includes(role) ? "/admin" : "/";
      toast({ title: "Sukses", description: t("login_success", "U identifikuat me sukses!") });
      setTimeout(() => navigate(redirectPath), 500);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setForgotLoading(false);
    if (error) {
      toast({ title: "Gabim", description: error.message, variant: "destructive" });
    } else {
      await logAuthEvent(forgotEmail, "password_reset_request");
      toast({
        title: "Email u dërgua!",
        description: t("forgot_success", "Kontrolloni email-in tuaj për linkun e rivendosjes së fjalëkalimit."),
      });
      setForgotMode(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:overflow-visible md:h-auto overflow-y-auto h-screen overscroll-none">
      <SiteHeader />

      <section className="flex-1 flex items-center justify-center py-16 md:py-24 bg-warm-gray">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="bg-background border border-border p-8 md:p-10">
            {!forgotMode ? (
              <>
                <h1 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light text-center mb-2">
                  {t("login_title", "Account Login")}
                </h1>
                <p className="text-xs text-muted-foreground text-center tracking-brand mb-10">
                  {t("login_subtitle", "ADMIN / CLIENT ACCESS")}
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs tracking-brand text-muted-foreground uppercase">{t("login_email_label", "E-mail")}</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                       <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-11 border-border bg-background" placeholder={t("ph_email", "your@email.com")} autoComplete="email" required />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs tracking-brand text-muted-foreground uppercase">{t("login_password_label", "Password")}</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                       <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-11 border-border bg-background" placeholder="••••••••" autoComplete="current-password" required />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full h-11 text-xs tracking-wide-brand uppercase rounded">
                    {loading ? t("login_loading", "Duke u identifikuar...") : t("login_button", "Login")}
                  </Button>
                </form>

                <div className="mt-6 flex flex-col items-center gap-3">
                  <button
                    onClick={() => setForgotMode(true)}
                    className="text-xs text-muted-foreground hover:text-primary tracking-brand transition-colors uppercase"
                  >
                    {t("login_forgot_link", "FORGOT MY PASSWORD")}
                  </button>
                  <div className="w-12 h-px bg-border" />
                  <SlugLink to="/register" className="text-xs text-primary hover:text-primary/80 tracking-brand transition-colors">
                    {t("login_register_link", "REGISTER AS A NEW CLIENT")}
                  </SlugLink>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light text-center mb-2">
                  {t("forgot_title", "Reset Password")}
                </h1>
                <p className="text-xs text-muted-foreground text-center tracking-brand mb-10">
                  {t("forgot_subtitle", "ENTER YOUR EMAIL TO RECEIVE A RESET LINK")}
                </p>

                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs tracking-brand text-muted-foreground uppercase">{t("login_email_label", "E-mail")}</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="pl-10 h-11 border-border bg-background" placeholder={t("ph_email", "your@email.com")} required />
                    </div>
                  </div>

                  <Button type="submit" disabled={forgotLoading} className="w-full h-11 text-xs tracking-wide-brand uppercase rounded">
                    {forgotLoading ? "Duke dërguar..." : t("forgot_button", "Send Reset Link")}
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setForgotMode(false)}
                    className="text-xs text-muted-foreground hover:text-primary tracking-brand transition-colors uppercase"
                  >
                    {t("forgot_back_link", "← BACK TO LOGIN")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Login;
