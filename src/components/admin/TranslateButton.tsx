import { Languages, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TranslateButtonProps {
  onClick: () => void;
  loading: boolean;
  direction: "al_to_en" | "en_to_al";
  className?: string;
}

export const TranslateButton = ({ onClick, loading, direction, className }: TranslateButtonProps) => (
  <Button
    type="button"
    variant="ghost"
    size="sm"
    onClick={onClick}
    disabled={loading}
    className={`h-6 px-2 text-[10px] text-muted-foreground hover:text-primary ${className ?? ""}`}
    title={direction === "al_to_en" ? "Përkthe AL → EN" : "Përkthe EN → AL"}
  >
    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3 mr-0.5" />}
    {direction === "al_to_en" ? "→ EN" : "→ AL"}
  </Button>
);
