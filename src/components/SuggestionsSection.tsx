import { useRef, useState, useEffect, useCallback } from "react";
import { useSuggestedProductsFull } from "@/hooks/useHomepageSuggestions";
import { useLanguage } from "@/hooks/useLanguage";
import { getContentValue } from "@/hooks/useCms";
import { ChevronLeft, ChevronRight } from "lucide-react";
import catBedroom from "@/assets/cat-bedroom.jpg";
import catBathroom from "@/assets/cat-bathroom.jpg";
import catPool from "@/assets/cat-pool.jpg";
import catSpa from "@/assets/cat-spa.jpg";
import type { Tables } from "@/integrations/supabase/types";

type SiteContent = Tables<"site_content">;

const toTitleCase = (str: string) =>
  str.toLowerCase().replace(/(?:^|\s|[-/])\S/g, (m) => m.toUpperCase());

const defaultProducts = [
  { key: "prod1", name: "Premium Cotton Sheet Set", image: catBedroom },
  { key: "prod2", name: "Luxury Bath Towel Pack", image: catBathroom },
  { key: "prod3", name: "Pool Towel Collection", image: catPool },
  { key: "prod4", name: "Spa Robe Deluxe", image: catSpa },
  { key: "prod5", name: "Egyptian Cotton Pillowcase", image: catBedroom },
  { key: "prod6", name: "Deluxe Bath Mat", image: catBathroom },
  { key: "prod7", name: "Beach Towel Premium", image: catPool },
  { key: "prod8", name: "Wellness Robe Classic", image: catSpa },
];

/* gap between cards in px */
const GAP = 16;

/** Returns the number of visible cards based on window width */
const getVisibleCount = (): number => {
  if (typeof window === "undefined") return 4;
  const w = window.innerWidth;
  if (w < 640) return 2;   // mobile: 2 per row
  if (w < 1024) return 3;  // tablet: 3 per row
  return 4;                 // desktop: 4 per row
};

const SuggestionsSection = ({ content }: { content?: SiteContent[] }) => {
  const title = getContentValue(content, "suggestions", "title", "SUGGESTIONS FOR YOU");
  const { lang } = useLanguage();
  const { data: dynamicProducts } = useSuggestedProductsFull();

  const products = dynamicProducts?.length
    ? dynamicProducts.map((p: any) => ({
        name: lang === "en" ? (p.title_en || p.title_al) : (p.title_al || p.title_en),
        image: p.image_url || catBedroom,
        id: p.id,
        collectionSlug: p.collectionSlug || "all",
      }))
    : defaultProducts.map((def) => ({
        name: def.name,
        image: def.image,
        id: def.key,
        collectionSlug: "all",
      }));

  /* ── refs & state ──────────────────────────────────────────────── */
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);
  const [visibleCount, setVisibleCount] = useState(getVisibleCount);

  /* ── update visible count on resize ────────────────────────────── */
  useEffect(() => {
    const onResize = () => setVisibleCount(getVisibleCount());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ── sync scroll state ─────────────────────────────────────────── */
  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 0) {
      setScrollProgress(0);
      setCanLeft(false);
      setCanRight(false);
      return;
    }
    setScrollProgress(el.scrollLeft / max);
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft < max - 2);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const frame = requestAnimationFrame(sync);
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync, products.length]);

  /* ── slide by one card width ───────────────────────────────────── */
  const slide = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const cardWidth = (el.clientWidth - GAP * (visibleCount - 1)) / visibleCount;
    const step = cardWidth + GAP;
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  /* ── Mouse drag to scroll (desktop) ────────────────────────────── */
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const dragMoved = useRef(false);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = trackRef.current;
    if (!el) return;
    isDragging.current = true;
    dragMoved.current = false;
    dragStartX.current = e.pageX - el.offsetLeft;
    dragScrollLeft.current = el.scrollLeft;
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const el = trackRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - dragStartX.current) * 1.2;
    if (Math.abs(x - dragStartX.current) > 5) dragMoved.current = true;
    el.scrollLeft = dragScrollLeft.current - walk;
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
    const el = trackRef.current;
    if (!el) return;
    el.style.cursor = "grab";
    el.style.userSelect = "";
  }, []);

  const onMouseLeave = useCallback(() => {
    if (isDragging.current) onMouseUp();
  }, [onMouseUp]);

  const onClickCapture = useCallback((e: React.MouseEvent) => {
    if (dragMoved.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  /* ── scrollbar thumb ───────────────────────────────────────────── */
  const thumbW = Math.max(15, Math.min(50, (visibleCount / products.length) * 100));

  /* ── card width as CSS calc string (responsive) ────────────────── */
  const cardWidth = `calc((100% - ${(visibleCount - 1) * GAP}px) / ${visibleCount})`;

  /* ── whether there's content to scroll ─────────────────────────── */
  const hasOverflow = products.length > visibleCount;

  return (
    <section className="py-16 md:py-24">
      <style>{`
        .suggestions-track::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="container">
        {/* Title */}
        <h2 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light text-center mb-12">
          {title}
        </h2>

        {/* ── Top row: arrows ─────────────────────────────────────── */}
        {hasOverflow && (
          <div className="flex items-center justify-end gap-2 mb-4">
            <button
              onClick={() => slide("left")}
              disabled={!canLeft}
              aria-label="Scroll left"
              className={`
                w-10 h-10 md:w-11 md:h-11 rounded-full
                border border-border bg-white
                flex items-center justify-center
                transition-all duration-200
                ${canLeft
                  ? "opacity-100 hover:bg-foreground hover:text-white hover:border-foreground cursor-pointer active:scale-95"
                  : "opacity-40 cursor-not-allowed"
                }
              `}
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={2} />
            </button>
            <button
              onClick={() => slide("right")}
              disabled={!canRight}
              aria-label="Scroll right"
              className={`
                w-10 h-10 md:w-11 md:h-11 rounded-full
                border border-border bg-white
                flex items-center justify-center
                transition-all duration-200
                ${canRight
                  ? "opacity-100 hover:bg-foreground hover:text-white hover:border-foreground cursor-pointer active:scale-95"
                  : "opacity-40 cursor-not-allowed"
                }
              `}
            >
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        )}

        {/* ── Product track — full width of container ─────────────── */}
        <div
          ref={trackRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onClickCapture={onClickCapture}
          className="suggestions-track flex overflow-x-auto overscroll-x-contain snap-x snap-mandatory scroll-smooth cursor-grab select-none"
          style={{
            gap: `${GAP}px`,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {products.map((product) => (
            <a
              key={product.id}
              href={`/koleksionet/${product.collectionSlug}/${product.id}`}
              draggable={false}
              className="group shrink-0 snap-start"
              style={{ width: cardWidth }}
            >
              <div className="aspect-square overflow-hidden bg-secondary rounded-lg">
                <img
                  src={product.image}
                  alt={product.name}
                  draggable={false}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <p
                className="mt-3 text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2"
                style={{ textTransform: "none", letterSpacing: "normal" }}
              >
                {toTitleCase(product.name)}
              </p>
            </a>
          ))}
        </div>

        {/* ── Scrollbar indicator ─────────────────────────────────── */}
        {hasOverflow && (
          <div className="mt-8 mx-auto max-w-xl">
            <div className="h-[3px] bg-muted relative overflow-hidden rounded-full">
              <div
                className="absolute top-0 h-full bg-primary rounded-full transition-[left] duration-150 ease-out"
                style={{
                  width: `${thumbW}%`,
                  left: `${scrollProgress * (100 - thumbW)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SuggestionsSection;
