import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDesignSettings, allFonts, type DesignSetting } from "@/hooks/useDesignSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Save, Palette, Type, MousePointer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const radiusOptions = ["0", "2", "4", "6", "8", "12", "20", "9999"];
const weightOptions = [
  { value: "300", label: "Light (300)" },
  { value: "400", label: "Normal (400)" },
  { value: "500", label: "Medium (500)" },
  { value: "600", label: "Semibold (600)" },
  { value: "700", label: "Bold (700)" },
];

// Convert HSL string "207 56% 28%" to hex for color picker
const hslToHex = (hslStr: string): string => {
  try {
    const parts = hslStr.trim().split(/\s+/);
    const h = parseFloat(parts[0]);
    const s = parseFloat(parts[1]) / 100;
    const l = parseFloat(parts[2]) / 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  } catch {
    return "#1f4e79";
  }
};

// Convert hex to HSL string
const hexToHsl = (hex: string): string => {
  try {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s: number;
    const l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  } catch {
    return "207 56% 28%";
  }
};

export const AdminDesignSettings = () => {
  const { data: settings, isLoading } = useDesignSettings();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Initialize edits from DB
  useEffect(() => {
    if (settings) {
      const map: Record<string, string> = {};
      settings.forEach((s) => { map[s.setting_key] = s.setting_value; });
      setEdits(map);
    }
  }, [settings]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getValue = (key: string) => edits[key] ?? "";
  const setValue = (key: string, val: string) => setEdits((p) => ({ ...p, [key]: val }));

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const promises = Object.entries(edits).map(([key, val]) =>
        supabase.from("design_settings").update({ setting_value: val }).eq("setting_key", key)
      );
      await Promise.all(promises);
      qc.invalidateQueries({ queryKey: ["design_settings"] });
      toast({ title: "U ruajt!", description: "Design settings u përditësuan." });
    } catch (e: any) {
      toast({ title: "Gabim", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const groupedSettings = settings?.reduce((acc, s) => {
    if (!acc[s.setting_group]) acc[s.setting_group] = [];
    acc[s.setting_group].push(s);
    return acc;
  }, {} as Record<string, DesignSetting[]>) ?? {};

  const groupIcons: Record<string, typeof Palette> = {
    buttons: MousePointer,
    typography: Type,
    colors: Palette,
    footer: Palette,
    content: Type,
    cart: MousePointer,
    contact: Palette,
  };

  const groupLabels: Record<string, string> = {
    buttons: "Buttons",
    typography: "Typography",
    colors: "Global Colors",
    footer: "Footer (Colors, Logo, Texts, Newsletter, Social)",
    content: "Përmbajtja Globale (Politika e Kthimit)",
    cart: "Shporta (Tekste & Butona)",
    contact: "Kontakti (Google Maps)",
  };

  const renderField = (setting: DesignSetting) => {
    const val = getValue(setting.setting_key);

    if (setting.setting_key === "btn_border_radius") {
      return (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">{setting.label}</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[parseInt(val) || 0]}
              onValueChange={([v]) => setValue(setting.setting_key, String(v))}
              min={0}
              max={24}
              step={1}
              className="flex-1"
            />
            <span className="text-sm font-mono w-12 text-right">{val}px</span>
          </div>
          <div className="flex gap-2 mt-1">
            {radiusOptions.map((r) => (
              <button
                key={r}
                onClick={() => setValue(setting.setting_key, r)}
                className={`w-9 h-9 border text-[10px] transition-colors ${
                  val === r ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"
                }`}
                style={{ borderRadius: `${Math.min(parseInt(r), 12)}px` }}
              >
                {r === "9999" ? "∞" : r}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (setting.setting_type === "color") {
      return (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{setting.label}</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={hslToHex(val)}
              onChange={(e) => setValue(setting.setting_key, hexToHsl(e.target.value))}
              className="w-10 h-10 rounded border border-border cursor-pointer"
            />
            <Input
              value={val}
              onChange={(e) => setValue(setting.setting_key, e.target.value)}
              className="text-xs h-9 flex-1 font-mono"
              placeholder="H S% L%"
            />
            <div
              className="w-10 h-10 rounded border border-border shrink-0"
              style={{ backgroundColor: `hsl(${val})` }}
            />
          </div>
        </div>
      );
    }

    if (setting.setting_key === "font_family") {
      return (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{setting.label}</Label>
          <Select value={val} onValueChange={(v) => setValue(setting.setting_key, v)}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <div className="px-2 py-1 text-[9px] text-muted-foreground uppercase tracking-widest">System Fonts</div>
              {allFonts.filter((_, i) => i < 10).map((f) => (
                <SelectItem key={f} value={f} className="text-xs" style={{ fontFamily: f }}>
                  {f}
                </SelectItem>
              ))}
              <div className="px-2 py-1 text-[9px] text-muted-foreground uppercase tracking-widest border-t mt-1">Google Fonts</div>
              {allFonts.filter((_, i) => i >= 10).map((f) => (
                <SelectItem key={f} value={f} className="text-xs">
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-2 p-3 border border-border rounded bg-muted/30">
            <p className="text-sm" style={{ fontFamily: val }}>{val} — The quick brown fox jumps over the lazy dog.</p>
          </div>
        </div>
      );
    }

    if (setting.setting_key === "font_weight") {
      return (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{setting.label}</Label>
          <Select value={val} onValueChange={(v) => setValue(setting.setting_key, v)}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {weightOptions.map((w) => (
                <SelectItem key={w.value} value={w.value} className="text-xs">
                  {w.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (setting.setting_type === "number") {
      return (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{setting.label}</Label>
          <div className="flex items-center gap-3">
            <Slider
              value={[parseInt(val) || 16]}
              onValueChange={([v]) => setValue(setting.setting_key, String(v))}
              min={10}
              max={72}
              step={1}
              className="flex-1"
            />
            <span className="text-sm font-mono w-12 text-right">{val}px</span>
          </div>
        </div>
      );
    }

    if (setting.setting_type === "image") {
      return (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{setting.label}</Label>
          <div className="flex items-center gap-3">
            <Input
              value={val}
              onChange={(e) => setValue(setting.setting_key, e.target.value)}
              className="text-xs h-9 flex-1"
              placeholder="Image URL"
            />
            {val && (
              <img src={val} alt="" className="w-10 h-10 object-contain border border-border rounded" />
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="text-xs mt-1"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const path = `footer/${Date.now()}-${file.name}`;
              const { error } = await supabase.storage.from("cms-images").upload(path, file);
              if (error) { toast({ title: "Gabim", description: error.message, variant: "destructive" }); return; }
              const { data: urlData } = supabase.storage.from("cms-images").getPublicUrl(path);
              setValue(setting.setting_key, urlData.publicUrl);
            }}
          />
        </div>
      );
    }

    if (setting.setting_type === "textarea") {
      return (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">{setting.label}</Label>
          <textarea
            value={val}
            onChange={(e) => setValue(setting.setting_key, e.target.value)}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            rows={4}
          />
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">{setting.label}</Label>
        <Input
          value={val}
          onChange={(e) => setValue(setting.setting_key, e.target.value)}
          className="text-xs h-9"
        />
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg tracking-wide-brand text-foreground font-light uppercase">
            Design Settings
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Ndryshimet aplikohen globalisht në të gjithë faqen.
          </p>
        </div>
        <Button onClick={handleSaveAll} disabled={saving} className="gap-2">
          <Save size={14} />
          {saving ? "Duke ruajtur..." : "Ruaj Ndryshimet"}
        </Button>
      </div>

      {/* Live Preview */}
      <div className="border border-border rounded-lg p-6 mb-8 bg-muted/20">
        <p className="text-[10px] tracking-brand text-muted-foreground uppercase mb-3">Live Preview</p>
        <div className="space-y-3" style={{ fontFamily: getValue("font_family") || "Century Gothic" }}>
          <h1 style={{ fontSize: `${getValue("font_size_h1") || 36}px`, fontWeight: getValue("font_weight") || "400", color: `hsl(${getValue("color_text") || "210 29% 20%"})` }}>
            Heading 1
          </h1>
          <h2 style={{ fontSize: `${getValue("font_size_h2") || 24}px`, fontWeight: getValue("font_weight") || "400", color: `hsl(${getValue("color_text") || "210 29% 20%"})` }}>
            Heading 2
          </h2>
          <p style={{ fontSize: `${getValue("font_size_body") || 16}px`, color: `hsl(${getValue("color_text") || "210 29% 20%"})` }}>
            Kjo është një paragraf shembull. The quick brown fox jumps over the lazy dog.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              style={{
                borderRadius: `${getValue("btn_border_radius") || 4}px`,
                backgroundColor: `hsl(${getValue("btn_bg_color") || getValue("color_primary") || "207 56% 28%"})`,
                color: `hsl(${getValue("btn_text_color") || "0 0% 100%"})`,
                padding: "10px 32px",
                fontSize: "12px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Primary Button
            </button>
            <button
              style={{
                borderRadius: `${getValue("btn_border_radius") || 4}px`,
                border: `1px solid hsl(${getValue("btn_bg_color") || getValue("color_primary") || "207 56% 28%"})`,
                color: `hsl(${getValue("btn_bg_color") || getValue("color_primary") || "207 56% 28%"})`,
                backgroundColor: "transparent",
                padding: "10px 32px",
                fontSize: "12px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Outline Button
            </button>
          </div>
        </div>
      </div>

      {/* Setting Groups */}
      <div className="space-y-8">
        {["buttons", "typography", "colors", "footer", "content", "cart", "contact"].map((groupKey) => {
          const items = groupedSettings[groupKey] ?? [];
          const Icon = groupIcons[groupKey] || Palette;
          return (
            <div key={groupKey} className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted/30 px-4 py-3 flex items-center gap-2 border-b border-border">
                <Icon size={16} className="text-primary" />
                <h3 className="text-xs tracking-brand text-foreground font-medium uppercase">
                  {groupLabels[groupKey] || groupKey}
                </h3>
              </div>
              <div className="p-4 space-y-5">
                {items.map((setting) => (
                  <div key={setting.id}>{renderField(setting)}</div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
