import { useCallback } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import type { ProductColor } from "@/hooks/useCollections";
import { Check } from "lucide-react";

/* ── Helper: is a color very light? ──────────────────────────── */
const isLight = (hex: string | null | undefined): boolean => {
  if (!hex) return true;
  const c = hex.replace("#", "");
  if (c.length < 6) return true;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 200;
};

/* ── Props ─────────────────────────────────────────────────────── */
interface ProductColorPickerProps {
  productColors: ProductColor[];
  selectedColorId: string | null;
  onSelectColor: (colorId: string | null) => void;
  compact?: boolean;
}

/* ── Component ────────────────────────────────────────────────── */
const ProductColorPicker = ({
  productColors,
  selectedColorId,
  onSelectColor,
  compact = false,
}: ProductColorPickerProps) => {
  const { isAl } = useLanguage();

  const getLabel = useCallback(
    (c: ProductColor) =>
      (isAl ? c.color_name_al || c.color_name : c.color_name_en || c.color_name) || "",
    [isAl]
  );

  if (!productColors || productColors.length === 0) return null;

  const selectedColor = selectedColorId
    ? productColors.find((c) => c.id === selectedColorId) ?? null
    : null;

  /* ── Compact mode (product cards) ──────────────────────────── */
  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {productColors.map((color) => {
          const light = isLight(color.color_hex);
          const active = selectedColorId === color.id;
          return (
            <button
              key={color.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectColor(active ? null : color.id);
              }}
              title={getLabel(color)}
              className={`relative w-6 h-6 rounded-full transition-all duration-200 ${
                active
                  ? "ring-2 ring-offset-1 ring-primary scale-110"
                  : `hover:scale-110 ${light ? "border border-gray-200" : ""}`
              }`}
              style={{ backgroundColor: color.color_hex || "#ccc" }}
            >
              {active && (
                <Check
                  className={`absolute inset-0 m-auto w-3 h-3 ${light ? "text-gray-700" : "text-white"}`}
                  strokeWidth={3}
                />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  /* ── Full mode (product detail page) ───────────────────────── */
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {isAl ? "Ngjyra" : "Color"}
        </p>
        {selectedColor && (
          <span className="text-xs text-foreground font-medium">
            — {getLabel(selectedColor)}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2.5">
        {productColors.map((color) => {
          const light = isLight(color.color_hex);
          const active = selectedColorId === color.id;
          const label = getLabel(color);
          return (
            <button
              key={color.id}
              onClick={() => onSelectColor(active ? null : color.id)}
              title={`${label} · ${color.color_hex || ""}`}
              className="group relative flex flex-col items-center gap-1.5 transition-all duration-200"
            >
              <div
                className={`relative w-10 h-10 md:w-11 md:h-11 rounded-full transition-all duration-200 ${
                  active
                    ? "ring-[2.5px] ring-offset-2 ring-primary scale-105 shadow-md"
                    : `shadow-sm hover:shadow-md hover:scale-105 ${
                        light ? "border border-gray-200 hover:border-gray-300" : ""
                      }`
                }`}
                style={{ backgroundColor: color.color_hex || "#ccc" }}
              >
                {active && (
                  <Check
                    className={`absolute inset-0 m-auto w-4 h-4 drop-shadow-sm ${
                      light ? "text-gray-700" : "text-white"
                    }`}
                    strokeWidth={3}
                  />
                )}
              </div>
              <span
                className={`text-[10px] leading-tight text-center max-w-[56px] truncate transition-colors ${
                  active
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductColorPicker;
