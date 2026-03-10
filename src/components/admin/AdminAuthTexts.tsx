import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TextDef {
  key: string;
  label: string;
  group: string;
  type: string;
  default_al: string;
  default_en: string;
}

const textDefinitions: TextDef[] = [
  // Login
  { key: "login_title", label: "Login – Titulli", group: "login", type: "text", default_al: "Hyrje në Llogari", default_en: "Account Login" },
  { key: "login_subtitle", label: "Login – Nëntitulli", group: "login", type: "text", default_al: "ADMIN / AKSES KLIENTI", default_en: "ADMIN / CLIENT ACCESS" },
  { key: "login_email_label", label: "Login – Label Email", group: "login", type: "text", default_al: "E-mail", default_en: "E-mail" },
  { key: "login_email_placeholder", label: "Login – Placeholder Email", group: "login", type: "text", default_al: "email@juaj.com", default_en: "your@email.com" },
  { key: "login_password_label", label: "Login – Label Password", group: "login", type: "text", default_al: "Fjalëkalimi", default_en: "Password" },
  { key: "login_button", label: "Login – Button", group: "login", type: "text", default_al: "Hyr", default_en: "Login" },
  { key: "login_loading", label: "Login – Loading Text", group: "login", type: "text", default_al: "Duke u identifikuar...", default_en: "Logging in..." },
  { key: "login_success", label: "Login – Mesazhi i suksesit", group: "login", type: "text", default_al: "U identifikuat me sukses!", default_en: "Successfully logged in!" },
  { key: "login_forgot_link", label: "Login – Forgot Link", group: "login", type: "text", default_al: "KAM HARRUAR FJALËKALIMIN", default_en: "FORGOT MY PASSWORD" },
  { key: "login_register_link", label: "Login – Register Link", group: "login", type: "text", default_al: "REGJISTROHU SI KLIENT I RI", default_en: "REGISTER AS A NEW CLIENT" },
  // Forgot Password
  { key: "forgot_title", label: "Forgot – Titulli", group: "forgot", type: "text", default_al: "Rivendos Fjalëkalimin", default_en: "Reset Password" },
  { key: "forgot_subtitle", label: "Forgot – Nëntitulli", group: "forgot", type: "text", default_al: "VENDOSNI EMAIL-IN PËR TË MARRË LINKUN", default_en: "ENTER YOUR EMAIL TO RECEIVE A RESET LINK" },
  { key: "forgot_button", label: "Forgot – Button", group: "forgot", type: "text", default_al: "Dërgo Linkun", default_en: "Send Reset Link" },
  { key: "forgot_success", label: "Forgot – Mesazhi suksesit", group: "forgot", type: "text", default_al: "Kontrolloni email-in tuaj për linkun e rivendosjes së fjalëkalimit.", default_en: "Check your email for the password reset link." },
  { key: "forgot_back_link", label: "Forgot – Back Link", group: "forgot", type: "text", default_al: "← KTHEHU NË LOGIN", default_en: "← BACK TO LOGIN" },
  // Register
  { key: "register_title", label: "Register – Titulli", group: "register", type: "text", default_al: "Regjistrimi i Klientit", default_en: "Client Registration" },
  { key: "register_subtitle", label: "Register – Nëntitulli", group: "register", type: "text", default_al: "KRIJO LLOGARINË TËNDE", default_en: "CREATE YOUR ACCOUNT" },
  { key: "register_button", label: "Register – Button", group: "register", type: "text", default_al: "Krijo Llogarinë", default_en: "Create Account" },
  { key: "register_loading", label: "Register – Loading Text", group: "register", type: "text", default_al: "Duke u regjistruar...", default_en: "Registering..." },
  { key: "register_success_title", label: "Register – Sukses Titulli", group: "register", type: "text", default_al: "Regjistrimi u krye!", default_en: "Registration Complete!" },
  { key: "register_success_msg", label: "Register – Sukses Mesazhi", group: "register", type: "textarea", default_al: "Ju lutem kontrolloni email-in tuaj për të konfirmuar llogarinë.", default_en: "Please check your email to confirm your account." },
  { key: "register_login_link", label: "Register – Login Link", group: "register", type: "text", default_al: "KENI NJË LLOGARI? HYNI", default_en: "ALREADY HAVE AN ACCOUNT? LOGIN" },
  { key: "register_password_error", label: "Register – Password Error", group: "register", type: "text", default_al: "Fjalëkalimi duhet të ketë të paktën 6 karaktere.", default_en: "Password must be at least 6 characters." },
  { key: "register_password_mismatch", label: "Register – Password Mismatch", group: "register", type: "text", default_al: "Fjalëkalimet nuk përputhen.", default_en: "Passwords do not match." },
  // Reset Password
  { key: "reset_title", label: "Reset – Titulli", group: "reset", type: "text", default_al: "Fjalëkalim i Ri", default_en: "New Password" },
  { key: "reset_subtitle", label: "Reset – Nëntitulli", group: "reset", type: "text", default_al: "VENDOSNI FJALËKALIMIN E RI", default_en: "SET YOUR NEW PASSWORD" },
  { key: "reset_button", label: "Reset – Button", group: "reset", type: "text", default_al: "Ndrysho Fjalëkalimin", default_en: "Update Password" },
  { key: "reset_success", label: "Reset – Sukses Mesazhi", group: "reset", type: "text", default_al: "Fjalëkalimi u ndryshua me sukses.", default_en: "Password updated successfully." },
  { key: "reset_verifying", label: "Reset – Verifying Text", group: "reset", type: "text", default_al: "Duke verifikuar linkun... Ju lutem prisni.", default_en: "Verifying link... Please wait." },
  // Field Labels
  { key: "label_fullname", label: "Label – Full Name", group: "labels", type: "text", default_al: "Emri i Plotë", default_en: "Full Name" },
  { key: "label_business", label: "Label – Business Name", group: "labels", type: "text", default_al: "Emri i Biznesit", default_en: "Business Name" },
  { key: "label_phone", label: "Label – Phone", group: "labels", type: "text", default_al: "Telefon", default_en: "Phone" },
  { key: "label_country", label: "Label – Country", group: "labels", type: "text", default_al: "Shteti", default_en: "Country" },
  { key: "label_city", label: "Label – City", group: "labels", type: "text", default_al: "Qyteti", default_en: "City" },
  { key: "label_password", label: "Label – Password", group: "labels", type: "text", default_al: "Fjalëkalimi", default_en: "Password" },
  { key: "label_confirm_password", label: "Label – Confirm Password", group: "labels", type: "text", default_al: "Konfirmo Fjalëkalimin", default_en: "Confirm Password" },
  { key: "label_new_password", label: "Label – New Password", group: "labels", type: "text", default_al: "Fjalëkalimi i Ri", default_en: "New Password" },
  // Placeholders
  { key: "ph_fullname", label: "Placeholder – Full Name", group: "placeholders", type: "text", default_al: "Emri Mbiemri", default_en: "John Doe" },
  { key: "ph_business", label: "Placeholder – Business", group: "placeholders", type: "text", default_al: "Kompania SH.P.K.", default_en: "Company LLC" },
  { key: "ph_email", label: "Placeholder – Email", group: "placeholders", type: "text", default_al: "email@juaj.com", default_en: "your@email.com" },
  { key: "ph_phone", label: "Placeholder – Phone", group: "placeholders", type: "text", default_al: "+355 69 123 4567", default_en: "+355 69 123 4567" },
  { key: "ph_country", label: "Placeholder – Country", group: "placeholders", type: "text", default_al: "Zgjidhni shtetin", default_en: "Select country" },
  { key: "ph_city", label: "Placeholder – City", group: "placeholders", type: "text", default_al: "Qyteti juaj", default_en: "Your city" },
];

const groupLabels: Record<string, string> = {
  login: "Login Page",
  forgot: "Forgot Password",
  register: "Register Page",
  reset: "Reset Password",
  labels: "Field Labels",
  placeholders: "Placeholders",
};

const groupOrder = ["login", "forgot", "register", "reset", "labels", "placeholders"];

interface DbRow {
  id: string;
  setting_key: string;
  setting_value: string;
}

export const AdminAuthTexts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [edits, setEdits] = useState<Record<string, string>>({});

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["auth-texts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("design_settings")
        .select("*")
        .or(
          "setting_key.like.login_%,setting_key.like.forgot_%,setting_key.like.register_%,setting_key.like.reset_%,setting_key.like.label_%,setting_key.like.ph_%"
        );
      if (error) throw error;
      return data as DbRow[];
    },
  });

  const dbMap = new Map(rows.map((r) => [r.setting_key, r.setting_value]));

  const getValue = (key: string, lang: "al" | "en", def: TextDef) => {
    const fullKey = `${key}_${lang}`;
    if (edits[fullKey] !== undefined) return edits[fullKey];
    if (dbMap.has(fullKey)) return dbMap.get(fullKey)!;
    // Fallback: old non-suffixed key for backwards compat
    if (lang === "al" && dbMap.has(key)) return dbMap.get(key)!;
    return lang === "al" ? def.default_al : def.default_en;
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const items: { setting_key: string; setting_value: string; label: string; setting_group: string; setting_type: string }[] = [];
      for (const def of textDefinitions) {
        for (const lang of ["al", "en"] as const) {
          items.push({
            setting_key: `${def.key}_${lang}`,
            setting_value: getValue(def.key, lang, def),
            label: `${def.label} (${lang.toUpperCase()})`,
            setting_group: def.group,
            setting_type: def.type,
          });
        }
      }
      for (const item of items) {
        const { error } = await supabase
          .from("design_settings")
          .upsert(item, { onConflict: "setting_key" });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-texts"] });
      queryClient.invalidateQueries({ queryKey: ["auth-texts-live"] });
      queryClient.invalidateQueries({ queryKey: ["design-settings"] });
      setEdits({});
      toast({ title: "Tekstet u ruajtën!" });
    },
    onError: (e: Error) => {
      toast({ title: "Gabim", description: e.message, variant: "destructive" });
    },
  });

  const handleReset = () => setEdits({});
  const hasChanges = Object.keys(edits).length > 0;

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Auth Form Texts (AL / EN)</h2>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" /> Reset
            </Button>
          )}
          <Button size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-2" /> Ruaj të gjitha
          </Button>
        </div>
      </div>

      {groupOrder.map((group) => {
        const items = textDefinitions.filter((d) => d.group === group);
        if (!items.length) return null;
        return (
          <div key={group} className="bg-background border border-border rounded-lg p-5 space-y-4">
            <h3 className="text-sm font-medium text-foreground uppercase tracking-wide">{groupLabels[group]}</h3>
            <div className="space-y-4">
              {items.map((def) => {
                const InputComp = def.type === "textarea" ? Textarea : Input;
                return (
                  <div key={def.key} className="space-y-1.5">
                    <label className="text-xs text-muted-foreground font-medium">{def.label}</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">🇦🇱 Shqip</span>
                        <InputComp
                          value={getValue(def.key, "al", def)}
                          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                            setEdits((p) => ({ ...p, [`${def.key}_al`]: e.target.value }))
                          }
                          className="text-sm"
                          {...(def.type === "textarea" ? { rows: 3 } : {})}
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">🇬🇧 English</span>
                        <InputComp
                          value={getValue(def.key, "en", def)}
                          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                            setEdits((p) => ({ ...p, [`${def.key}_en`]: e.target.value }))
                          }
                          className="text-sm"
                          {...(def.type === "textarea" ? { rows: 3 } : {})}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
