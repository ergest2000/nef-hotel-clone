import { useState, useRef, useEffect, useCallback } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import type { ProductColor } from "@/hooks/useCollections";
import { Check } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────
   BRAND PALETTE — 12 ngjyra kryesore të markës
   Çdo ngjyrë lidhet me palette_key unik.
   Ngjyrat nga Supabase filtrohen vetëm nëse palette_key matches.
───────────────────────────────────────────────────────────────────── */
export const BRAND_PALETTE: {
  key: string;
  nameAl: string;
  nameEn: string;
  hex: string;
}[] = [
  { key: "gri-hiri",     nameAl: "Gri Hiri",      nameEn: "Ash Grey",       hex: "#9E9E9E" },
  { key: "gri-argjend",  nameAl: "Gri Argjend",    nameEn: "Silver Grey",    hex: "#C8C8C8" },
  { key: "e-bardhe",     nameAl: "E Bardhë",        nameEn: "White",          hex: "#F5F5F5" },
  { key: "e-zeze",       nameAl: "E Zezë",          nameEn: "Black",          hex: "#1A1A1A" },
  { key: "kafe-terr",    nameAl: "Kafe Terr",       nameEn: "Dark Brown",     hex: "#5C3A1E" },
  { key: "kafe-crem",    nameAl: "Kafe Krem",       nameEn: "Cream Brown",    hex: "#C4A882" },
  { key: "e-kuqe",       nameAl: "E Kuqe",          nameEn: "Red",            hex: "#C0392B" },
  { key: "rozë",         nameAl: "Rozë",            nameEn: "Rose",           hex: "#E8A0A0" },
  { key: "blu-det",      nameAl: "Blu Deti",        nameEn: "Navy Blue",      hex: "#1C3F6E" },
  { key: "blu-hapur",    nameAl: "Blu Hapur",       nameEn: "Sky Blue",       hex: "#4A90C4" },
  { key: "jeshile",      nameAl: "Jeshile",         nameEn: "Olive Green",    hex: "#5A7A52" },
  { key: "mustardë",     nameAl: "Mustardë",        nameEn: "Mustard",        hex: "#C9A84C" },
];

/* ─────────────────────────────────────────────────────────────────────
   Helper utilities
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
   ProductPreview — ndryshon imazhin sipas ngjyrës
───────────────────────────────────────────────────────────────────── */
interface ProductPreviewProps {
  selectedColor: ProductColor | null;
  productName?: string;
}

const ProductPreview = ({ selectedColor, productName }: ProductPreviewProps) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgKey, setImgKey] = useState(0);

  useEffect(() => {
    setImgLoaded(false);
    const t = setTimeout(() => setImgKey((k) => k + 1), 50);
    return () => clearTimeout(t);
  }, [selectedColor?.id]);

  const hasImage = !!selectedColor?.image_url;

  return (
    <div
      className="relative w-full aspect-square overflow-hidden"
      style={{
        background: selectedColor
          ? `${selectedColor.color_hex}18`
          : "hsl(var(--secondary))",
        transition: "background 0.4s ease",
        borderRadius: "var(--ds-btn-radius, 0px)",
      }}
    >
      {/* Product image */}
      {hasImage && (
        <img
          key={imgKey}
          src={selectedColor!.image_url}
          alt={productName || "Product"}
          onLoad={() => setImgLoaded(true)}
          className="w-full h-full object-cover"
          style={{
            opacity: imgLoaded ? 1 : 0,
            transition: "opacity 0.35s ease",
          }}
        />
      )}

      {/* Fallback placeholder when no image */}
      {!hasImage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div
            className="w-24 h-24 rounded-full shadow-inner"
            style={{
              background: selectedColor
                ? selectedColor.color_hex
                : "hsl(var(--border))",
              transition: "background 0.4s ease",
            }}
          />
          {selectedColor && (
            <span
              className="text-[11px] font-medium uppercase tracking-widest"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              {selectedColor.color_hex.toUpperCase()}
            </span>
          )}
        </div>
      )}

      {/* Fade-in skeleton */}
      {hasImage && !imgLoaded && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{ background: "hsl(var(--muted))" }}
        />
      )}

      {/* Color accent bar at bottom */}
      {selectedColor && (
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px]"
          style={{
            background: selectedColor.color_hex,
            transition: "background 0.4s ease",
          }}
        />
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   Props
───────────────────────────────────────────────────────────────────── */
interface ProductColorPickerProps {
  /** Product colors from Supabase */
  productColors: ProductColor[];
  /** Currently selected color ID */
  selectedColorId: string | null;
  /** Called when a color is selected/deselected */
  onSelectColor: (colorId: string | null) => void;
  /** Optional: compact mode for product cards */
  compact?: boolean;
  /** Optional: show product preview */
  showPreview?: boolean;
  /** Optional: product name for preview alt text */
  productName?: string;
}

/* ─────────────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────────────── */
const ProductColorPicker = ({
  productColors,
  selectedColorId,
  onSelectColor,
  compact = false,
  showPreview = false,
  productName,
}: ProductColorPickerProps) => {
  const { isAl } = useLanguage();
  const [tooltipColorId, setTooltipColorId] = useState<string | null>(null);
  const [tooltipAnchor, setTooltipAnchor] = useState<HTMLElement | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const t = (al: string, en: string) => (isAl ? al : en);

  /* Map each productColor to its brand palette entry using palette_key or color_hex match */
  const getLabel = useCallback(
    (color: ProductColor) =>
      isAl
        ? color.color_name_al || color.color_name
        : color.color_name_en || color.color_name,
    [isAl]
  );

  const getPaletteKey = (color: ProductColor): string | undefined =>
    BRAND_PALETTE.find(
      (p) => p.hex.toLowerCase() === color.color_hex.toLowerCase()
    )?.key;

  /* Filter: only show colors that belong to the brand palette */
  const paletteColors = productColors.filter(
    (c) => !!getPaletteKey(c)
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

  const selectedColor = paletteColors.find((c) => c.id === selectedColorId) ?? null;
  const tooltipColor = paletteColors.find((c) => c.id === tooltipColorId);

  if (!paletteColors.length) return null;

  /* ── Compact mode ─────────────────────────────────────────────── */
  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {paletteColors.map((color) => {
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

  /* ── Full mode ────────────────────────────────────────────────── */
  return (
    <div className="space-y-5">
      {/* Product preview */}
      {showPreview && (
        <ProductPreview selectedColor={selectedColor} productName={productName} />
      )}

      {/* Header */}
      <div className="flex items-baseline gap-2">
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          {t("Ngjyra", "Color")}
        </span>
        <div
          className="flex-1 h-px"
          style={{ background: "hsl(var(--border))" }}
        />
        {selectedColor && (
          <span
            className="text-[11px] font-medium uppercase tracking-wide transition-all duration-300"
            style={{ color: "hsl(var(--foreground))" }}
          >
            {getLabel(selectedColor)}
            <span
              className="ml-1.5 font-mono"
              style={{ color: "hsl(var(--muted-foreground))", fontSize: "10px" }}
            >
              {selectedColor.color_hex.toUpperCase()}
            </span>
          </span>
        )}
      </div>

      {/* Swatches grid — max 12, responsive */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(44px, 1fr))" }}
      >
        {paletteColors.map((color) => {
          const light = isLight(color.color_hex);
          const isSelected = selectedColorId === color.id;

          return (
            <button
              key={color.id}
              onClick={() => onSelectColor(isSelected ? null : color.id)}
              onMouseEnter={(e) => handleMouseEnter(color.id, e.currentTarget)}
              onMouseLeave={handleMouseLeave}
              className="group flex flex-col items-center gap-1.5"
              style={{ outline: "none" }}
            >
              {/* Swatch */}
              <div
                className="relative transition-all duration-200 ease-out"
                style={{
                  width: 44,
                  height: 44,
                  backgroundColor: color.color_hex,
                  borderRadius: "var(--ds-btn-radius, 0px)",
                  boxShadow: isSelected
                    ? `0 0 0 2px hsl(var(--background)), 0 0 0 4px ${color.color_hex}`
                    : light
                    ? "0 0 0 1px hsl(var(--border))"
                    : "none",
                  transform: isSelected ? "scale(1.08)" : "scale(1)",
                }}
              >
                {/* Check icon */}
                {isSelected && (
                  <Check
                    className={`absolute inset-0 m-auto w-4 h-4 drop-shadow-sm`}
                    style={{ color: light ? "#333" : "#fff" }}
                    strokeWidth={3}
                  />
                )}

                {/* Hover overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  style={{
                    background: light ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.12)",
                    borderRadius: "inherit",
                  }}
                />
              </div>

              {/* Label */}
              <span
                className="text-[9px] uppercase tracking-wide text-center w-full truncate px-0.5 transition-colors duration-150"
                style={{
                  color: isSelected
                    ? "hsl(var(--foreground))"
                    : "hsl(var(--muted-foreground))",
                  fontWeight: isSelected ? 600 : 400,
                  letterSpacing: "0.08em",
                }}
              >
                {getLabel(color)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tooltip */}
      <Tooltip
        text={
          tooltipColor
            ? `${getLabel(tooltipColor)}  ·  ${tooltipColor.color_hex.toUpperCase()}`
            : ""
        }
        visible={!!tooltipColorId}
        anchor={tooltipAnchor}
      />

      {/* Note: only palette colors are shown — no manual input */}
      {productColors.length > paletteColors.length && (
        <p
          className="text-[10px] uppercase tracking-widest"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          {t(
            "Vetëm ngjyrat e paletës sonë janë të disponueshme.",
            "Only colors from our brand palette are available."
          )}
        </p>
      )}
    </div>
  );
};

export default ProductColorPicker;
