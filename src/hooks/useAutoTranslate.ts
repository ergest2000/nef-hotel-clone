import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export const useAutoTranslate = () => {
  const [translating, setTranslating] = useState<string | null>(null);
  const { toast } = useToast();

  const translate = useCallback(
    async (text: string, sourceLang: "al" | "en", targetLang: "al" | "en"): Promise<string> => {
      if (!text.trim() || sourceLang === targetLang) return text;
      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, sourceLang, targetLang }),
        });
        if (!response.ok) throw new Error("Translation failed");
        const data = await response.json();
        return data.translated || "";
      } catch (e) {
        console.error("Translation error:", e);
        toast({ title: "Gabim në përkthim", variant: "destructive" });
        return "";
      }
    },
    [toast]
  );

  const translateField = useCallback(
    async (
      fieldKey: string,
      sourceValue: string,
      direction: "al_to_en" | "en_to_al",
      onResult: (translated: string) => void
    ) => {
      if (!sourceValue.trim()) return;
      setTranslating(fieldKey);
      const [src, tgt] = direction === "al_to_en" ? ["al", "en"] as const : ["en", "al"] as const;
      const result = await translate(sourceValue, src, tgt);
      if (result) {
        onResult(result);
        toast({ title: "Përkthimi u krye!" });
      }
      setTranslating(null);
    },
    [translate, toast]
  );

  return { translateField, translating };
};
