import { useState, useRef, useEffect, useCallback } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import type { ProductColor } from "@/hooks/useCollections";
import { Check } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────
   Helper: is a color very light? (needs dark border / check icon)
───────────────────────────────────────────────────────────────────── */
const isLight = (hex: string): boolean => {
  const c = hex.replace("#", "");
  if (c.length < 6) return true;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 200;
};

/* ─────────────────────────────────────────────────────────────────────
   Tooltip
───────────────────────────────────────────────────────────────────── */
interface TooltipProps {
  text: string;
  visible: boolean;
  anchor: HTMLElement | null;
}

const Tooltip = ({ text, visible, anchor }: TooltipProps) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!anchor || !visible) return;
    const rect = anchor.getBoundingClientRect();
    setPos({ x: rect.left + rect.width / 2, y: rect.top - 10 });
  }, [anchor, visible]);

  if (!visible || !anchor || !text) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{ left: pos.x, top: pos.y, transform: "translate(-50%, -100%)" }}
    >
      <div
        className="text-[11px] font-medium px-3 py-1.5 rounded shadow-lg whitespace-nowrap"
        style={{
          background: "hsl(var(--foreground))",
          color: "hsl(var(--background))",
          letterSpacing: "0.05em",
        }}
      >
        {text}
      </div>
      <div
        className="w-0 h-0 mx-auto"
        style={{
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: "5px solid hsl(var(--foreground))",
        }}
      />
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   Props
───────────────────────────────────────────────────────────────────── */
interface ProductColorPickerProps {
  productColors: ProductColor[];
  selectedColorId: string | null;
  onSelectColor: (colorId: string | null) => void;
  compact?: boolean;
}

/* ─────────────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────────────── */
const ProductColorPicker = ({
  productColors,
  selectedColorId,
  onSelectColor,
  compact = false,
}: ProductColorPickerProps) => {
  const { isAl } = useLanguage();
  const [tooltipColorId, setTooltipColorId] = useState<string | null>(null);
  const [tooltipAnchor, setTooltipAnchor] = useState<HTMLElement | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const t = (al: string, en: string) => (isAl ? al : en);

  const getLabel = useCallback(
    (color: ProductColor) =>
      isAl
        ? color.color_name_al || color.color_name
        : color.color_name_en || color.color_name,
    [isAl]
  );

  const handleMouseEnter = (id: string, el: HTMLElement) => {
    clearTimeout(hideTimer.current);
    setTooltipColorId(id);
    setTooltipAnchor(el);
  };

  const handleMouseLeave = () => {
    hideTimer.current = setTimeout(() => {
      setTooltipColorId(null);
      setTooltipAnchor(null);
    }, 120);
  };

  const selectedColor = productColors.find((c) => c.id === selectedColorId) ?? null;
  const tooltipColor = productColors.find((c) => c.id === tooltipColorId);

  if (!productColors.length) return null;

  /* ── Compact mode (product cards) ────────────────────────────── */
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
              title={getLabel(color)}
              className={`
                relative w-6 h-6 rounded-full transition-all duration-200 ease-out
                ${isSelected
                  ? "ring-2 ring-offset-1 ring-primary scale-110"
                  : `hover:scale-110 ${light ? "border border-gray-200" : ""}`}
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
          text={tooltipColor ? getLabel(tooltipColor) : ""}
          visible={!!tooltipColorId}
          anchor={tooltipAnchor}
        />
      </div>
    );
  }

  /* ── Full mode (product detail page) ─────────────────────────── */
  return (
    <div className="space-y-3">
      {/* Label row */}
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t("Ngjyra", "Color")}
        </p>
        {selectedColor && (
          <span className="text-xs text-foreground font-medium">
            — {getLabel(selectedColor)}
            <span className="ml-1.5 font-mono text-muted-foreground" style={{ fontSize: "10px" }}>
              {selectedColor.color_hex.toUpperCase()}
            </span>
          </span>
        )}
      </div>

      {/* Swatches */}
      <div className="flex flex-wrap gap-2.5">
        {productColors.map((color) => {
          const light = isLight(color.color_hex);
          const isSelected = selectedColorId === color.id;

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

              {/* Color name */}
              <span
                className={`
                  text-[10px] leading-tight text-center max-w-[56px] truncate
                  transition-colors duration-150
                  ${isSelected
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground group-hover:text-foreground"}
                `}
              >
                {getLabel(color)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tooltip: name + HEX */}
      <Tooltip
        text={
          tooltipColor
            ? `${getLabel(tooltipColor)} · ${tooltipColor.color_hex.toUpperCase()}`
            : ""
        }
        visible={!!tooltipColorId}
        anchor={tooltipAnchor}
      />
    </div>
  );
};

export default ProductColorPicker;
