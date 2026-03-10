import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";

// Hook to fetch auth form texts from design_settings (bilingual)
export const useAuthTexts = () => {
  const { lang } = useLanguage();

  const { data: texts = [] } = useQuery({
    queryKey: ["auth-texts-live"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("design_settings")
        .select("setting_key, setting_value")
        .or(
          "setting_key.like.login_%,setting_key.like.forgot_%,setting_key.like.register_%,setting_key.like.reset_%,setting_key.like.label_%,setting_key.like.ph_%"
        );
      if (error) throw error;
      return data;
    },
    staleTime: 60000,
  });

  const map = new Map(texts.map((t) => [t.setting_key, t.setting_value]));

  // Look up key with language suffix first, then without suffix as fallback
  const t = (key: string, fallback: string) => {
    const langKey = `${key}_${lang}`;
    return map.get(langKey) || map.get(key) || fallback;
  };

  return { t };
};

// Helper to log auth events
export const logAuthEvent = async (
  userEmail: string,
  eventType: string,
  metadata?: Record<string, any>
) => {
  try {
    await supabase.from("auth_logs").insert({
      user_email: userEmail,
      event_type: eventType,
      metadata: metadata || {},
    });
  } catch (e) {
    console.error("Failed to log auth event:", e);
  }
};
