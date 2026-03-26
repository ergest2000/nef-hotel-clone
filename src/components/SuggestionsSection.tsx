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
];

/* gap in px — must match the CSS gap below */
const GAP = 24;

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
  const [arrowTop, setArrowTop] = useState(0); // px from track top

  /* ── sync scroll position ──────────────────────────────────────── */
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

  /* ── measure arrow vertical position (center of first image) ──── */
  const measureArrowPos = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const firstCard = el.querySelector("a");
    if (!firstCard) return;
    const img = firstCard.querySelector(".aspect-square");
    if (!img) return;
    const imgRect = (img as HTMLElement).getBoundingClientRect();
    const trackRect = el.getBoundingClientRect();
    setArrowTop(imgRect.top - trackRect.top + imgRect.height / 2);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    sync();
    measureArrowPos();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", () => { sync(); measureArrowPos(); });
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", () => { sync(); measureArrowPos(); });
    };
  }, [sync, measureArrowPos, products.length]);

  /* ── slide exactly one card + gap ──────────────────────────────── */
  const slide = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    const firstCard = el.querySelector("a");
    if (!firstCard) return;
    const cardWidth = firstCard.getBoundingClientRect().width;
    const step = cardWidth + GAP;
    el.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  /* ── scrollbar thumb ───────────────────────────────────────────── */
  const thumbW = Math.max(15, Math.min(40, 100 / Math.ceil(products.length / 4)));

  return (
    <section className="py-16 md:py-24">
      <div className="container">
        {/* Title */}
        <h2 className="text-xl md:text-2xl tracking-wide-brand text-foreground font-light text-center mb-12">
          {title}
        </h2>

        {/* Carousel wrapper — relative so arrows position off it */}
        <div className="relative">
          {/* ← Arrow */}
          <button
            onClick={() => slide("left")}
            aria-label="Scroll left"
            style={{ top: arrowTop || "35%" }}
            className={`absolute -left-5 md:-left-6 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border border-border shadow-md flex items-center justify-center transition-all duration-200 ${
              canLeft
                ? "opacity-100 hover:bg-foreground hover:text-white hover:border-foreground cursor-pointer"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <ChevronLeft size={20} />
          </button>

          {/* → Arrow */}
          <button
            onClick={() => slide("right")}
            aria-label="Scroll right"
            style={{ top: arrowTop || "35%" }}
            className={`absolute -right-5 md:-right-6 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border border-border shadow-md flex items-center justify-center transition-all duration-200 ${
              canRight
                ? "opacity-100 hover:bg-foreground hover:text-white hover:border-foreground cursor-pointer"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <ChevronRight size={20} />
          </button>

          {/* Product track */}
          <div
            ref={trackRef}
            className="flex overflow-x-auto overscroll-x-contain snap-x snap-mandatory scroll-smooth"
            style={{
              gap: `${GAP}px`,
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {/* Hide native webkit scrollbar */}
            <style>{`
              .suggestions-track::-webkit-scrollbar { display: none; }
            `}</style>

            {products.map((product) => (
              <a
                key={product.id}
                href={`/koleksionet/${product.collectionSlug}/${product.id}`}
                className="group shrink-0 snap-start"
                style={{
                  width: "calc((100% - 3 * 24px) / 4)",    /* 4 cards desktop */
                  minWidth: "200px",                         /* mobile fallback */
                }}
              >
                <div className="aspect-square overflow-hidden bg-secondary">
                  <img
                    src={product.image}
                    alt={product.name}
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

          {/* Scrollbar indicator */}
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
        </div>
      </div>
    </section>
  );
};

export default SuggestionsSection;
