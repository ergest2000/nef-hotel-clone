import { useState } from "react";
import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate with auth
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:overflow-visible md:h-auto overflow-y-auto h-screen overscroll-none">
      <SiteHeader />

      <section className="flex-1 flex items-center justify-center py-16 md:py-24 bg-warm-gray">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="bg-background border border-border p-8 md:p-10">
            <h1 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light text-center mb-2">
              Account Login
            </h1>
            <p className="text-xs text-muted-foreground text-center tracking-brand mb-10">
              ALREADY CUSTOMER
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs tracking-brand text-muted-foreground uppercase">
                  E-mail
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 border-border bg-background"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs tracking-brand text-muted-foreground uppercase">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 border-border bg-background"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 text-xs tracking-wide-brand uppercase"
              >
                Login
              </Button>
            </form>

            <div className="mt-6 flex flex-col items-center gap-3">
              <Link
                to="#"
                className="text-xs text-muted-foreground hover:text-primary tracking-brand transition-colors"
              >
                FORGOT MY PASSWORD
              </Link>
              <div className="w-12 h-px bg-border" />
              <Link
                to="/register"
                className="text-xs text-primary hover:text-primary/80 tracking-brand transition-colors"
              >
                REGISTER AS A NEW CLIENT
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Login;
