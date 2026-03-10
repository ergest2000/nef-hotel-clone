import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthText {
  id: string;
  setting_key: string;
  setting_value: string;
  label: string;
  setting_group: string;
  setting_type: string;
}

const defaultTexts: Omit<AuthText, "id">[] = [
  // Login
  { setting_key: "login_title", setting_value: "Account Login", label: "Login – Titulli", setting_group: "login", setting_type: "text" },
  { setting_key: "login_subtitle", setting_value: "ADMIN / CLIENT ACCESS", label: "Login – Nëntitulli", setting_group: "login", setting_type: "text" },
  { setting_key: "login_email_label", setting_value: "E-mail", label: "Login – Label Email", setting_group: "login", setting_type: "text" },
  { setting_key: "login_email_placeholder", setting_value: "your@email.com", label: "Login – Placeholder Email", setting_group: "login", setting_type: "text" },
  { setting_key: "login_password_label", setting_value: "Password", label: "Login – Label Password", setting_group: "login", setting_type: "text" },
  { setting_key: "login_button", setting_value: "Login", label: "Login – Button", setting_group: "login", setting_type: "text" },
  { setting_key: "login_loading", setting_value: "Duke u identifikuar...", label: "Login – Loading Text", setting_group: "login", setting_type: "text" },
  { setting_key: "login_success", setting_value: "U identifikuat me sukses!", label: "Login – Mesazhi i suksesit", setting_group: "login", setting_type: "text" },
  { setting_key: "login_forgot_link", setting_value: "FORGOT MY PASSWORD", label: "Login – Forgot Link", setting_group: "login", setting_type: "text" },
  { setting_key: "login_register_link", setting_value: "REGISTER AS A NEW CLIENT", label: "Login – Register Link", setting_group: "login", setting_type: "text" },
  // Forgot Password
  { setting_key: "forgot_title", setting_value: "Reset Password", label: "Forgot – Titulli", setting_group: "forgot", setting_type: "text" },
  { setting_key: "forgot_subtitle", setting_value: "ENTER YOUR EMAIL TO RECEIVE A RESET LINK", label: "Forgot – Nëntitulli", setting_group: "forgot", setting_type: "text" },
  { setting_key: "forgot_button", setting_value: "Send Reset Link", label: "Forgot – Button", setting_group: "forgot", setting_type: "text" },
  { setting_key: "forgot_success", setting_value: "Kontrolloni email-in tuaj për linkun e rivendosjes së fjalëkalimit.", label: "Forgot – Mesazhi suksesit", setting_group: "forgot", setting_type: "text" },
  { setting_key: "forgot_back_link", setting_value: "← BACK TO LOGIN", label: "Forgot – Back Link", setting_group: "forgot", setting_type: "text" },
  // Register
  { setting_key: "register_title", setting_value: "Client Registration", label: "Register – Titulli", setting_group: "register", setting_type: "text" },
  { setting_key: "register_subtitle", setting_value: "CREATE YOUR ACCOUNT", label: "Register – Nëntitulli", setting_group: "register", setting_type: "text" },
  { setting_key: "register_button", setting_value: "Create Account", label: "Register – Button", setting_group: "register", setting_type: "text" },
  { setting_key: "register_loading", setting_value: "Duke u regjistruar...", label: "Register – Loading Text", setting_group: "register", setting_type: "text" },
  { setting_key: "register_success_title", setting_value: "Regjistrimi u krye!", label: "Register – Sukses Titulli", setting_group: "register", setting_type: "text" },
  { setting_key: "register_success_msg", setting_value: "Ju lutem kontrolloni email-in tuaj për të konfirmuar llogarinë.", label: "Register – Sukses Mesazhi", setting_group: "register", setting_type: "textarea" },
  { setting_key: "register_login_link", setting_value: "ALREADY HAVE AN ACCOUNT? LOGIN", label: "Register – Login Link", setting_group: "register", setting_type: "text" },
  { setting_key: "register_password_error", setting_value: "Fjalëkalimi duhet të ketë të paktën 6 karaktere.", label: "Register – Password Error", setting_group: "register", setting_type: "text" },
  { setting_key: "register_password_mismatch", setting_value: "Fjalëkalimet nuk përputhen.", label: "Register – Password Mismatch", setting_group: "register", setting_type: "text" },
  // Reset Password
  { setting_key: "reset_title", setting_value: "New Password", label: "Reset – Titulli", setting_group: "reset", setting_type: "text" },
  { setting_key: "reset_subtitle", setting_value: "SET YOUR NEW PASSWORD", label: "Reset – Nëntitulli", setting_group: "reset", setting_type: "text" },
  { setting_key: "reset_button", setting_value: "Update Password", label: "Reset – Button", setting_group: "reset", setting_type: "text" },
  { setting_key: "reset_success", setting_value: "Fjalëkalimi u ndryshua me sukses.", label: "Reset – Sukses Mesazhi", setting_group: "reset", setting_type: "text" },
  // Field Labels
  { setting_key: "label_fullname", setting_value: "Full Name", label: "Label – Full Name", setting_group: "labels", setting_type: "text" },
  { setting_key: "label_business", setting_value: "Business Name", label: "Label – Business Name", setting_group: "labels", setting_type: "text" },
  { setting_key: "label_phone", setting_value: "Phone", label: "Label – Phone", setting_group: "labels", setting_type: "text" },
  { setting_key: "label_country", setting_value: "Country", label: "Label – Country", setting_group: "labels", setting_type: "text" },
  { setting_key: "label_city", setting_value: "City", label: "Label – City", setting_group: "labels", setting_type: "text" },
  { setting_key: "label_password", setting_value: "Password", label: "Label – Password", setting_group: "labels", setting_type: "text" },
  { setting_key: "label_confirm_password", setting_value: "Confirm Password", label: "Label – Confirm Password", setting_group: "labels", setting_type: "text" },
  { setting_key: "label_new_password", setting_value: "New Password", label: "Label – New Password", setting_group: "labels", setting_type: "text" },
  // Placeholders
  { setting_key: "ph_fullname", setting_value: "John Doe", label: "Placeholder – Full Name", setting_group: "placeholders", setting_type: "text" },
  { setting_key: "ph_business", setting_value: "Company LLC", label: "Placeholder – Business", setting_group: "placeholders", setting_type: "text" },
  { setting_key: "ph_email", setting_value: "your@email.com", label: "Placeholder – Email", setting_group: "placeholders", setting_type: "text" },
  { setting_key: "ph_phone", setting_value: "+355 69 123 4567", label: "Placeholder – Phone", setting_group: "placeholders", setting_type: "text" },
  { setting_key: "ph_country", setting_value: "Select country", label: "Placeholder – Country", setting_group: "placeholders", setting_type: "text" },
  { setting_key: "ph_city", setting_value: "Your city", label: "Placeholder – City", setting_group: "placeholders", setting_type: "text" },
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

export const AdminAuthTexts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [edits, setEdits] = useState<Record<string, string>>({});

  const { data: texts = [], isLoading } = useQuery({
    queryKey: ["auth-texts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("design_settings")
        .select("*")
        .like("setting_key", "login_%")
        .or("setting_key.like.forgot_%,setting_key.like.register_%,setting_key.like.reset_%,setting_key.like.label_%,setting_key.like.ph_%");
      if (error) throw error;
      return data as AuthText[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (items: { setting_key: string; setting_value: string; label: string; setting_group: string; setting_type: string }[]) => {
      for (const item of items) {
        const { error } = await supabase
          .from("design_settings")
          .upsert(
            {
              setting_key: item.setting_key,
              setting_value: item.setting_value,
              label: item.label,
              setting_group: item.setting_group,
              setting_type: item.setting_type,
            },
            { onConflict: "setting_key" }
          );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth-texts"] });
      queryClient.invalidateQueries({ queryKey: ["design-settings"] });
      setEdits({});
      toast({ title: "Tekstet u ruajtën!" });
    },
    onError: (e: Error) => {
      toast({ title: "Gabim", description: e.message, variant: "destructive" });
    },
  });

  // Merge defaults with DB values
  const merged = defaultTexts.map((dt) => {
    const db = texts.find((t) => t.setting_key === dt.setting_key);
    return {
      ...dt,
      id: db?.id || "",
      setting_value: edits[dt.setting_key] !== undefined ? edits[dt.setting_key] : (db?.setting_value ?? dt.setting_value),
    };
  });

  const handleSaveAll = () => {
    const toSave = merged.map((m) => ({
      setting_key: m.setting_key,
      setting_value: m.setting_value,
      label: m.label,
      setting_group: m.setting_group,
      setting_type: m.setting_type,
    }));
    saveMutation.mutate(toSave);
  };

  const handleReset = () => {
    setEdits({});
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  const hasChanges = Object.keys(edits).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Auth Form Texts</h2>
        <div className="flex gap-2">
          {hasChanges && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" /> Reset
            </Button>
          )}
          <Button size="sm" onClick={handleSaveAll} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-2" /> Ruaj të gjitha
          </Button>
        </div>
      </div>

      {groupOrder.map((group) => {
        const items = merged.filter((m) => m.setting_group === group);
        if (!items.length) return null;
        return (
          <div key={group} className="bg-background border border-border rounded-lg p-5 space-y-4">
            <h3 className="text-sm font-medium text-foreground uppercase tracking-wide">{groupLabels[group]}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((item) => (
                <div key={item.setting_key} className="space-y-1">
                  <label className="text-xs text-muted-foreground">{item.label}</label>
                  {item.setting_type === "textarea" ? (
                    <Textarea
                      value={item.setting_value}
                      onChange={(e) => setEdits((p) => ({ ...p, [item.setting_key]: e.target.value }))}
                      className="text-sm"
                      rows={3}
                    />
                  ) : (
                    <Input
                      value={item.setting_value}
                      onChange={(e) => setEdits((p) => ({ ...p, [item.setting_key]: e.target.value }))}
                      className="text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
