import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Building2, User, Mail, Phone, MapPin, MessageSquare, Globe, Hash, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const iconMap: Record<string, React.ComponentType<any>> = {
  Building2, User, Mail, Phone, MapPin, MessageSquare, Globe, Hash, FileText,
};

interface RegField {
  id: string;
  field_key: string;
  label: string;
  field_type: string;
  placeholder: string;
  icon: string;
  required: boolean;
  visible: boolean;
  sort_order: number;
}

const Register = () => {
  const { toast } = useToast();
  const [form, setForm] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const { data: fields = [] } = useQuery({
    queryKey: ["registration_fields"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registration_fields")
        .select("*")
        .eq("visible", true)
        .order("sort_order");
      if (error) throw error;
      return data as RegField[];
    },
  });

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from("registrations").insert({ data: form });
      if (error) throw error;
      toast({ title: "Regjistrimi u dërgua!", description: "Do t'ju kontaktojmë së shpejti." });
      setForm({});
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
              B2B PARTNER APPLICATION
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {fields.map((field) => {
                const Icon = iconMap[field.icon] || Hash;
                if (field.field_type === "textarea") {
                  return (
                    <div key={field.id} className="space-y-1.5">
                      <label className="text-xs tracking-brand text-muted-foreground uppercase">{field.label}</label>
                      <div className="relative">
                        <Icon size={16} className="absolute left-3 top-3 text-muted-foreground" />
                        <Textarea
                          value={form[field.field_key] || ""}
                          onChange={(e) => update(field.field_key, e.target.value)}
                          className="pl-10 min-h-[100px] border-border bg-background"
                          placeholder={field.placeholder}
                          required={field.required}
                        />
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={field.id} className="space-y-1.5">
                    <label className="text-xs tracking-brand text-muted-foreground uppercase">{field.label}</label>
                    <div className="relative">
                      <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type={field.field_type}
                        value={form[field.field_key] || ""}
                        onChange={(e) => update(field.field_key, e.target.value)}
                        className="pl-10 h-11 border-border bg-background"
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                    </div>
                  </div>
                );
              })}

              <Button type="submit" className="w-full h-11 text-xs tracking-wide-brand uppercase" disabled={submitting}>
                {submitting ? "Duke dërguar..." : "Submit Registration"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-xs text-muted-foreground hover:text-primary tracking-brand transition-colors">
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
