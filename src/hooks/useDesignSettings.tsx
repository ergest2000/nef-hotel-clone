import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DesignSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_group: string;
  label: string;
  setting_type: string;
}

type SettingsMap = Record<string, string>;

const DesignContext = createContext<{ settings: SettingsMap; isLoading: boolean }>({
  settings: {},
  isLoading: true,
});

const googleFonts = [
  "Inter", "Poppins", "Roboto", "Open Sans", "Montserrat", "Lato",
  "Raleway", "Nunito", "Playfair Display", "Oswald", "Merriweather",
  "Source Sans 3", "PT Sans", "Noto Sans", "Work Sans",
];

const systemFonts = [
  "Century Gothic", "Arial", "Helvetica", "Georgia", "Verdana", "Tahoma",
  "Trebuchet MS", "Times New Roman", "Garamond", "Palatino",
];

export const allFonts = [...systemFonts, ...googleFonts];

const loadGoogleFont = (family: string) => {
  if (systemFonts.includes(family)) return;
  const id = `gfont-${family.replace(/\s/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
};

const getFontStack = (family: string) => {
  if (family === "Century Gothic") {
    return "'Century Gothic', 'Avantgarde', 'CenturyGothic', 'AppleGothic', sans-serif";
  }
  if (systemFonts.includes(family)) {
    return `'${family}', sans-serif`;
  }
  return `'${family}', sans-serif`;
};

export const useDesignSettings = () => {
  return useQuery({
    queryKey: ["design_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("design_settings")
        .select("*")
        .order("setting_group");
      if (error) throw error;
      return data as DesignSetting[];
    },
  });
};

export const DesignProvider = ({ children }: { children: ReactNode }) => {
  const { data, isLoading } = useDesignSettings();

  const settings: SettingsMap = {};
  data?.forEach((s) => {
    settings[s.setting_key] = s.setting_value;
  });

  // Apply CSS variables whenever settings change
  useEffect(() => {
    if (!data || data.length === 0) return;
    const root = document.documentElement;

    // Font
    const fontFamily = settings.font_family || "Century Gothic";
    loadGoogleFont(fontFamily);
    const fontStack = getFontStack(fontFamily);
    root.style.setProperty("--ds-font-family", fontStack);

    // Font sizes
    root.style.setProperty("--ds-font-size-h1", `${settings.font_size_h1 || 36}px`);
    root.style.setProperty("--ds-font-size-h2", `${settings.font_size_h2 || 24}px`);
    root.style.setProperty("--ds-font-size-h3", `${settings.font_size_h3 || 20}px`);
    root.style.setProperty("--ds-font-size-body", `${settings.font_size_body || 16}px`);
    root.style.setProperty("--ds-font-weight", settings.font_weight || "400");

    // Button
    root.style.setProperty("--ds-btn-radius", `${settings.btn_border_radius || 4}px`);
    if (settings.btn_bg_color) root.style.setProperty("--primary", settings.btn_bg_color);
    if (settings.btn_text_color) root.style.setProperty("--primary-foreground", settings.btn_text_color);
    if (settings.btn_hover_color) root.style.setProperty("--ds-btn-hover", settings.btn_hover_color);

    // Colors
    if (settings.color_primary) root.style.setProperty("--primary", settings.color_primary);
    if (settings.color_secondary) root.style.setProperty("--secondary", settings.color_secondary);
    if (settings.color_text) root.style.setProperty("--foreground", settings.color_text);
    if (settings.color_background) root.style.setProperty("--background", settings.color_background);
    if (settings.color_link) root.style.setProperty("--ds-link-color", settings.color_link);
    if (settings.color_hover) root.style.setProperty("--ds-hover-color", settings.color_hover);

    // Also update card/popover to match
    if (settings.color_background) {
      root.style.setProperty("--card", settings.color_background);
      root.style.setProperty("--popover", settings.color_background);
    }
    if (settings.color_text) {
      root.style.setProperty("--card-foreground", settings.color_text);
      root.style.setProperty("--popover-foreground", settings.color_text);
    }
    if (settings.color_primary) {
      root.style.setProperty("--accent", settings.color_primary);
      root.style.setProperty("--ring", settings.color_primary);
    }
  }, [data, settings]);

  return (
    <DesignContext.Provider value={{ settings, isLoading }}>
      {children}
    </DesignContext.Provider>
  );
};

export const useDesign = () => useContext(DesignContext);
