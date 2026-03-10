import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash && hash.includes("type=recovery")) {
      setReady(true);
    } else {
      // Also listen for PASSWORD_RECOVERY event
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          setReady(true);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

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
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Gabim", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Sukses!", description: "Fjalëkalimi u ndryshua me sukses." });
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:overflow-visible md:h-auto overflow-y-auto h-screen overscroll-none">
      <SiteHeader />

      <section className="flex-1 flex items-center justify-center py-16 md:py-24 bg-warm-gray">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="bg-background border border-border p-8 md:p-10">
            <h1 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light text-center mb-2">
              New Password
            </h1>
            <p className="text-xs text-muted-foreground text-center tracking-brand mb-10">
              SET YOUR NEW PASSWORD
            </p>

            {!ready ? (
              <p className="text-sm text-muted-foreground text-center">
                Duke verifikuar linkun... Ju lutem prisni.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs tracking-brand text-muted-foreground uppercase">New Password</label>
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

                <Button type="submit" disabled={loading} className="w-full h-11 text-xs tracking-wide-brand uppercase rounded">
                  {loading ? "Duke ndryshuar..." : "Update Password"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default ResetPassword;
