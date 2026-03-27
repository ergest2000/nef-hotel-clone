import { useState, useRef, useEffect, useCallback } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import type { ProductColor } from "@/hooks/useCollections";
import { Check } from "lucide-react";

/* ── Helper: is a color very light? (needs dark border / check) ── */
const isLight = (hex: string): boolean => {
  const c = hex.replace("#", "");
  if (c.length < 6) return true;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 200;
};

/* ── Tooltip ──────────────────────────────────────────────────── */
const Tooltip = ({ text, visible, anchor }: { text: string; visible: boolean; anchor: HTMLElement | null }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!anchor || !visible) return;
    const rect = anchor.getBoundingClientRect();
    setPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
  }, [anchor, visible]);

  if (!visible || !anchor) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{ left: pos.x, top: pos.y, transform: "translate(-50%, -100%)" }}
    >
      <div className="bg-foreground text-background text-[11px] font-medium px-2.5 py-1 rounded shadow-lg whitespace-nowrap">
        {text}
      </div>
      <div className="w-0 h-0 mx-auto border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-foreground" />
    </div>
  );
};

/* ── Props ─────────────────────────────────────────────────────── */
interface ProductColorPickerProps {
  /** Product colors from Supabase (managed entirely from dashboard) */
  productColors: ProductColor[];
  /** Currently selected color ID */
  selectedColorId: string | null;
  /** Called when a color is selected/deselected */
  onSelectColor: (colorId: string | null) => void;
  /** Optional: compact mode for product cards (smaller swatches, no labels) */
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
  const [tooltipColor, setTooltipColor] = useState<string | null>(null);
  const [tooltipAnchor, setTooltipAnchor] = useState<HTMLElement | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const t = (al: string, en: string) => (isAl ? al : en);

  const getColorLabel = useCallback(
    (color: ProductColor) => {
      return isAl
        ? color.color_name_al || color.color_name
        : color.color_name_en || color.color_name;
    },
    [isAl]
  );

  const handleMouseEnter = (id: string, el: HTMLElement) => {
    clearTimeout(hideTimer.current);
    setTooltipColor(id);
    setTooltipAnchor(el);
  };

  const handleMouseLeave = () => {
    hideTimer.current = setTimeout(() => {
      setTooltipColor(null);
      setTooltipAnchor(null);
    }, 100);
  };

  const selectedColor = productColors.find((c) => c.id === selectedColorId);

  if (!productColors.length) return null;

  /* ── Compact mode (for product cards) ───────────────────────── */
  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {productColors.map((color) => {
          const light = isLight(color.color_hex);
          const isSelected = selectedColorId === color.id;

          return (
            <button
              key={color.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectColor(isSelected ? null : color.id);
              }}
              onMouseEnter={(e) => handleMouseEnter(color.id, e.currentTarget)}
              onMouseLeave={handleMouseLeave}
              title={getColorLabel(color)}
              className={`
                relative w-6 h-6 rounded-full transition-all duration-200 ease-out
                ${isSelected
                  ? "ring-2 ring-offset-1 ring-primary scale-110"
                  : `hover:scale-110 ${light ? "border border-gray-200" : ""}`
                }
              `}
              style={{ backgroundColor: color.color_hex }}
            >
              {isSelected && (
                <Check
                  className={`absolute inset-0 m-auto w-3 h-3 ${light ? "text-gray-700" : "text-white"}`}
                  strokeWidth={3}
                />
              )}
            </button>
          );
        })}

        <Tooltip
          text={tooltipColor ? getColorLabel(productColors.find((c) => c.id === tooltipColor)!) : ""}
          visible={!!tooltipColor}
          anchor={tooltipAnchor}
        />
      </div>
    );
  }

  /* ── Full mode (for product detail page) ────────────────────── */
  return (
    <div className="space-y-3">
      {/* Label with selected color name + HEX */}
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t("Ngjyra", "Color")}
        </p>
        {selectedColor && (
          <span className="text-xs text-foreground font-medium">
            — {getColorLabel(selectedColor)}
          </span>
        )}
      </div>

      {/* Swatches grid */}
      <div className="flex flex-wrap gap-2.5">
        {productColors.map((color) => {
          const light = isLight(color.color_hex);
          const isSelected = selectedColorId === color.id;
          const label = getColorLabel(color);

          return (
            <button
              key={color.id}
              onClick={() => onSelectColor(isSelected ? null : color.id)}
              onMouseEnter={(e) => handleMouseEnter(color.id, e.currentTarget)}
              onMouseLeave={handleMouseLeave}
              className="group relative flex flex-col items-center gap-1.5 transition-all duration-200 ease-out"
            >
              {/* Swatch circle */}
              <div
                className={`
                  relative w-10 h-10 md:w-11 md:h-11 rounded-full
                  transition-all duration-200 ease-out
                  ${isSelected
                    ? "ring-[2.5px] ring-offset-2 ring-primary scale-105 shadow-md"
                    : `shadow-sm hover:shadow-md hover:scale-105 ${
                        light
                          ? "border border-gray-200 hover:border-gray-300"
                          : "border border-transparent"
                      }`
                  }
                `}
                style={{ backgroundColor: color.color_hex }}
              >
                {isSelected && (
                  <Check
                    className={`absolute inset-0 m-auto w-4 h-4 drop-shadow-sm ${
                      light ? "text-gray-700" : "text-white"
                    }`}
                    strokeWidth={3}
                  />
                )}
              </div>

              {/* Color name below swatch */}
              <span
                className={`
                  text-[10px] leading-tight text-center max-w-[56px] truncate
                  transition-colors duration-150
                  ${isSelected
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground group-hover:text-foreground"
                  }
                `}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tooltip: color name + HEX code from dashboard */}
      <Tooltip
        text={
          tooltipColor
            ? `${getColorLabel(productColors.find((c) => c.id === tooltipColor)!)} · ${productColors.find((c) => c.id === tooltipColor)!.color_hex}`
            : ""
        }
        visible={!!tooltipColor}
        anchor={tooltipAnchor}
      />
    </div>
  );
};

export default ProductColorPicker;
