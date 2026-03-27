import { useState, useRef, useEffect, useCallback } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Check } from "lucide-react";
import type { ProductColor, ProductColorAssignment } from "@/hooks/useCollections";

/* ─── Helpers ─────────────────────────────────────────────────── */
const isLight = (hex: string): boolean => {
  const c = hex.replace("#", "");
  if (c.length < 6) return true;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 200;
};

/* ─── Normalised swatch shape used internally ─────────────────── */
interface Swatch {
  id: string;       // assignment.id or legacy color.id
  hex: string;
  nameAl: string;
  nameEn: string;
}

function toSwatches(
  assignments: ProductColorAssignment[],
  legacy: ProductColor[]
): Swatch[] {
  if (assignments.length > 0) {
    return assignments.map((a) => {
      // Supabase may return the joined relation as an array or as an object
      const color = Array.isArray((a as any).color)
        ? (a as any).color[0]
        : a.color;
      return {
        id: a.id,
        hex: color?.hex ?? "#CCCCCC",
        nameAl: color?.name_al ?? "",
        nameEn: color?.name_en ?? "",
      };
    });
  }
  // fall back to old product_colors table
  return legacy.map((c) => ({
    id: c.id,
    hex: c.color_hex,
    nameAl: c.color_name_al || c.color_name,
    nameEn: c.color_name_en || c.color_name,
  }));
}

/* ─── Tooltip ─────────────────────────────────────────────────── */
const Tooltip = ({
  text,
  visible,
  anchor,
}: {
  text: string;
  visible: boolean;
  anchor: HTMLElement | null;
}) => {
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

/* ─── Props ───────────────────────────────────────────────────── */
interface ProductColorPickerProps {
  /** New system: assignments joined with global_colors */
  assignments?: ProductColorAssignment[];
  /** Legacy fallback: old product_colors rows */
  legacyColors?: ProductColor[];
  selectedColorId: string | null;
  onSelectColor: (colorId: string | null) => void;
  compact?: boolean;
}

/* ─── Component ───────────────────────────────────────────────── */
const ProductColorPicker = ({
  assignments = [],
  legacyColors = [],
  selectedColorId,
  onSelectColor,
  compact = false,
}: ProductColorPickerProps) => {
  const { isAl } = useLanguage();
  const [tooltipId, setTooltipId] = useState<string | null>(null);
  const [tooltipAnchor, setTooltipAnchor] = useState<HTMLElement | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const t = (al: string, en: string) => (isAl ? al : en);

  const swatches = toSwatches(assignments, legacyColors);

  const getLabel = useCallback(
    (s: Swatch) => (isAl ? s.nameAl : s.nameEn) || s.nameAl || s.nameEn,
    [isAl]
  );

  const handleEnter = (id: string, el: HTMLElement) => {
    clearTimeout(hideTimer.current);
    setTooltipId(id);
    setTooltipAnchor(el);
  };
  const handleLeave = () => {
    hideTimer.current = setTimeout(() => {
      setTooltipId(null);
      setTooltipAnchor(null);
    }, 120);
  };

  const selectedSwatch = swatches.find((s) => s.id === selectedColorId) ?? null;
  const tooltipSwatch = swatches.find((s) => s.id === tooltipId);

  if (!swatches.length) return null;

  /* ── Compact (product cards) ──────────────────────────────── */
  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {swatches.map((s) => {
          const light = isLight(s.hex);
          const isSel = selectedColorId === s.id;
          return (
            <button
              key={s.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSelectColor(isSel ? null : s.id);
              }}
              onMouseEnter={(e) => handleEnter(s.id, e.currentTarget)}
              onMouseLeave={handleLeave}
              title={getLabel(s)}
              className={`relative w-6 h-6 rounded-full transition-all duration-200 ease-out
                ${isSel
                  ? "ring-2 ring-offset-1 ring-primary scale-110"
                  : `hover:scale-110 ${light ? "border border-gray-200" : ""}`}`}
              style={{ backgroundColor: s.hex }}
            >
              {isSel && (
                <Check
                  className={`absolute inset-0 m-auto w-3 h-3 ${light ? "text-gray-700" : "text-white"}`}
                  strokeWidth={3}
                />
              )}
            </button>
          );
        })}
        <Tooltip
          text={tooltipSwatch ? getLabel(tooltipSwatch) : ""}
          visible={!!tooltipId}
          anchor={tooltipAnchor}
        />
      </div>
    );
  }

  /* ── Full (product detail) ────────────────────────────────── */
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t("Ngjyra", "Color")}
        </p>
        {selectedSwatch && (
          <span className="text-xs text-foreground font-medium">
            — {getLabel(selectedSwatch)}
            <span
              className="ml-1.5 font-mono text-muted-foreground"
              style={{ fontSize: "10px" }}
            >
              {selectedSwatch.hex.toUpperCase()}
            </span>
          </span>
        )}
      </div>

      {/* Swatches */}
      <div className="flex flex-wrap gap-2.5">
        {swatches.map((s) => {
          const light = isLight(s.hex);
          const isSel = selectedColorId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onSelectColor(isSel ? null : s.id)}
              onMouseEnter={(e) => handleEnter(s.id, e.currentTarget)}
              onMouseLeave={handleLeave}
              className="group relative flex flex-col items-center gap-1.5 transition-all duration-200 ease-out"
            >
              {/* Circle swatch */}
              <div
                className={`relative w-10 h-10 md:w-11 md:h-11 rounded-full transition-all duration-200 ease-out
                  ${isSel
                    ? "ring-[2.5px] ring-offset-2 ring-primary scale-105 shadow-md"
                    : `shadow-sm hover:shadow-md hover:scale-105 ${
                        light
                          ? "border border-gray-200 hover:border-gray-300"
                          : "border border-transparent"
                      }`}`}
                style={{ backgroundColor: s.hex }}
              >
                {isSel && (
                  <Check
                    className={`absolute inset-0 m-auto w-4 h-4 drop-shadow-sm ${light ? "text-gray-700" : "text-white"}`}
                    strokeWidth={3}
                  />
                )}
              </div>

              {/* Name label */}
              <span
                className={`text-[10px] leading-tight text-center max-w-[56px] truncate transition-colors duration-150
                  ${isSel
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground group-hover:text-foreground"}`}
              >
                {getLabel(s)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tooltip */}
      <Tooltip
        text={
          tooltipSwatch
            ? `${getLabel(tooltipSwatch)} · ${tooltipSwatch.hex.toUpperCase()}`
            : ""
        }
        visible={!!tooltipId}
        anchor={tooltipAnchor}
      />
    </div>
  );
};

export default ProductColorPicker;
